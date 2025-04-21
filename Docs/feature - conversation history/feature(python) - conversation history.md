# Documentation d'implémentation - Support de l'historique des conversations

## Vue d'ensemble

Cette documentation détaille les modifications apportées au service IA Python pour implémenter le support de l'historique des conversations. Cette fonctionnalité permet au service de maintenir le contexte conversationnel entre les échanges utilisateur-IA, améliorant ainsi la pertinence et la cohérence des réponses dans les conversations multi-tours.

## Contexte technique

Le backend Node.js a été mis à jour pour stocker et transmettre l'historique complet des conversations au service Python via le champ `context` dans les requêtes API. Notre service Python a été modifié pour traiter efficacement ce nouveau format et l'utiliser pour générer des réponses plus contextuelles.

## Modifications détaillées

### 1. Modèles de données

#### Ajout du modèle `UserInfo`

```python
class UserInfo(BaseModel):
    """Informations sur l'utilisateur"""
    firstName: str
    lastName: str
    role: str
    department: Optional[str] = None
```

Ce modèle permet de structurer et valider les informations utilisateur reçues du backend. Il est utilisé pour personnaliser la génération des réponses en fonction de l'utilisateur.

#### Mise à jour des modèles de requête

Les modèles `ChatRequest` et `PredictionRequest` ont été enrichis pour inclure les informations utilisateur :

```python
class ChatRequest(BaseModel):
    """Requête pour le chat"""
    query: str = Field(..., description="La requête en langage naturel")
    context: Optional[List[MessageItem]] = Field(None, description="Contexte de conversation précédent")
    deadlines: Optional[List[DeadlineInfo]] = Field(None, description="Échéances à inclure dans le contexte")
    user_id: Optional[str] = Field(None, description="ID de l'utilisateur")
    user_info: Optional[UserInfo] = Field(None, description="Informations sur l'utilisateur")
```

### 2. Traitement du contexte conversationnel

#### Amélioration de la fonction `format_prompt_mistral()`

La fonction qui prépare les prompts a été considérablement améliorée pour :

```python
def format_prompt_mistral(
    query: str, 
    context: List[MessageItem] = None, 
    deadlines: List[DeadlineInfo] = None,
    user_info: UserInfo = None
) -> List[Dict[str, str]]:
```

Principales modifications :
- Prise en charge du paramètre `user_info`
- Incorporation des informations utilisateur dans le prompt système
- Traitement optimisé du contexte conversationnel
- Limitation du nombre de messages de contexte si nécessaire

#### Gestion du contexte dans le prompt système

Le contexte utilisateur est désormais intégré dans le prompt système :

```python
# Ajouter les informations utilisateur si disponibles
if user_info:
    system_prompt += f"\n\nTu interagis avec {user_info.firstName} {user_info.lastName}, qui a le rôle de {user_info.role}"
    if user_info.department:
        system_prompt += f" dans le département {user_info.department}"
    system_prompt += "."
```

#### Limitation du contexte pour les performances

Pour éviter des prompts trop volumineux, nous limitons le nombre de messages d'historique :

```python
# Limiter le contexte au nombre max d'éléments si nécessaire
limited_context = context[-MAX_CONTEXT_ITEMS:] if len(context) > MAX_CONTEXT_ITEMS else context

# Si nous avons tronqué le contexte, on le log
if len(context) > MAX_CONTEXT_ITEMS:
    logger.info(f"Contexte tronqué de {len(context)} à {MAX_CONTEXT_ITEMS} messages")
```

### 3. Amélioration de la journalisation (logging)

Des logs détaillés ont été ajoutés pour suivre l'utilisation du contexte :

```python
# Log du nombre de messages de contexte reçus
context_count = len(request.context) if request.context else 0
logger.info(f"Requête chat reçue avec {context_count} messages de contexte")
```

Et pour mesurer les performances :

```python
# Calculer le temps de traitement
processing_time = time.time() - start_time
logger.info(f"Réponse générée en {processing_time:.2f} secondes")
```

### 4. Endpoint `/chat` amélioré

L'endpoint `/chat` a été mis à jour pour prendre en charge le nouveau format :

```python
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
```

### 5. Support de l'historique dans l'analyse prédictive

La fonctionnalité `/predict` a également été améliorée pour personnaliser l'analyse en fonction de l'utilisateur :

```python
# Personnalisation selon l'utilisateur
user_greeting = ""
if request.user_info:
    user_greeting = f"Analyse pour {request.user_info.firstName} {request.user_info.lastName} ({request.user_info.role}): "
```

## Script de test

Un script de test complet a été développé pour valider l'implémentation :

```python
"""
Script de test pour l'intégration de l'historique de conversation dans le service IA
-----------------------------------------------------------------------------------
"""
```

Le script implémente trois scénarios de test :

1. **Test de conversation avec historique** - Simule une conversation en plusieurs tours où chaque message fait référence aux échanges précédents
2. **Test du nombre maximum de messages de contexte** - Vérifie que le service gère correctement la limitation du nombre de messages
3. **Test de conversation sans historique** - Fournit une base de comparaison pour évaluer les améliorations

## Configuration et paramètres

### Variables d'environnement

Le service utilise la variable d'environnement suivante pour configurer le traitement du contexte :

- `MAX_CONTEXT_ITEMS` : Nombre maximum de messages d'historique à inclure (défaut : 10)

## Impact sur les performances

L'inclusion du contexte conversationnel peut affecter les performances de deux façons :

1. **Taille du prompt** : Des prompts plus grands augmentent la charge de travail du modèle LLM
2. **Qualité des réponses** : Les réponses sont plus pertinentes et contextuelles, réduisant potentiellement le nombre d'échanges nécessaires

## Intégration avec le backend Node.js

Le backend Node.js doit :

1. Stocker l'historique des messages pour chaque conversation
2. Inclure cet historique dans le champ `context` des requêtes au service Python
3. Conserver l'historique mis à jour après chaque échange

## Exemples d'utilisation

### Exemple minimal de requête avec contexte

```json
{
  "query": "Peux-tu me donner plus de détails?",
  "context": [
    {
      "role": "user",
      "content": "Quels sont mes projets actifs?"
    },
    {
      "role": "assistant",
      "content": "Vous avez 2 projets actifs : Projet Mistral et Projet Tempête."
    }
  ]
}
```

## Améliorations futures possibles

1. **Résumé automatique du contexte** pour les conversations très longues
2. **Extraction sélective du contexte** en fonction de la pertinence des messages
3. **Cache des conversations fréquentes** pour améliorer les performances
4. **Analyse des sentiments** dans l'historique pour adapter le ton des réponses

## Conclusion

L'implémentation du support de l'historique des conversations représente une amélioration significative de la qualité des interactions entre les utilisateurs et le service IA. Le système peut désormais maintenir le contexte à travers plusieurs échanges, permettant des conversations plus naturelles et efficaces.

Cette fonctionnalité s'intègre parfaitement au reste de l'architecture de l'application tout en maintenant les performances et la sécurité requises.