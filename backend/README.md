# Backend de l'Application de Gestion d'Échéances

Backend API RESTful pour l'application de gestion d'échéances, développé avec Nest.js et TypeScript.

## Description

Ce projet fournit une API backend complète pour gérer des échéances, projets, équipes et utilisateurs dans un environnement sécurisé. L'application inclut des fonctionnalités de sécurité avancées et une intégration avec un service d'intelligence artificielle.

## Fonctionnalités principales

- ✅ Gestion complète des échéances avec priorisation et statuts
- ✅ Organisation en projets et équipes
- ✅ Système de commentaires et pièces jointes
- ✅ Authentification JWT sécurisée avec contrôle d'accès basé sur les rôles
- ✅ Intégration avec un service IA pour l'assistance conversationnelle
- ✅ Documentation API complète avec Swagger

## Prérequis

- Node.js (v16+)
- npm (v7+)
- Git

## Installation

1. Cloner le dépôt
```bash
git clone https://github.com/votre-organisation/deadline-management-backend.git
cd deadline-management-backend
```

2. Installer les dépendances
```bash
npm install
```

3. Créer un fichier `.env` à la racine du projet
```
JWT_SECRET=votre_secret_jwt_securise
AI_SERVICE_URL=http://localhost:8000/chat
```

4. Initialiser la base de données avec des données de test (optionnel)
```bash
npm run seed
```

5. Lancer le serveur
```bash
# Mode développement
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

Le serveur sera disponible sur http://localhost:3000

## Documentation API

Une documentation Swagger complète est disponible à l'adresse : http://localhost:3000/api

## Structure du projet

```
backend/
├── src/                        # Code source de l'application
│   ├── auth/                   # Module d'authentification
│   ├── users/                  # Module utilisateurs
│   ├── deadlines/              # Module échéances
│   ├── projects/               # Module projets
│   ├── teams/                  # Module équipes
│   ├── comments/               # Module commentaires
│   ├── attachments/            # Module pièces jointes
│   ├── ai-service/             # Module d'intégration avec l'IA
│   └── common/                 # Utilitaires et services communs
├── uploads/                    # Dossier pour stocker les fichiers
└── data/                       # Dossier pour la base de données
```

## Modèle de données

L'application gère les entités principales suivantes :

- **Utilisateurs** (Users) - Gestion des identités avec rôles et permissions
- **Échéances** (Deadlines) - Tâches avec dates limites, priorités et statuts
- **Projets** (Projects) - Regroupement des échéances
- **Équipes** (Teams) - Groupes d'utilisateurs travaillant ensemble
- **Commentaires** (Comments) - Discussions sur les échéances
- **Pièces jointes** (Attachments) - Documents associés aux échéances

## Utilisation de l'API

### Authentification

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

### Création d'une échéance

```bash
curl -X POST http://localhost:3000/deadlines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Réunion stratégique",
    "description": "Planification du trimestre",
    "deadlineDate": "2025-05-15T14:00:00.000Z",
    "creatorId": "USER_ID",
    "priority": "haute",
    "status": "nouvelle",
    "visibility": "équipe",
    "projectId": "PROJECT_ID"
  }'
```

## Intégration

### Avec le frontend Next.js

Le backend est configuré pour accepter les requêtes CORS depuis http://localhost:3001

### Avec le service IA Python

L'application peut communiquer avec un service IA Python déployé sur http://localhost:8000 pour fournir des fonctionnalités d'assistant conversationnel.

### Avec N8N

Connectez N8N à ce backend via les webhooks pour automatiser les workflows comme les rappels d'échéances.

## Sécurité

- Authentification JWT avec expiration des tokens
- Hachage des mots de passe avec bcrypt
- Validation des entrées contre les injections
- Contrôle d'accès basé sur les rôles

## Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture de tests
npm run test:cov
```

## Développement

```bash
# Générer un nouveau module
nest generate module nom-module

# Générer un nouveau contrôleur
nest generate controller nom-controleur

# Générer un nouveau service
nest generate service nom-service
```

## Déploiement

Pour un déploiement en production, il est recommandé de :

1. Utiliser une base de données robuste (PostgreSQL, MySQL)
2. Configurer un proxy inverse sécurisé (Nginx, Apache)
3. Utiliser PM2 ou un service similaire pour la gestion des processus
4. Mettre en place un monitoring (logs, performances)

## Équipe de développement

Ce projet a été développé dans le cadre d'un POC pour une application de gestion d'échéances.

---
