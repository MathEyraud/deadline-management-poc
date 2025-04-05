# Importation des bibliothèques nécessaires
from fastapi import FastAPI, HTTPException      # Framework web pour API
from pydantic import BaseModel                  # Validation des données
from typing import List, Optional               # Types pour les annotations
import uvicorn                                  # Serveur ASGI pour exécuter FastAPI
import os                                       # Manipulation des chemins de fichiers
from ctransformers import AutoModelForCausalLM  # Bibliothèque légère pour inférence de modèles LLM

# Création de l'application FastAPI
app = FastAPI(title="AI Assistant Service")

# Définition du chemin vers le modèle Mistral 7B quantifié
MODEL_PATH = os.path.join("models", "mistral-7b-instruct-v0.2.Q4_K_M.gguf")
# Alternative pour configurations avec RAM limitée
# MODEL_PATH = os.path.join("models", "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf")

# Variable qui contiendra le modèle chargé
model = None

# Définition de la structure de la requête avec Pydantic
class ChatRequest(BaseModel):
    query: str                              # La question ou l'instruction de l'utilisateur
    context: Optional[List[dict]] = None    # Contexte optionnel (historique de conversation, etc.)

# Définition de la structure de la réponse
class ChatResponse(BaseModel):
    response: str  # La réponse générée par le modèle

# Événement exécuté au démarrage de l'application
@app.on_event("startup")
async def startup_event():
    global model
    try:
        # Chargement du modèle en mémoire lors du démarrage
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_PATH,
            model_type="mistral" if "mistral" in MODEL_PATH else "llama",
            gpu_layers=50  # 0 : Utilise le CPU uniquement. 32-36 couches (Mistral 7B) : Utilise le GPU 
        )
    except Exception as e:
        print(f"Erreur lors du chargement du modèle: {e}")

# Définition de l'endpoint /chat qui accepte des requêtes POST
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # Vérification que le modèle est bien chargé
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Formatage de la requête selon le format attendu par Mistral Instruct
    prompt = f"<s>[INST] {request.query} [/INST]"
    
    try:
        # Génération de la réponse avec un maximum de 512 nouveaux tokens
        response = model(prompt, max_new_tokens=512)
        # Extraction de la partie pertinente de la réponse (après l'instruction)
        response_clean = response.split("[/INST]")[-1].strip()
        return ChatResponse(response=response_clean)
    except Exception as e:
        # Gestion des erreurs pendant la génération
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

# Point d'entrée pour l'exécution directe du script
if __name__ == "__main__":
    # Lancement du serveur sur localhost:8000 avec rechargement automatique
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)