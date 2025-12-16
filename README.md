# Secure Bridge Premium

Application desktop pour le stockage sécurisé local des clés API Alpaca et l'exécution des trades.

## Pour les utilisateurs

Téléchargez l'installateur depuis la page **Releases**:
- **Windows**: `Secure-Bridge-Premium-Setup-X.X.X.exe`
- **Mac**: `Secure-Bridge-Premium-X.X.X.dmg`
- **Linux**: `Secure-Bridge-Premium-X.X.X.AppImage`

Voir [INSTALLATION.md](INSTALLATION.md) pour les instructions détaillées.

## Fonctionnalités

- **Stockage local sécurisé**: Les clés API sont chiffrées et stockées uniquement sur votre ordinateur
- **Connexion WebSocket**: Communication sécurisée en temps réel avec Xchange Suite ETF100
- **Exécution des trades**: Réception des signaux et exécution des ordres via l'API Alpaca
- **Reconnexion automatique**: Reconnexion automatique avec backoff exponentiel

## Comment ça marche

1. L'application se connecte au serveur Xchange Suite via WebSocket sécurisé
2. Vos clés API Alpaca restent sur votre ordinateur (jamais envoyées au serveur)
3. Les signaux de trading sont reçus en temps réel
4. Les ordres sont exécutés localement via l'API Alpaca

## Pour les développeurs

### Prérequis
- Node.js 18+
- npm

### Développement local

```bash
npm install
npm run dev
```

### Créer les installateurs

Les installateurs sont créés automatiquement par GitHub Actions quand vous créez un tag de version:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Les installateurs seront disponibles dans la page Releases après quelques minutes.

### Structure du projet

```
secure-bridge/
├── src/
│   ├── main/           # Processus principal Electron
│   │   ├── index.ts    # Point d'entrée
│   │   ├── bridge-client.ts  # Client WebSocket
│   │   ├── key-vault.ts      # Stockage sécurisé des clés
│   │   ├── alpaca-executor.ts # Exécution des ordres
│   │   └── preload.ts        # Script de préchargement
│   ├── renderer/       # Interface utilisateur
│   │   └── index.html
│   └── shared/         # Types partagés
│       └── types.ts
├── .github/workflows/  # GitHub Actions pour les builds
├── build/              # Icônes et ressources
└── release/            # Installateurs générés
```

## Publier sur GitHub

1. Créez un nouveau repository sur GitHub
2. Poussez le code:
   ```bash
   cd secure-bridge
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/VOTRE-USERNAME/secure-bridge-premium.git
   git push -u origin main
   ```
3. Créez un tag pour déclencher le build:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
4. Les installateurs apparaîtront dans la page Releases

## Sécurité

- Les clés API sont chiffrées avec une clé dérivée de l'ID unique de la machine
- Aucune clé n'est transmise sur le réseau
- Seuls les signaux de trading sont reçus via WebSocket
- La connexion WebSocket utilise TLS
- Un secret d'authentification (BRIDGE_AUTH_SECRET) est requis

## Licence

MIT
