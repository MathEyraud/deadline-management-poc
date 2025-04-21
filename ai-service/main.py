"""
Service IA pour l'application de gestion d'échéances
---------------------------------------------------
Ce service expose une API FastAPI qui permet d'interagir avec un modèle de langage (LLM)
déployé localement via Ollama pour répondre aux requêtes en langage naturel concernant la gestion d'échéances.

Le service utilise:
- FastAPI pour l'API REST
- Pydantic pour la validation de données
- Ollama API pour l'inférence du modèle
- asyncio pour le traitement asynchrone
"""

# Import des bibliothèques standard
import os
import json
import logging
import asyncio
import time
from typing import List, Dict, Optional, Any, Union
from datetime import datetime, timedelta, timezone

# Import des bibliothèques externes
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
import uvicorn
import aiohttp

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("ai_service.log")
    ]
)
logger = logging.getLogger("ai_service")

# Définition des constantes
MAX_TOKENS = int(os.environ.get("MAX_TOKENS", "512"))
TEMPERATURE = float(os.environ.get("TEMPERATURE", "0.5"))
MAX_CONTEXT_ITEMS = int(os.environ.get("MAX_CONTEXT_ITEMS", "10"))

# Configuration Ollama
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "mistral")

# Initialisation de l'application FastAPI
app = FastAPI(
    title="Service IA pour la Gestion d'Échéances",
    description="API pour interagir avec un LLM via Ollama pour la gestion d'échéances",
    version="1.0.0"
)

# Ajout du middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèles Pydantic pour la validation des données

class MessageItem(BaseModel):
    """Un message dans une conversation"""
    role: str = Field(..., description="Le rôle de l'émetteur du message (user ou assistant)")
    content: str = Field(..., description="Le contenu du message")
    
    @validator('role')
    def validate_role(cls, v):
        if v not in ["user", "assistant", "system"]:
            raise ValueError("Le rôle doit être 'user', 'assistant' ou 'system'")
        return v

class DeadlineInfo(BaseModel):
    """Information sur une échéance pour enrichir le contexte"""
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    deadlineDate: datetime
    status: str
    priority: str
    projectId: Optional[str] = None
    projectName: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class UserInfo(BaseModel):
    """Informations sur l'utilisateur"""
    firstName: str
    lastName: str
    role: str
    department: Optional[str] = None

class ChatRequest(BaseModel):
    """Requête pour le chat"""
    query: str = Field(..., description="La requête en langage naturel")
    context: Optional[List[MessageItem]] = Field(None, description="Contexte de conversation précédent")
    deadlines: Optional[List[DeadlineInfo]] = Field(None, description="Échéances à inclure dans le contexte")
    user_id: Optional[str] = Field(None, description="ID de l'utilisateur")
    user_info: Optional[UserInfo] = Field(None, description="Informations sur l'utilisateur")

class PredictionRequest(BaseModel):
    """Requête pour l'analyse prédictive"""
    deadline_data: DeadlineInfo
    historical_data: Optional[List[DeadlineInfo]] = None
    user_id: Optional[str] = None
    user_info: Optional[UserInfo] = None

class ChatResponse(BaseModel):
    """Réponse du chat"""
    response: str = Field(..., description="La réponse générée par le modèle")
    processing_time: float = Field(..., description="Temps de traitement en secondes")

class PredictionResponse(BaseModel):
    """Réponse d'analyse prédictive"""
    completion_probability: float = Field(..., description="Probabilité de complétion dans les délais (0-1)")
    risk_factors: List[Dict[str, Any]] = Field(..., description="Facteurs de risque identifiés")
    recommendations: List[str] = Field(..., description="Recommandations pour améliorer les chances de complétion")
    processing_time: float = Field(..., description="Temps de traitement en secondes")

# Fonction pour vérifier si Ollama est disponible
async def check_ollama_status():
    """Vérifie si le service Ollama est disponible"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{OLLAMA_HOST}/api/tags") as response:
                if response.status == 200:
                    data = await response.json()
                    models = [model["name"] for model in data.get("models", [])]
                    logger.info(f"Modèles Ollama disponibles: {models}")
                    if OLLAMA_MODEL not in models:
                        logger.warning(f"Le modèle {OLLAMA_MODEL} n'est pas disponible dans Ollama")
                    return True, models
                else:
                    logger.error(f"Erreur lors de la vérification d'Ollama: {response.status}")
                    return False, []
    except Exception as e:
        logger.error(f"Impossible de se connecter à Ollama: {e}")
        return False, []

# Formatage du prompt pour le modèle
def format_prompt_mistral(
    query: str, 
    context: List[MessageItem] = None, 
    deadlines: List[DeadlineInfo] = None,
    user_info: UserInfo = None
) -> List[Dict[str, str]]:
    """
    Formate le prompt pour Mistral en incluant le contexte et les informations sur les échéances.
    
    Args:
        query: La requête utilisateur actuelle
        context: Historique de conversation (messages précédents)
        deadlines: Liste des échéances à inclure dans le contexte
        user_info: Informations sur l'utilisateur
        
    Returns:
        Liste de messages au format attendu par Ollama
    """
    # Construction du prompt système
    system_prompt = """[Speak in french] Tu es un assistant IA spécialisé dans la gestion d'échéances. Tu aides les utilisateurs à gérer leurs échéances, projets et délais.
Tu analyses les informations fournies et tu donnes des conseils pertinents, des analyses et des prédictions.
Ton objectif est d'aider l'utilisateur à mieux organiser son travail, à respecter ses délais et à prioriser ses tâches.
Tu dois toujours répondre en Français et être poli et professionnel.
Ne fais pas de suppositions sur les informations que tu n'as pas reçues.
Ne fais pas de remarques sur les informations que tu n'as pas reçues."""

    # Ajouter les informations utilisateur si disponibles
    if user_info:
        system_prompt += f"\n\nTu interagis avec {user_info.firstName} {user_info.lastName}, qui a le rôle de {user_info.role}"
        if user_info.department:
            system_prompt += f" dans le département {user_info.department}"
        system_prompt += "."

    # Ajouter les informations sur les échéances au système s'il y en a
    if deadlines and len(deadlines) > 0:
        now = datetime.now(timezone.utc)
        system_prompt += "\n\nInformations sur les échéances actuelles:"
        for i, deadline in enumerate(deadlines, 1):
            date_str = deadline.deadlineDate.strftime("%d/%m/%Y %H:%M")
            days_left = (deadline.deadlineDate - now).days
            status_emoji = "✅" if deadline.status.lower() in ["complétée", "terminée", "completed"] else "⏳"
            priority_emoji = {
                "critique": "🔴",
                "haute": "🟠",
                "moyenne": "🟡",
                "basse": "🟢"
            }.get(deadline.priority.lower(), "⚪")
            
            project_info = f" (Projet: {deadline.projectName})" if deadline.projectName else ""
            
            system_prompt += f"\n{i}. {status_emoji} {priority_emoji} '{deadline.title}'{project_info} - Échéance: {date_str} ({days_left} jours restants)"
            if deadline.description:
                system_prompt += f"\n   Description: {deadline.description}"

    # Construction des messages pour Ollama
    messages = []
    
    # Ajouter le message système
    messages.append({"role": "system", "content": system_prompt})
    
    # Ajouter le contexte de la conversation
    if context and len(context) > 0:
        logger.info(f"Utilisation d'un contexte de conversation avec {len(context)} messages")
        
        # Limiter le contexte au nombre max d'éléments si nécessaire
        limited_context = context[-MAX_CONTEXT_ITEMS:] if len(context) > MAX_CONTEXT_ITEMS else context
        
        # Si nous avons tronqué le contexte, on le log
        if len(context) > MAX_CONTEXT_ITEMS:
            logger.info(f"Contexte tronqué de {len(context)} à {MAX_CONTEXT_ITEMS} messages")
        
        # Ajouter chaque message du contexte
        for msg in limited_context:
            messages.append({"role": msg.role, "content": msg.content})
    else:
        logger.info("Aucun contexte de conversation fourni")
    
    # Ajouter la requête actuelle
    messages.append({"role": "user", "content": query})
    
    return messages

# Fonction de génération asynchrone via Ollama API
async def generate_response_ollama(messages) -> str:
    """
    Génère une réponse en utilisant l'API Ollama.
    
    Args:
        messages: Liste de messages formatés {"role": "...", "content": "..."}
        
    Returns:
        Texte de la réponse générée
    """
    try:
        url = f"{OLLAMA_HOST}/api/chat"
        payload = {
            "model": OLLAMA_MODEL,
            "messages": messages,
            "options": {
                "temperature": TEMPERATURE,
                "num_predict": MAX_TOKENS
            },
            "stream": False  # Important: désactiver le streaming pour obtenir une réponse JSON complète
        }
        
        logger.info(f"Envoi de la requête à Ollama: {url}")
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as response:
                if response.status == 200:
                    # Lire le contenu de la réponse comme texte puis parser en JSON
                    response_text = await response.text()
                    try:
                        data = json.loads(response_text)
                        return data["message"]["content"]
                    except json.JSONDecodeError:
                        # Si nous avons un format NDJSON (ligne par ligne), traiter chaque ligne
                        logger.info("Réponse au format NDJSON détectée, traitement ligne par ligne")
                        lines = response_text.strip().split('\n')
                        if lines and len(lines) > 0:
                            # Prendre la dernière ligne qui contient généralement la réponse complète
                            try:
                                last_data = json.loads(lines[-1])
                                if "message" in last_data and "content" in last_data["message"]:
                                    return last_data["message"]["content"]
                            except:
                                pass
                        
                        # Si tout échoue, renvoyer le texte brut
                        logger.warning(f"Impossible de parser la réponse JSON, renvoi du texte brut")
                        return response_text
                else:
                    error_text = await response.text()
                    logger.error(f"Erreur Ollama {response.status}: {error_text}")
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Erreur lors de la génération via Ollama: {error_text}"
                    )
    except aiohttp.ClientError as e:
        logger.error(f"Erreur de connexion à Ollama: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Impossible de se connecter à Ollama: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Erreur inattendue avec Ollama: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur inattendue: {str(e)}"
        )

# Vérification de l'état d'Ollama au démarrage
@app.on_event("startup")
async def startup_event():
    """Vérification de l'état d'Ollama au démarrage"""
    ollama_available, models = await check_ollama_status()
    if not ollama_available:
        logger.warning("Ollama n'est pas disponible. Le service fonctionnera en mode dégradé.")
    else:
        logger.info(f"Ollama est disponible avec les modèles: {models}")

# Endpoint pour le healthcheck
@app.get("/health")
async def health_check():
    """Endpoint de healthcheck pour vérifier que le service est actif"""
    ollama_available, models = await check_ollama_status()
    
    return {
        "status": "ok" if ollama_available else "dégradé",
        "ollama": {
            "available": ollama_available,
            "models": models,
            "selected_model": OLLAMA_MODEL,
            "host": OLLAMA_HOST
        },
        "version": "1.0.0"
    }

# Endpoint pour le chat
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Endpoint pour interagir avec le modèle en mode chat.
    
    - query: La question ou instruction de l'utilisateur
    - context: Historique de conversation (messages précédents)
    - deadlines: Informations sur les échéances pour enrichir le contexte
    - user_id: Identifiant de l'utilisateur
    - user_info: Informations sur l'utilisateur
    """
    start_time = time.time()
    
    try:
        # Log du nombre de messages de contexte reçus
        context_count = len(request.context) if request.context else 0
        logger.info(f"Requête chat reçue avec {context_count} messages de contexte")
        
        # Formater les messages pour Ollama
        messages = format_prompt_mistral(
            query=request.query,
            context=request.context,
            deadlines=request.deadlines,
            user_info=request.user_info
        )
        
        # Générer la réponse via Ollama
        response_text = await generate_response_ollama(messages)
        
        # Calculer le temps de traitement
        processing_time = time.time() - start_time
        logger.info(f"Réponse générée en {processing_time:.2f} secondes")
        
        return ChatResponse(
            response=response_text,
            processing_time=processing_time
        )
    
    except Exception as e:
        logger.error(f"Erreur lors de la génération de réponse: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération de réponse: {str(e)}")

# Endpoint pour les prédictions
@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Endpoint pour l'analyse prédictive des échéances.
    
    Utilise le modèle pour prédire la probabilité de complétion d'une échéance
    et fournir des recommandations.
    """
    start_time = time.time()
    now = datetime.now(timezone.utc)
    
    try:
        # Formater la demande pour le modèle
        date_str = request.deadline_data.deadlineDate.strftime("%d/%m/%Y %H:%M")
        days_left = (request.deadline_data.deadlineDate - now).days
        
        # Personnalisation selon l'utilisateur
        user_greeting = ""
        if request.user_info:
            user_greeting = f"Analyse pour {request.user_info.firstName} {request.user_info.lastName} ({request.user_info.role}): "
        
        query = f"""{user_greeting}Analyse cette échéance et prédit sa probabilité de complétion dans les délais.
        
Échéance: {request.deadline_data.title}
Description: {request.deadline_data.description or 'Non spécifiée'}
Date d'échéance: {date_str} (dans {days_left} jours)
Priorité: {request.deadline_data.priority}
Statut: {request.deadline_data.status}

Basé sur ces informations:
1. Quelle est la probabilité (entre 0 et 1) que cette échéance soit complétée à temps?
2. Quels sont les facteurs de risque?
3. Quelles recommandations donnerais-tu pour augmenter les chances de complétion?

Réponds au format JSON avec les champs "completion_probability", "risk_factors" et "recommendations".
"""
        
        # Générer la réponse
        messages = [
            {"role": "system", "content": "Tu es un assistant spécialisé dans l'analyse prédictive d'échéances"},
            {"role": "user", "content": query}
        ]
        response_text = await generate_response_ollama(messages)
        
        # Extraire les informations de la réponse (recherche d'un JSON valide)
        json_start = response_text.find("{")
        json_end = response_text.rfind("}")
        
        if json_start != -1 and json_end != -1:
            json_str = response_text[json_start:json_end+1]
            try:
                prediction_data = json.loads(json_str)
                
                # Valider et normaliser les données
                completion_probability = float(prediction_data.get("completion_probability", 0.5))
                # Limiter entre 0 et 1
                completion_probability = max(0, min(1, completion_probability))
                
                risk_factors = prediction_data.get("risk_factors", [])
                if isinstance(risk_factors, str):
                    risk_factors = [{"factor": risk_factors, "impact": "medium"}]
                elif isinstance(risk_factors, list) and all(isinstance(rf, str) for rf in risk_factors):
                    risk_factors = [{"factor": rf, "impact": "medium"} for rf in risk_factors]
                
                recommendations = prediction_data.get("recommendations", [])
                if isinstance(recommendations, str):
                    recommendations = [recommendations]
                
                # Calculer le temps de traitement
                processing_time = time.time() - start_time
                
                return PredictionResponse(
                    completion_probability=completion_probability,
                    risk_factors=risk_factors,
                    recommendations=recommendations,
                    processing_time=processing_time
                )
            
            except json.JSONDecodeError:
                # Fallback si le JSON n'est pas valide
                logger.warning("Impossible de parser le JSON du modèle, utilisation d'une analyse heuristique")
        
        # Fallback : analyse heuristique si le JSON n'est pas valide ou n'est pas présent
        # Extraire probabilité avec une regex basique
        import re
        prob_match = re.search(r"probabilité.*?(\d+(?:\.\d+)?)", response_text, re.IGNORECASE)
        probability = float(prob_match.group(1))/100 if prob_match else 0.5
        
        # Extraire risques et recommandations par des heuristiques simples
        factors_section = extract_section(response_text, ["facteurs", "risques"])
        factors = parse_list_items(factors_section) if factors_section else ["Délai serré"]
        
        recommendations_section = extract_section(response_text, ["recommandations", "suggestions"])
        recommendations = parse_list_items(recommendations_section) if recommendations_section else ["Planifier les étapes"]
        
        risk_factors = [{"factor": factor, "impact": "medium"} for factor in factors]
        
        # Calculer le temps de traitement
        processing_time = time.time() - start_time
        
        return PredictionResponse(
            completion_probability=probability,
            risk_factors=risk_factors,
            recommendations=recommendations,
            processing_time=processing_time
        )
    
    except Exception as e:
        logger.error(f"Erreur lors de la prédiction: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Erreur lors de la prédiction: {str(e)}")

# Fonctions utilitaires pour le fallback
def extract_section(text, keywords):
    """Extrait une section basée sur des mots-clés"""
    import re
    patterns = [
        rf"({'|'.join(keywords)}).*?\n(.*?)(?:\n\n|\n[A-Z0-9]|$)",
        rf"({'|'.join(keywords)}).*?:(.*?)(?:\n\n|\n[A-Z0-9]|$)"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if match:
            return match.group(2).strip()
    return ""

def parse_list_items(text):
    """Parse les éléments d'une liste depuis un texte"""
    import re
    # Essayer d'extraire des items numérotés ou avec puces
    items = re.findall(r"(?:^|\n)[\s]*(?:\d+\.|-|\*|\•)[\s]*(.*?)(?:\n|$)", text)
    
    # Si aucun item n'est trouvé, diviser par lignes
    if not items:
        items = [line.strip() for line in text.split("\n") if line.strip()]
    
    # S'il n'y a toujours rien, retourner le texte comme un seul élément
    if not items:
        items = [text]
    
    return items

# Endpoint pour tester directement Ollama
@app.post("/test_ollama")
async def test_ollama(prompt: str = "Comment améliorer la gestion d'échéances?"):
    """Endpoint de test pour vérifier la connexion à Ollama"""
    try:
        messages = [
            {"role": "user", "content": prompt}
        ]
        response = await generate_response_ollama(messages)
        return {"success": True, "response": response}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Point d'entrée
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )