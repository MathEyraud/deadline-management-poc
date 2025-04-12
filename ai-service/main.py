"""
Service IA pour l'application de gestion d'échéances
---------------------------------------------------
Ce service expose une API FastAPI qui permet d'interagir avec un modèle de langage (LLM)
déployé localement pour répondre aux requêtes en langage naturel concernant la gestion d'échéances.

Le service utilise:
- FastAPI pour l'API REST
- Pydantic pour la validation de données
- ctransformers/llama-cpp-python pour l'inférence locale du modèle
- asyncio pour le traitement asynchrone
"""

# Import des bibliothèques standard
import os
import json
import logging
import asyncio
import time
from typing import List, Dict, Optional, Any, Union
from datetime import datetime, timedelta

# Import des bibliothèques externes
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
import uvicorn

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
MODEL_DIR = os.environ.get("MODEL_DIR", "models")
DEFAULT_MODEL = os.environ.get(
    "DEFAULT_MODEL", 
    "mistral-7b-instruct-v0.2.Q4_K_M.gguf"
)
MODEL_PATH = os.path.join(MODEL_DIR, DEFAULT_MODEL)
GPU_LAYERS = int(os.environ.get("GPU_LAYERS", "0"))  # Nombre de couches à exécuter sur GPU
MAX_TOKENS = int(os.environ.get("MAX_TOKENS", "1024"))  # Nombre maximum de tokens générés
TEMPERATURE = float(os.environ.get("TEMPERATURE", "0.7"))  # Température pour la génération
MAX_CONTEXT_ITEMS = int(os.environ.get("MAX_CONTEXT_ITEMS", "10"))  # Nombre max d'items dans le contexte

# Vérification du backend disponible
try:
    from llama_cpp import Llama
    BACKEND = "llama_cpp"
    logger.info("Utilisation du backend llama-cpp-python")
except ImportError:
    try:
        from ctransformers import AutoModelForCausalLM
        BACKEND = "ctransformers"
        logger.info("Utilisation du backend ctransformers")
    except ImportError:
        logger.error("Aucun backend d'inférence trouvé. Veuillez installer llama-cpp-python ou ctransformers.")
        raise ImportError("Aucun backend d'inférence trouvé. Veuillez installer llama-cpp-python ou ctransformers.")

# Initialisation de l'application FastAPI
app = FastAPI(
    title="Service IA pour la Gestion d'Échéances",
    description="API pour interagir avec un LLM local pour la gestion d'échéances",
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

class ChatRequest(BaseModel):
    """Requête pour le chat"""
    query: str = Field(..., description="La requête en langage naturel")
    context: Optional[List[MessageItem]] = Field(None, description="Contexte de conversation précédent")
    deadlines: Optional[List[DeadlineInfo]] = Field(None, description="Échéances à inclure dans le contexte")
    user_id: Optional[str] = Field(None, description="ID de l'utilisateur")

class PredictionRequest(BaseModel):
    """Requête pour l'analyse prédictive"""
    deadline_data: DeadlineInfo
    historical_data: Optional[List[DeadlineInfo]] = None
    user_id: Optional[str] = None

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

# Variables globales
model = None
model_loading = False
model_last_used = datetime.now()

# Fonction pour charger le modèle
async def load_model():
    global model, model_loading
    
    if model is not None:
        return model
    
    if model_loading:
        # Attendre que le modèle soit chargé par un autre processus
        while model_loading and model is None:
            await asyncio.sleep(1)
        return model
    
    model_loading = True
    logger.info(f"Chargement du modèle depuis {MODEL_PATH}")
    
    try:
        if BACKEND == "llama_cpp":
            model = Llama(
                model_path=MODEL_PATH,
                n_gpu_layers=GPU_LAYERS,
                n_ctx=2048,
                verbose=False
            )
        else:  # ctransformers
            model_type = "mistral" if "mistral" in MODEL_PATH.lower() else "llama"
            model = AutoModelForCausalLM.from_pretrained(
                MODEL_PATH,
                model_type=model_type,
                gpu_layers=GPU_LAYERS
            )
        logger.info("Modèle chargé avec succès")
    except Exception as e:
        model_loading = False
        logger.error(f"Erreur lors du chargement du modèle: {e}")
        raise e
    
    model_loading = False
    model_last_used = datetime.now()
    return model

# Middleware pour vérifier la disponibilité du modèle
@app.middleware("http")
async def check_model_middleware(request: Request, call_next):
    if request.url.path in ['/chat', '/predict']:
        try:
            await load_model()
        except Exception as e:
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={"detail": f"Erreur lors du chargement du modèle: {str(e)}"}
            )
    return await call_next(request)

# Formatage du prompt pour le modèle Mistral
def format_prompt_mistral(query: str, context: List[MessageItem] = None, deadlines: List[DeadlineInfo] = None) -> str:
    """
    Formate le prompt pour Mistral Instruct en incluant le contexte et les informations sur les échéances.
    """
    system_prompt = """Tu es un assistant IA spécialisé dans la gestion d'échéances. Tu aides les utilisateurs à gérer leurs échéances, projets et délais.
Tu analyses les informations fournies et tu donnes des conseils pertinents, des analyses et des prédictions.
Ton objectif est d'aider l'utilisateur à mieux organiser son travail, à respecter ses délais et à prioriser ses tâches."""

    # Ajouter les informations sur les échéances au système s'il y en a
    if deadlines and len(deadlines) > 0:
        system_prompt += "\n\nInformations sur les échéances actuelles:"
        for i, deadline in enumerate(deadlines, 1):
            date_str = deadline.deadlineDate.strftime("%d/%m/%Y %H:%M")
            days_left = (deadline.deadlineDate - datetime.now()).days
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

    # Construction des messages de contexte
    messages = []
    
    # Ajouter le message système
    messages.append({"role": "system", "content": system_prompt})
    
    # Ajouter le contexte de la conversation
    if context:
        # Limiter le contexte au nombre max d'éléments
        limited_context = context[-MAX_CONTEXT_ITEMS:] if len(context) > MAX_CONTEXT_ITEMS else context
        messages.extend([{"role": msg.role, "content": msg.content} for msg in limited_context])
    
    # Ajouter la requête actuelle
    messages.append({"role": "user", "content": query})
    
    # Formatter pour Mistral
    prompt = ""
    for msg in messages:
        if msg["role"] == "system":
            # Pour Mistral, le message système est inclus dans le premier message user
            continue
        elif msg["role"] == "user":
            # Si c'est le premier message user, inclure le système
            if prompt == "":
                system_content = next((m["content"] for m in messages if m["role"] == "system"), "")
                prompt += f"<s>[INST] {system_content}\n\n{msg['content']} [/INST]"
            else:
                prompt += f"<s>[INST] {msg['content']} [/INST]"
        else:  # assistant
            prompt += f" {msg['content']} </s>"
    
    return prompt

# Fonction de génération asynchrone
async def generate_response(prompt: str) -> str:
    """Génère une réponse à partir du prompt en utilisant le modèle approprié"""
    global model, model_last_used
    
    # Assurer que le modèle est chargé
    if model is None:
        await load_model()
    
    # Mettre à jour le timestamp d'utilisation
    model_last_used = datetime.now()
    
    # Génération selon le backend
    if BACKEND == "llama_cpp":
        # llama-cpp est synchrone, donc on l'exécute dans un thread séparé
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: model(
                prompt,
                max_tokens=MAX_TOKENS,
                temperature=TEMPERATURE,
                stop=["</s>", "[INST]"],
                echo=False
            )
        )
        return response["choices"][0]["text"].strip()
    else:
        # ctransformers est synchrone
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: model(
                prompt,
                max_new_tokens=MAX_TOKENS,
                temperature=TEMPERATURE
            )
        )
        
        # Extraire la réponse après [/INST]
        response_text = response.split("[/INST]")[-1].strip()
        # Nettoyer la fin de la génération
        for end_token in ["</s>", "<s>", "[INST]"]:
            if end_token in response_text:
                response_text = response_text.split(end_token)[0].strip()
        
        return response_text

# Tâche de fond pour décharger le modèle après inactivité
async def unload_model_task():
    global model, model_last_used
    while True:
        await asyncio.sleep(60)  # Vérifier toutes les minutes
        if model is not None and (datetime.now() - model_last_used) > timedelta(minutes=30):
            logger.info("Déchargement du modèle après 30 minutes d'inactivité")
            model = None
            import gc
            gc.collect()

# Démarrage des tâches de fond
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(unload_model_task())

# Endpoint pour le healthcheck
@app.get("/health")
async def health_check():
    """Endpoint de healthcheck pour vérifier que le service est actif"""
    return {
        "status": "ok",
        "model": {
            "loaded": model is not None,
            "path": MODEL_PATH,
            "backend": BACKEND
        },
        "version": "1.0.0"
    }

# Endpoint pour le chat
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Endpoint pour interagir avec le modèle en mode chat.
    
    - query: La question ou instruction de l'utilisateur
    - context: Historique de conversation optionnel
    - deadlines: Informations sur les échéances pour enrichir le contexte
    """
    start_time = time.time()
    
    try:
        # Formater le prompt
        prompt = format_prompt_mistral(
            query=request.query,
            context=request.context,
            deadlines=request.deadlines
        )
        
        # Générer la réponse
        response_text = await generate_response(prompt)
        
        # Calculer le temps de traitement
        processing_time = time.time() - start_time
        
        return ChatResponse(
            response=response_text,
            processing_time=processing_time
        )
    
    except Exception as e:
        logger.error(f"Erreur lors de la génération de réponse: {e}")
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
    
    try:
        # Formater la demande pour le modèle
        date_str = request.deadline_data.deadlineDate.strftime("%d/%m/%Y %H:%M")
        days_left = (request.deadline_data.deadlineDate - datetime.now()).days
        
        query = f"""Analyse cette échéance et prédit sa probabilité de complétion dans les délais.
        
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
        response_text = await generate_response(format_prompt_mistral(query))
        
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
        raise HTTPException(status_code=500, detail=f"Erreur lors de la prédiction: {str(e)}")

# Fonctions utilitaires pour le fallback
def extract_section(text, keywords):
    """Extrait une section basée sur des mots-clés"""
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
    # Essayer d'extraire des items numérotés ou avec puces
    items = re.findall(r"(?:^|\n)[\s]*(?:\d+\.|-|\*|\•)[\s]*(.*?)(?:\n|$)", text)
    
    # Si aucun item n'est trouvé, diviser par lignes
    if not items:
        items = [line.strip() for line in text.split("\n") if line.strip()]
    
    # S'il n'y a toujours rien, retourner le texte comme un seul élément
    if not items:
        items = [text]
    
    return items

# Point d'entrée
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )