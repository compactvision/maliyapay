# Guide de Déploiement Automatisé sur o2switch

Ce guide vous explique comment configurer le déploiement automatique (CI/CD) de votre application Laravel sur votre hébergement o2switch via GitHub Actions.

## 1. Préparer l'hébergement (o2switch)

Vous devez activer l'accès SSH et récupérer vos informations de connexion.

1.  Connectez-vous à votre **cPanel**.
2.  Cherchez l'outil **Accès SSH** (dans la section Sécurité).
3.  Cliquez sur **Gérer les clés SSH** > **Générer une nouvelle clé**.
    - **Nom de la clé** : `id_rsa_github` (par exemple)
    - **Mot de passe** : Laissez vide (très important pour le CI/CD).
    - Cliquez sur **Générer une clé**.
4.  Une fois la clé générée :
    - Cliquez sur **Gérer** à côté de la clé publique (Public Key), puis sur **Authorize** (Autoriser).
    - Revenez en arrière et cliquez sur **Afficher/Télécharger** la **Clé Privée** (Private Key).
    - Convertissez-la au format PPK si demandé, ou copiez simplement tout le contenu du bloc de texte (commençant par `-----BEGIN OPENSSH PRIVATE KEY-----`). **Gardez ce contenu secret, vous en aurez besoin pour GitHub.**

## 2. Configurer le Dossier de Destination

Assurez-vous que le dossier où vous voulez déployer l'application existe sur le serveur.
Par défaut, pour le domaine principal, c'est souvent `/home/votre_user/public_html`.
Si c'est un sous-domaine, créez le dossier correspondant (ex: `/home/votre_user/app.maliyapay.com`).

Connectez-vous via un terminal ou le Gestionnaire de Fichiers et assurez-vous de copier votre fichier `.env` de production dans ce dossier. **GitHub Actions ne déploiera pas le fichier `.env` pour des raisons de sécurité.**

```bash
# Exemple de structure sur le serveur
/home/nom_utilisateur/
  └── public_html/
      ├── .env          <-- Votre fichier de configuration de prod (Créez-le manuellement !)
      ├── storage/      <-- Sera créé/vérifié par le script
      └── ...           <-- Les autres fichiers seront écrasés à chaque déploiement
```

## 3. Configurer les Secrets GitHub

Allez sur la page de votre dépôt GitHub :

1.  Cliquez sur **Settings** (Paramètres) > **Secrets and variables** > **Actions**.
2.  Cliquez sur **New repository secret** pour ajouter les variables suivantes :

| Nom du Secret     | Valeur à mettre                                                                 |
| :---------------- | :------------------------------------------------------------------------------ |
| `SSH_HOST`        | L'adresse de votre serveur (ex: `srv123.o2switch.net` ou votre nom de domaine). |
| `SSH_USERNAME`    | Votre identifiant cPanel (ex: `xm34521`).                                       |
| `SSH_PORT`        | `22` (Le port standard SSH pour o2switch).                                      |
| `SSH_PRIVATE_KEY` | Le contenu complet de la **Clé Privée** que vous avez copiée à l'étape 1.       |
| `DEPLOY_PATH`     | Le chemin absolu vers votre dossier (ex: `/home/votre_user/public_html`).       |

## 4. Tester le Déploiement

Une fois ces secrets configurés :

1.  Faites une modification sur votre code.
2.  Poussez (push) la modification sur la branche `main`.
3.  Allez dans l'onglet **Actions** de votre dépôt GitHub pour voir le déploiement se lancer.

## Dépannage Courant

- **Erreur Permission denied (publickey)** : Vérifiez que vous avez bien "Autorisé" la clé publique dans cPanel et que vous avez copié la bonne clé privée.
- **Erreur rsync/tar** : Assurez-vous que l'utilisateur cPanel a les droits d'écriture dans le dossier `DEPLOY_PATH`.
- **Erreur Database** : Vérifiez que le fichier `.env` sur le serveur contient les bons identifiants de base de données.
