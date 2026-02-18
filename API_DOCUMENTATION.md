# Documentation de l'API Maliyapay

Cette documentation fournit une vue d'ensemble des routes API disponibles pour l'intégration frontend.

## Authentification

Tous les points de terminaison (sauf l'inscription et la connexion) nécessitent un jeton Bearer dans le header `Authorization`.

| Méthode | Route                       | Description                         |
| :------ | :-------------------------- | :---------------------------------- |
| POST    | `/api/auth/register`        | Inscription d'un nouvel utilisateur |
| POST    | `/api/auth/login`           | Connexion et obtention du jeton     |
| POST    | `/api/auth/logout`          | Déconnexion                         |
| GET     | `/api/auth/user`            | Détails de l'utilisateur connecté   |
| PUT     | `/api/auth/profile`         | Mise à jour du profil               |
| POST    | `/api/auth/password`        | Changement de mot de passe          |
| POST    | `/api/auth/forgot-password` | Demande de réinitialisation         |
| POST    | `/api/auth/reset-password`  | Réinitialisation du mot de passe    |

---

## Catégories

Gestion des catégories de transactions.

| Méthode | Route                         | Description                                  |
| :------ | :---------------------------- | :------------------------------------------- |
| GET     | `/api/categories`             | Liste toutes les catégories de l'utilisateur |
| GET     | `/api/categories/type/{type}` | Filtre par type (`income` ou `expense`)      |
| GET     | `/api/categories/{id}`        | Détails d'une catégorie                      |
| POST    | `/api/categories`             | Créer une catégorie                          |
| PUT     | `/api/categories/{id}`        | Modifier une catégorie                       |
| DELETE  | `/api/categories/{id}`        | Supprimer une catégorie                      |

---

## Comptes & Portefeuilles

Gestion des comptes financiers.

| Méthode | Route                           | Description                    |
| :------ | :------------------------------ | :----------------------------- |
| GET     | `/api/accounts`                 | Liste tous les comptes         |
| GET     | `/api/accounts/{id}`            | Détails d'un compte            |
| POST    | `/api/accounts`                 | Créer un compte                |
| POST    | `/api/accounts/{id}/currencies` | Ajouter une devise à un compte |
| DELETE  | `/api/accounts/{id}`            | Supprimer un compte            |

---

## Transactions

Gestion des flux financiers.

| Méthode | Route                    | Description                       |
| :------ | :----------------------- | :-------------------------------- |
| GET     | `/api/transactions`      | Liste les transactions récentes   |
| POST    | `/api/transactions`      | Enregistrer une transaction       |
| PUT     | `/api/transactions/{id}` | Modifier une transaction          |
| DELETE  | `/api/transactions/{id}` | Annuler/Supprimer une transaction |

---

## Budgets

Planification financière.

| Méthode | Route               | Description                  |
| :------ | :------------------ | :--------------------------- |
| GET     | `/api/budgets`      | Liste les budgets configurés |
| POST    | `/api/budgets`      | Définir un nouveau budget    |
| DELETE  | `/api/budgets/{id}` | Supprimer un budget          |

---

## Routines & Tâches

Gestion des habitudes et du suivi.

| Méthode | Route                       | Description                             |
| :------ | :-------------------------- | :-------------------------------------- |
| GET     | `/api/routines`             | Liste les routines                      |
| POST    | `/api/routines`             | Créer une routine                       |
| POST    | `/api/routines/{id}/toggle` | Activer/Désactiver une routine          |
| GET     | `/api/tasks`                | Liste toutes les tâches                 |
| POST    | `/api/tasks`                | Créer une tâche                         |
| POST    | `/api/tasks/{id}/toggle`    | Marquer une tâche comme faite/non faite |

---

## Notifications

Alertes et messages système.

| Méthode | Route                                  | Description                         |
| :------ | :------------------------------------- | :---------------------------------- |
| GET     | `/api/notifications`                   | Liste les notifications             |
| GET     | `/api/notifications/unread-count`      | Nombre de notifications non lues    |
| POST    | `/api/notifications/mark-all-as-read`  | Tout marquer comme lu               |
| POST    | `/api/notifications/{id}/mark-as-read` | Marquer une notification spécifique |

---

## Tableaux de Bord & Statistiques

| Méthode | Route             | Description                            |
| :------ | :---------------- | :------------------------------------- |
| GET     | `/api/dashboard`  | Données récapitulatives pour l'accueil |
| GET     | `/api/statistics` | Données analytiques détaillées         |

---

## Note

Pour plus de détails sur les paramètres de requête et les exemples de réponses, veuillez consulter la documentation interactive générée à l'adresse suivante (en local) : [http://localhost/api-documentation](http://localhost/api-documentation)
