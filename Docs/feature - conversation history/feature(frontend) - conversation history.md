# Documentation d'implémentation : Système d'historique des conversations IA

## Introduction

Cette documentation détaille l'implémentation du système d'historique des conversations avec l'assistant IA dans l'application de gestion d'échéances. 
Elle présente l'architecture, les composants, les flux de données et les interactions utilisateur qui ont été mis en place pour permettre aux utilisateurs de conserver, consulter et gérer leurs conversations avec l'assistant IA.

## Vue d'ensemble

Le nouveau système permet de sauvegarder de manière persistante les conversations et les messages échangés avec l'assistant IA. Les utilisateurs peuvent désormais :

- Créer, consulter, modifier et supprimer des conversations
- Reprendre des conversations précédentes
- Archiver des conversations pour les organiser
- Rechercher parmi leurs conversations
- Naviguer facilement dans leur historique

## Modifications apportées

### 1. Nouveaux types de données

Nous avons enrichi le système de types pour prendre en charge les conversations et les messages :

```typescript
// Types pour les conversations
export interface Conversation {
  id: string;
  title: string;
  userId: string;
  messages?: Message[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  message_count?: number;
}

// Types pour les messages
export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Extension de la requête IA pour supporter les conversations
export interface AIQuery {
  query: string;
  context?: AIMessageContext[];
  includeDeadlines?: boolean;
  saveToHistory?: boolean;
  conversationId?: string; // Nouveau paramètre
}

// Extension de la réponse IA pour inclure les informations de conversation
export interface AIResponse {
  response: string;
  processing_time: number;
  timestamp: string;
  conversation?: { // Nouveau champ
    id: string;
    message_count: number;
  };
}
```

### 2. Service API pour les conversations

Nous avons étendu le service API (`ai.ts`) pour intégrer les nouveaux endpoints de gestion des conversations :

- `getConversations()` - Récupère la liste des conversations de l'utilisateur
- `createConversation()` - Crée une nouvelle conversation
- `getConversationById()` - Récupère une conversation spécifique
- `updateConversation()` - Modifie une conversation existante
- `deleteConversation()` - Supprime une conversation
- `archiveConversation()` - Archive une conversation
- `getConversationMessages()` - Récupère les messages d'une conversation
- `addMessageToConversation()` - Ajoute un message à une conversation

La méthode `queryAI()` a été mise à jour pour prendre en compte le paramètre `conversationId` qui permet de continuer une conversation existante.

### 3. Hook de gestion des conversations

Un nouveau hook `useConversations` a été créé pour gérer les opérations sur les conversations :

```typescript
// Fonctionnalités principales du hook useConversations
export function useConversationsList(activeOnly: boolean = true, enabled: boolean = true) {...}
export function useConversation(id: string | null, enabled: boolean = true) {...}
export function useConversationMessages(id: string | null, enabled: boolean = true) {...}
export function useConversationMutations() {...}
```

Ce hook utilise React Query pour gérer les requêtes et le cache, offrant une expérience utilisateur fluide et réactive. Il fournit des fonctions pour créer, mettre à jour, supprimer et archiver des conversations, ainsi que pour ajouter des messages.

### 4. Mise à jour du hook useChat

Le hook `useChat` a été mis à jour pour s'intégrer avec le système de conversations :

```typescript
// Nouveaux champs ajoutés à l'interface UseChatResult
export interface UseChatResult {
  // ...champs existants
  setActiveConversation: (conversationId: string | null) => void;
  activeConversationId: string | null;
  isLoadingConversation: boolean;
}
```

Les modifications principales incluent :
- L'ajout d'un état `activeConversationId` pour suivre la conversation active
- Une fonction `setActiveConversation` pour changer de conversation
- L'intégration avec `useConversationMessages` pour charger les messages
- La mise à jour de la méthode `sendMessage` pour inclure le paramètre `conversationId`
- Un état `isLoadingConversation` pour gérer les états de chargement

### 5. Composant ConversationList

Un nouveau composant `ConversationList` a été créé pour afficher la liste des conversations :

```jsx
<ConversationList
  activeConversationId={activeConversationId}
  onSelectConversation={(id) => setActiveConversation(id)}
  onNewConversation={handleNewConversation}
  className="h-full rounded-none border-0"
/>
```

Ce composant affiche :
- La liste des conversations avec leur titre et date de mise à jour
- Un nombre de messages par conversation
- Des indicateurs pour les conversations archivées
- Des options pour créer, renommer, archiver et supprimer des conversations
- Une zone de recherche pour filtrer les conversations
- Une option pour afficher/masquer les conversations archivées

### 6. Mise à jour du composant ChatInterface

Le composant `ChatInterface` a été mis à jour pour intégrer la liste des conversations et le système d'historique :

```jsx
<div className={`flex h-full ${className}`}>
  {/* Panel latéral des conversations */}
  <div className={`${isConversationPanelOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-slate-200`}>
    <ConversationList /* props */ />
  </div>
  
  {/* Interface de chat */}
  <Card className="flex flex-col flex-grow">
    {/* ... */}
  </Card>
</div>
```

Les modifications principales incluent :
- L'ajout d'un panneau latéral pour la liste des conversations
- L'affichage du titre de la conversation active dans l'en-tête
- Des boutons pour créer une nouvelle conversation et afficher/masquer le panneau
- La gestion des états de chargement pour les messages de conversation
- L'adaptation de l'interface pour rendre l'expérience utilisateur plus intuitive

### 7. Composant DropdownMenu

Un nouveau composant `DropdownMenu` a été créé pour fournir des menus contextuels pour les actions sur les conversations :

```jsx
<DropdownMenu
  trigger={
    <Button variant="ghost" size="sm" className="p-1">
      <MoreVertical className="h-4 w-4" />
    </Button>
  }
>
  <DropdownMenuItem onClick={() => openEditModal(conversation.id, conversation.title)}>
    <div className="flex items-center">
      <Edit className="h-4 w-4 mr-2" />
      Renommer
    </div>
  </DropdownMenuItem>
  {/* Autres options de menu */}
</DropdownMenu>
```

Ce composant offre une interface utilisateur cohérente pour les menus contextuels dans l'application, avec un positionnement automatique et une gestion des événements.

## Flux d'utilisation

### Création d'une nouvelle conversation

1. L'utilisateur clique sur le bouton "+" ou "Nouvelle conversation"
2. Une modale s'ouvre pour saisir le titre de la conversation
3. L'utilisateur entre un titre et confirme
4. Le service API crée une nouvelle conversation côté serveur
5. La liste des conversations est mise à jour
6. La nouvelle conversation devient active

### Continuation d'une conversation existante

1. L'utilisateur sélectionne une conversation dans la liste
2. Le hook `useChat` charge les messages de cette conversation
3. Les messages sont affichés dans l'interface de chat
4. Les nouveaux messages sont ajoutés à cette conversation

### Archivage et suppression

1. L'utilisateur clique sur le menu contextuel d'une conversation
2. Il sélectionne "Archiver" ou "Supprimer"
3. Une confirmation est demandée pour la suppression
4. L'action est exécutée via le service API
5. La liste des conversations est mise à jour

## Intégration avec le backend

Le frontend s'intègre avec les nouveaux endpoints du backend :

- `GET /conversations` - Liste des conversations
- `POST /conversations` - Créer une conversation
- `GET /conversations/:id` - Détails d'une conversation
- `PATCH /conversations/:id` - Mettre à jour une conversation
- `DELETE /conversations/:id` - Supprimer une conversation
- `PATCH /conversations/:id/archive` - Archiver une conversation
- `GET /conversations/:id/messages` - Messages d'une conversation
- `POST /conversations/:id/messages` - Ajouter un message

Le paramètre `conversationId` est passé au endpoint `/ai/query` pour continuer une conversation existante.

## Avantages et améliorations

Cette implémentation offre plusieurs avantages :

1. **Persistance** - Les conversations sont sauvegardées sur le serveur et accessibles depuis n'importe quel appareil
2. **Organisation** - Les utilisateurs peuvent organiser leurs conversations avec des titres personnalisés
3. **Continuité** - Les utilisateurs peuvent reprendre des discussions précédentes à tout moment
4. **Contexte amélioré** - L'IA peut s'appuyer sur les échanges précédents pour fournir des réponses plus pertinentes
5. **Interface intuitive** - L'interface ressemble aux applications de messagerie modernes que les utilisateurs connaissent

## Considérations techniques

- **Performances** - React Query est utilisé pour optimiser les requêtes et mettre en cache les données
- **Gestion d'état** - Les états sont gérés localement et synchronisés avec le serveur
- **Expérience utilisateur** - Les états de chargement et les animations de transition améliorent l'expérience
- **Modularité** - Les composants et hooks sont conçus pour être réutilisables et maintenables
- **Respect des standards** - L'implémentation suit les bonnes pratiques de React et TypeScript

## Conclusion

Cette implémentation ajoute une fonctionnalité complète d'historique des conversations à l'application, améliorant significativement l'expérience utilisateur avec l'assistant IA. Les utilisateurs peuvent désormais conserver et organiser leurs conversations, y revenir facilement, et bénéficier d'un contexte plus riche dans leurs interactions avec l'IA.

Le système est extensible et peut être enrichi avec des fonctionnalités supplémentaires, comme le partage de conversations, l'exportation des historiques ou des analyses sur les interactions.