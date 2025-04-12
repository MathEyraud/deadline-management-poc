# Utilisation de Python 3.11 comme image de base
FROM python:3.11-slim

# Définition des variables d'environnement
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    MODEL_DIR=/app/models \
    DEFAULT_MODEL=mistral-7b-instruct-v0.2.Q4_K_M.gguf \
    GPU_LAYERS=0 \
    MAX_TOKENS=512 \
    TEMPERATURE=0.5 \
    MAX_CONTEXT_ITEMS=10 \
    MODEL_CTX_SIZE=2048

# Définition du répertoire de travail
WORKDIR /app

# Installation des dépendances système nécessaires
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copie des fichiers de dépendances
COPY requirements.txt .

# Installation des dépendances Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Création du répertoire pour les modèles
RUN mkdir -p /app/models

# Copie du code source
COPY *.py /app/
COPY .env /app/

# Instruction pour télécharger le modèle (si nécessaire)
# Décommentez cette ligne si vous souhaitez télécharger le modèle dans l'image
# RUN python -c "import os, urllib.request; urllib.request.urlretrieve('https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf', os.path.join('/app/models', 'mistral-7b-instruct-v0.2.Q4_K_M.gguf'))"

# Note: en production, vous voudriez plutôt monter un volume avec le modèle
# pour éviter d'alourdir l'image Docker

# Exposition du port
EXPOSE 8000

# Commande de démarrage du serveur
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]