# Installation de Secure Bridge Premium

## Téléchargement

Rendez-vous sur la page **Releases** de GitHub:
https://github.com/VOTRE-USERNAME/secure-bridge-premium/releases

### Windows
1. Téléchargez `Secure-Bridge-Premium-Setup-X.X.X.exe`
2. Double-cliquez sur le fichier
3. Cliquez "Suivant" → "Suivant" → "Installer" → "Terminer"
4. L'icône apparaît sur le bureau

### Mac
1. Téléchargez `Secure-Bridge-Premium-X.X.X.dmg`
2. Double-cliquez pour ouvrir
3. Glissez l'application dans le dossier Applications
4. Lancez depuis le Launchpad

### Linux
1. Téléchargez `Secure-Bridge-Premium-X.X.X.AppImage`
2. Rendez-le exécutable: `chmod +x Secure-Bridge-Premium-*.AppImage`
3. Double-cliquez pour lancer

## Configuration

### 1. Connexion au serveur

- **Server URL**: `https://kirk.replit.dev` (ou votre URL Xchange Suite)
- **Auth Secret**: Le secret fourni par l'administrateur (BRIDGE_AUTH_SECRET)
- **Trading Mode**: Paper (simulation) ou Live (argent réel)

### 2. Clés API Alpaca

Entrez vos clés API Alpaca:
- Pour Paper Trading: Obtenez-les sur https://app.alpaca.markets/paper/dashboard
- Pour Live Trading: Obtenez-les sur https://app.alpaca.markets/live/dashboard

**Important**: Vos clés sont stockées localement sur votre ordinateur, jamais sur nos serveurs.

### 3. Connexion

Cliquez "Connect" pour établir la connexion sécurisée.

## Dépannage

### "Connection failed"
- Vérifiez l'URL du serveur
- Vérifiez que le secret d'authentification est correct
- Vérifiez votre connexion internet

### "Alpaca error"
- Vérifiez vos clés API Alpaca
- Assurez-vous d'utiliser les bonnes clés (Paper vs Live)

## Sécurité

- Les clés API sont chiffrées et stockées localement
- Seuls les signaux de trading sont reçus via WebSocket
- Les ordres sont exécutés directement depuis votre ordinateur
- Vous pouvez vous déconnecter à tout moment
