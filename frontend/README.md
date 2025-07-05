# Frontend pour l'Application de Gestion d'Échéances

Ce dépôt contient le code frontend de l'application de gestion d'échéances, développé avec Next.js et React. Cette application permet aux utilisateurs de gérer efficacement leurs échéances, projets et équipes dans un environnement sécurisé.

## 🌟 Fonctionnalités

- **Tableau de bord interactif** : Visualisation des statistiques et des échéances à venir
- **Gestion complète des échéances** : Création, modification, suivi et suppression
- **Calendrier intégré** : Vue mensuelle, hebdomadaire et quotidienne des échéances
- **Assistant IA** : Interface de chat pour interagir avec un agent IA
- **Interface responsive** : Adaptation à tous les types d'écrans
- **Design moderne** : Interface utilisateur élégante avec Tailwind CSS

## 🛠️ Technologies utilisées

- **Next.js** : Framework React pour le rendu côté serveur et la génération de sites statiques
- **React** : Bibliothèque JavaScript pour la création d'interfaces utilisateur
- **TypeScript** : Typage statique pour un code plus robuste
- **React Query** : Gestion de l'état et des requêtes API
- **React Hook Form** : Gestion des formulaires
- **Tailwind CSS** : Framework CSS utilitaire
- **Lucide React** : Icônes modernes et accessibles
- **Recharts** : Bibliothèque de graphiques basée sur React
- **React Calendar** : Composant de calendrier pour React

## 📋 Prérequis

- Node.js (v16+)
- npm ou yarn
- Backend API accessible (voir documentation backend)

## 🚀 Installation et démarrage

1. Clonez ce dépôt :
   ```bash
   git clone <url-du-dépôt>
   cd deadline-manager-frontend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configurez les variables d'environnement :
   Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. Lancez l'application en mode développement :
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. Accédez à l'application dans votre navigateur à l'adresse : http://localhost:3001

## 📁 Structure du projet

```
src/
├── app/                    # Répertoire des pages (Next.js App Router)
│   ├── auth/               # Pages d'authentification
│   ├── calendar/           # Page du calendrier
│   ├── chat/               # Page de chat IA
│   ├── dashboard/          # Page du tableau de bord
│   ├── deadlines/          # Pages des échéances
│   ├── layout.tsx          # Layout racine de l'application
│   ├── page.tsx            # Page d'entrée (redirections)
│   └── providers.tsx       # Fournisseurs de contexte globaux
├── components/             # Composants React réutilisables
│   ├── chat/               # Composants liés au chat
│   ├── dashboard/          # Composants du tableau de bord
│   ├── deadline/           # Composants de gestion des échéances
│   ├── layout/             # Composants de mise en page
│   └── ui/                 # Composants UI de base
├── hooks/                  # Hooks React personnalisés
├── lib/                    # Fonctions utilitaires et services
│   └── api/                # Services API pour communiquer avec le backend
└── types/                  # Définitions de types TypeScript
```

## 🔄 Intégration avec le backend

L'application frontend communique avec le backend via une API REST. Les principaux points d'intégration sont :

- **Authentication** : `/auth/login` et `/auth/register`
- **Échéances** : CRUD complet via `/deadlines`
- **Projets** : CRUD complet via `/projects`
- **Équipes** : CRUD complet via `/teams`
- **Commentaires** : CRUD complet via `/comments`
- **Pièces jointes** : Upload et gestion via `/attachments`
- **IA** : Communication avec l'agent IA via `/ai/query`

## 📋 Scripts disponibles

- `npm run dev` : Démarre le serveur de développement
- `npm run build` : Compile l'application pour la production
- `npm run start` : Démarre le serveur de production
- `npm run lint` : Exécute l'outil de linting
- `npm run type-check` : Vérifie les types TypeScript

## 🧪 Tests

Exécutez les tests avec la commande :
```bash
npm run test
# ou
yarn test
```

## 🔒 Sécurité

L'application implémente plusieurs mesures de sécurité :
- Authentification basée sur JWT
- Protection CSRF
- Validation des entrées
- Gestion sécurisée des sessions

## 🌐 Déploiement

Pour déployer l'application en production :

1. Créez un build de production :
   ```bash
   npm run build
   ```

2. Démarrez le serveur de production :
   ```bash
   npm run start
   ```

L'application peut également être déployée sur des plateformes comme Vercel ou Netlify avec une configuration minimale.

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Forkez le dépôt
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).
---
