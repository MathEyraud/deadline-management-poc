# Implémentation de l'historique des conversations pour le service IA

## Vue d'ensemble

Cette implémentation ajoute la gestion et le stockage persistant des conversations entre les utilisateurs et le service IA dans notre application de gestion d'échéances. 
Auparavant, chaque interaction avec l'IA était isolée, sans mémoire des échanges précédents. 
Les nouvelles fonctionnalités permettent aux utilisateurs d'avoir des conversations contextuelles avec l'IA, de consulter leur historique de conversations et de reprendre des conversations existantes.

## Composants principaux

### 1. Modèle de données pour les conversations (`AiConversation`)

Un nouveau modèle de données a été créé pour stocker les conversations et leurs messages:

- **Conversation**: Représente un échange complet entre un utilisateur et l'IA
  - ID unique
  - Titre
  - Référence à l'utilisateur
  - État d'activité (active ou archivée)
  - Dates de création et de dernière mise à jour

- **Messages**: Stockés sous forme de tableau JSON dans la conversation
  - Rôle (utilisateur ou assistant)
  - Contenu du message
  - Horodatage

### 2. Service de gestion des conversations (`ConversationsService`)

Un service complet pour gérer les opérations sur les conversations:

- Création de nouvelles conversations
- Récupération de conversations existantes
- Mise à jour du titre ou de l'état d'une conversation
- Ajout de messages à une conversation
- Archivage et suppression de conversations

### 3. Contrôleur REST pour les conversations (`ConversationsController`)

Un contrôleur qui expose des endpoints RESTful pour toutes les opérations sur les conversations:

- `GET /conversations`: Liste les conversations de l'utilisateur
- `POST /conversations`: Crée une nouvelle conversation
- `GET /conversations/:id`: Récupère une conversation spécifique
- `PATCH /conversations/:id`: Met à jour une conversation
- `DELETE /conversations/:id`: Supprime une conversation
- `GET /conversations/:id/messages`: Récupère les messages d'une conversation
- `POST /conversations/:id/messages`: Ajoute un message à une conversation
- `PATCH /conversations/:id/archive`: Archive une conversation

### 4. Extension du service IA existant (`AiServiceService`)

Le service IA a été étendu pour:

- Créer automatiquement des conversations lors des requêtes
- Ajouter les messages utilisateur et les réponses de l'IA à l'historique
- Utiliser l'historique des messages comme contexte pour les nouvelles requêtes
- Permettre la continuation de conversations existantes via leur ID

### 5. DTOs et extensions de l'API IA

- `AiQueryDto`: Étendu pour inclure un champ `conversationId` optionnel
- Réponse de l'API: Inclut désormais des informations sur la conversation utilisée

## Flux de travail typique

1. **Première interaction**: L'utilisateur envoie une requête à l'IA
   - Une nouvelle conversation est créée automatiquement si `saveToHistory` est `true`
   - La requête et la réponse sont enregistrées comme messages

2. **Requêtes suivantes**: L'utilisateur continue la conversation
   - Il fournit le `conversationId` de la conversation précédente
   - Le système récupère tout l'historique des messages
   - Cet historique est transmis au service IA comme contexte
   - La nouvelle requête et la réponse sont ajoutées à la conversation

3. **Gestion des conversations**: L'utilisateur peut
   - Consulter la liste de ses conversations précédentes
   - Reprendre une conversation existante
   - Archiver ou supprimer des conversations terminées

## Aspects techniques

### Structure de la base de données

Une nouvelle table `ai_conversations` a été ajoutée avec les champs:
- `id` (UUID)
- `title` (varchar)
- `userId` (UUID, clé étrangère vers users)
- `messages` (JSON)
- `createdAt` (datetime)
- `updatedAt` (datetime)
- `isActive` (boolean)

### Format du tableau de messages JSON

```json
[
  {
    "role": "user",
    "content": "Quelles sont mes échéances cette semaine?",
    "timestamp": "2025-04-19T14:30:22.123Z"
  },
  {
    "role": "assistant",
    "content": "Vous avez 3 échéances cette semaine...",
    "timestamp": "2025-04-19T14:30:24.456Z"
  }
]
```

### Sécurité

- Toutes les routes sont protégées par `JwtAuthGuard`
- Vérification de propriété: un utilisateur ne peut accéder qu'à ses propres conversations
- Validation des données avec class-validator

### Intégration avec le service IA Python

- Transmission de l'historique complet des messages comme contexte
- Aucune modification requise côté Python si le service accepte déjà le champ `context`
- Pour une expérience optimale, le service Python devrait prendre en compte tout le contexte

## Bénéfices principaux

1. **Amélioration de l'expérience utilisateur**:
   - Conversations naturelles et contextuelles avec l'IA
   - Possibilité de faire référence à des éléments mentionnés précédemment

2. **Continuité des interactions**:
   - Les utilisateurs peuvent reprendre des conversations précédentes
   - Pas besoin de répéter les informations déjà fournies

3. **Historique et traçabilité**:
   - Conservation des échanges pour référence future
   - Possibilité d'auditer les conseils fournis par l'IA

4. **Gestion organisée**:
   - Séparation des conversations par sujet
   - Archivage des discussions terminées

## Prochaines étapes potentielles

1. Implémenter la recherche dans les conversations
2. Ajouter des étiquettes ou catégories aux conversations
3. Permettre le partage de conversations entre utilisateurs
4. Intégrer une fonctionnalité d'export (PDF, texte)
5. Ajouter une purge automatique des conversations anciennes ou inactives