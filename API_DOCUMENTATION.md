# Documentation des API et routes Maliyapay

Cette documentation decrit les routes visibles dans le projet Laravel/Inertia actuel. Les routes API retournent du JSON, les routes web servent les pages React/Inertia ou les ecrans Fortify.

## Fonctionnement general

- Authentification API: Sanctum. Les endpoints proteges utilisent `auth:sanctum` et attendent soit un cookie de session Sanctum, soit un Bearer token selon le client.
- Permissions: beaucoup de routes API utilisent Spatie Permission (`permission:view accounts`, `permission:create transactions`, etc.). Un utilisateur authentifie sans permission recoit un refus d'acces.
- Frontend: les pages dans `resources/js/pages/*` appellent les endpoints `/api/*` avec Axios.
- Multi-devises: un compte possede plusieurs lignes dans `account_balances`. Les transactions debitent/creditent le solde via le module Transaction. Le change interne ajoute ci-dessous modifie seulement les soldes du compte et ne cree pas de transaction.
- Documentation interactive: Scribe expose aussi `/docs`, `/docs.openapi`, `/docs.postman` et la vue `/api-documentation`.

## Authentification API

| Methode | Route | Middleware | Description | Payload principal |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | public | Cree un utilisateur et retourne le token/session selon le controleur. | `name`, `email`, `password`, `password_confirmation` |
| POST | `/api/auth/login` | public | Connecte un utilisateur. | `email`, `password` |
| POST | `/api/auth/two-factor-challenge` | public | Valide le code 2FA ou recovery code. | `code` ou `recovery_code` |
| POST | `/api/auth/logout` | `auth:sanctum` | Deconnecte l'utilisateur courant. | aucun |
| GET | `/api/auth/user` | `auth:sanctum` | Retourne l'utilisateur connecte avec ses roles. | aucun |
| PUT | `/api/auth/profile` | `auth:sanctum` | Met a jour le profil API. | champs profil acceptes par le controleur |
| POST | `/api/auth/password` | `auth:sanctum` | Change le mot de passe. | `current_password`, `password`, `password_confirmation` |
| POST | `/api/auth/email/verification-notification` | `auth:sanctum`, `throttle:6,1` | Renvoie l'email de verification. | aucun |
| POST | `/api/auth/email/verify` | `auth:sanctum`, `throttle:6,1` | Verifie l'email via code/payload API. | selon `AuthController` |
| POST | `/api/auth/forgot-password` | `guest` | Demande une reinitialisation. | `email` |
| POST | `/api/auth/reset-password` | `guest` | Reinitialise le mot de passe. | `token`, `email`, `password`, `password_confirmation` |
| POST | `/api/auth/pin/verify` | public | Deverrouille via PIN avec identification. | `email`, `pin` |
| POST | `/api/auth/pin/setup` | `auth:sanctum` | Configure le PIN. | `pin` et confirmation selon controleur |
| POST | `/api/auth/pin/toggle` | `auth:sanctum` | Active/desactive l'auto-lock. | booleen selon controleur |
| POST | `/api/auth/pin/settings` | `auth:sanctum` | Met a jour les reglages PIN. | reglages auto-lock |
| GET/POST | `/api/broadcasting/auth` | `auth:sanctum` | Autorise les canaux broadcast prives. | payload Laravel Echo |

## Comptes

| Methode | Route | Permission | Description | Payload principal |
| --- | --- | --- | --- | --- |
| GET | `/api/accounts` | `view accounts` | Liste les comptes de l'utilisateur avec leurs soldes par devise. | aucun |
| GET | `/api/accounts/{id}` | `view accounts` | Detail d'un compte appartenant a l'utilisateur. | aucun |
| POST | `/api/accounts` | `create accounts` | Cree un compte. | `name`, `type` (`cash`, `bank`, `mobile_money`, `saving`, `other`), `color`, `initial_currency`, `initial_balance` |
| PUT | `/api/accounts/{id}` | `edit accounts` | Route declaree pour modifier un compte. | attention: l'action `update` n'est pas encore implementee dans `AccountController` |
| POST | `/api/accounts/{id}/currencies` | `edit accounts` | Ajoute une devise au compte. | `currency_code`, `initial_balance` |
| POST | `/api/accounts/{id}/exchange` | `edit accounts` | Change une devise vers une autre dans le meme compte, sans creer de transaction. | `from_currency`, `to_currency`, `amount`, `rate` |
| DELETE | `/api/accounts/{id}` | `delete accounts` | Supprime/soft-delete le compte. | aucun |

### Change interne

`POST /api/accounts/{id}/exchange` fonctionne ainsi:

1. Le serveur recupere le compte de l'utilisateur courant.
2. Il valide que les deux devises sont differentes et que `amount` et `rate` sont superieurs a 0.
3. Pour USD/CDF, `rate` represente toujours le taux du marche `1 USD = X CDF`.
4. Si le sens est USD vers CDF, il calcule `converted_amount = amount * rate`.
5. Si le sens est CDF vers USD, il calcule `converted_amount = amount / rate`.
6. Pour les autres paires de devises, il garde le calcul generique `amount * rate`.
7. Il retire `amount` de `from_currency`.
8. Il ajoute `converted_amount` dans `to_currency`.
9. Il sauvegarde les soldes du compte, sans insertion dans la table `transactions`.

Exemple:

```json
{
  "from_currency": "USD",
  "to_currency": "CDF",
  "amount": 10,
  "rate": 2250
}
```

Reponse:

```json
{
  "message": "Exchange completed successfully",
  "converted_amount": 22500
}
```

Exemple inverse avec la meme convention de taux:

```json
{
  "from_currency": "CDF",
  "to_currency": "USD",
  "amount": 24000,
  "rate": 2400
}
```

Reponse:

```json
{
  "message": "Exchange completed successfully",
  "converted_amount": 10
}
```

## Categories

| Methode | Route | Permission | Description | Payload principal |
| --- | --- | --- | --- | --- |
| GET | `/api/categories` | `view categories` | Liste les categories. | aucun |
| GET | `/api/categories/type/{type}` | `auth:sanctum` | Liste les categories par type. | `type`: `income` ou `expense` |
| GET | `/api/categories/{id}` | `view categories` | Detail d'une categorie. | aucun |
| POST | `/api/categories` | `create categories` | Cree une categorie. | `name`, `type`, `color` au format `#RRGGBB` |
| PUT | `/api/categories/{id}` | `edit categories` | Modifie une categorie. | `name`, `type`, `color` |
| DELETE | `/api/categories/{id}` | `delete categories` | Supprime une categorie. | aucun |

## Transactions

| Methode | Route | Permission | Description | Payload principal |
| --- | --- | --- | --- | --- |
| GET | `/api/transactions` | `view transactions` | Liste les transactions du mois. Accepte `month=YYYY-MM`. Retourne aussi `meta.totals` par devise. | query `month` optionnelle |
| POST | `/api/transactions` | `create transactions` | Cree une entree/sortie et met a jour le solde du compte. | `account_id`, `category_id`, `amount`, `currency`, `type` (`income`/`expense`), `description`, `date` |
| PUT | `/api/transactions/{id}` | `edit transactions` | Modifie directement la transaction. Attention: le controleur indique que les changements financiers complets peuvent desynchroniser le solde. | champs transaction |
| DELETE | `/api/transactions/{id}` | `delete transactions` | Supprime la transaction via handler et ajuste le domaine. | aucun |

## Budgets

| Methode | Route | Permission | Description | Payload principal |
| --- | --- | --- | --- | --- |
| GET | `/api/budgets` | `view budgets` | Liste les budgets et calcule `spent_amount` sur la periode courante. | aucun |
| GET | `/api/budgets/{id}` | `view budgets` | Route declaree pour detail budget. | attention: l'action `show` n'est pas encore implementee dans `BudgetController` |
| POST | `/api/budgets` | `create budgets` | Cree ou definit un budget. Accepte aussi un budget equivalent pour la meme categorie dans une autre devise. | `category_id`, `amount`, `currency`, `period` (`daily`, `weekly`, `monthly`), optionnels: `equivalent_amount`, `equivalent_currency` |
| PUT | `/api/budgets/{id}` | `edit budgets` | Modifie un budget existant. | `category_id`, `amount`, `currency`, `period` (`daily`, `weekly`, `monthly`) |
| DELETE | `/api/budgets/{id}` | `delete budgets` | Supprime un budget. | aucun |

## Dashboard et statistiques

| Methode | Route | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/dashboard` | `view dashboard` | Retourne les donnees de synthese du tableau de bord. |
| GET | `/api/statistics` | `view statistics` | Retourne les donnees analytiques/statistiques. |

## Taches

| Methode | Route | Permission | Description | Payload principal |
| --- | --- | --- | --- | --- |
| GET | `/api/tasks` | `view tasks` | Liste les taches de l'utilisateur. | aucun |
| POST | `/api/tasks` | `create tasks` | Cree une tache. | `title`, `description`, `priority` (`low`, `medium`, `high`), `dueDate` |
| PUT | `/api/tasks/{id}` | `edit tasks` | Met a jour une tache. | `title`, `description`, `priority`, `dueDate` |
| POST | `/api/tasks/{id}/toggle` | `edit tasks` | Marque une tache comme terminee/non terminee. | aucun |
| DELETE | `/api/tasks/{id}` | `delete tasks` | Supprime une tache. | aucun |

## Routines

| Methode | Route | Permission | Description | Payload principal |
| --- | --- | --- | --- | --- |
| GET | `/api/routines` | `view routines` | Liste les routines. | aucun |
| POST | `/api/routines` | `create routines` | Cree une routine, avec taches optionnelles. | `name`, `color`, `tasks[]` |
| PUT | `/api/routines/{id}` | `edit routines` | Met a jour une routine. | `name`, `color`, etc. |
| POST | `/api/routines/{id}/toggle` | `edit routines` | Active/desactive une routine. | aucun |
| DELETE | `/api/routines/{id}` | `delete routines` | Supprime une routine. | aucun |
| GET | `/api/routine-tasks` | `view routines` | Liste toutes les taches de routine. | aucun |
| GET | `/api/routine-tasks/day/{dayOfWeek}` | `view routines` | Liste les taches d'un jour, 1=lundi a 7=dimanche. | aucun |
| GET | `/api/routines/{routineId}/tasks` | `view routines` | Liste les taches d'une routine. | aucun |
| POST | `/api/routines/{routineId}/tasks` | `edit routines` | Ajoute une tache a une routine. | `title`, `description`, `dayOfWeek`, `timeStart`, `timeEnd`, `priority`, `orderIndex` |
| PUT | `/api/routines/{routineId}/tasks/{taskId}` | `edit routines` | Modifie une tache de routine. | champs de tache |
| DELETE | `/api/routines/{routineId}/tasks/{taskId}` | `delete routines` | Supprime une tache de routine. | aucun |

## Notifications

| Methode | Route | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/notifications` | `view notifications` | Liste les notifications utilisateur. |
| GET | `/api/notifications/unread-count` | `view notifications` | Compte les notifications non lues. |
| POST | `/api/notifications/mark-all-as-read` | `view notifications` | Marque toutes les notifications comme lues. |
| DELETE | `/api/notifications/delete-all` | `view notifications` | Supprime toutes les notifications. |
| POST | `/api/notifications/{id}/mark-as-read` | `view notifications` | Marque une notification comme lue. |
| DELETE | `/api/notifications/{id}` | `delete notifications` | Supprime une notification. |

## Growth

Ces routes sont definies dans `routes/web.php` avec le prefixe `api/growth`, donc elles utilisent le middleware `web` et `auth`, pas le groupe API Sanctum classique.

| Methode | Route | Description |
| --- | --- | --- |
| GET | `/api/growth` | Charge le module Growth pour l'utilisateur. |
| POST | `/api/growth/routine-kits/{id}/import` | Importe un kit de routine. |
| POST | `/api/growth/progress` | Met a jour la progression business. |
| POST | `/api/growth/quest/start` | Demarre une quete/business step. |

## Routes web publiques

| Methode | Route | Description |
| --- | --- | --- |
| GET | `/login` | Page connexion/inscription React. |
| GET | `/register` | Meme page auth, mode inscription. |
| POST | `/login` | Connexion Fortify web. |
| POST | `/logout` | Deconnexion Fortify web. |
| GET | `/verify-email` | Page de verification email. |
| GET | `/email/verify/{id}/{hash}` | Lien signe de verification email. |
| GET | `/forgot-password` | Page mot de passe oublie. |
| GET | `/reset-password/{token}` | Page reinitialisation. |
| GET | `/sanctum/csrf-cookie` | Cookie CSRF Sanctum. |
| GET | `/docs`, `/docs.openapi`, `/docs.postman` | Documentation Scribe. |
| GET | `/api-documentation` | Vue locale de documentation API. |
| GET | `/up` | Health check Laravel. |

## Routes web authentifiees

| Methode | Route | Middleware/permission | Page ou action |
| --- | --- | --- | --- |
| GET | `/` | `auth`, feature dashboard, `view dashboard` | Dashboard |
| GET | `/account` | `auth`, feature accounts, `view accounts` | Comptes |
| GET | `/transaction` | `auth`, feature transactions, `view transactions` | Transactions |
| GET | `/category` | `auth`, feature categories, `view categories` | Categories |
| GET | `/budget` | `auth`, feature budgets, `view budgets` | Budgets |
| GET | `/statistic` | `auth`, feature statistics, `view statistics` | Statistiques |
| GET | `/task` | `auth`, feature tasks, `view tasks` | Taches |
| GET | `/routine` | `auth`, feature routines, `view routines` | Routines |
| GET | `/notification` | `auth`, `view notifications` | Notifications |
| GET | `/goal` | `auth` | Objectifs |
| GET | `/growth` | `auth`, `view tasks` | Growth |
| GET | `/growth/advice/{id}` | `auth` | Detail conseil Growth |
| GET | `/growth/business/{businessId}/step/{stepId}` | `auth` | Detail etape de quete |
| GET | `/habits` | `auth`, `verified`, feature performance, `view habit-performance` | Performance habitudes |
| POST | `/habits/bonus` | idem + `manage habit-performance` | Reclame le bonus quotidien |
| POST | `/habits/shop` | idem + `manage habit-performance` | Achat de recompense |
| GET | `/profile` | `auth`, `view settings` | Profil |
| PATCH | `/profile` | `auth`, `view settings` | Mise a jour profil |
| PATCH | `/password` | `auth`, `edit settings` | Mise a jour mot de passe |
| POST | `/onboarding/complete` | `auth` | Termine l'onboarding |

## Parametres web

| Methode | Route | Permission | Description |
| --- | --- | --- | --- |
| GET | `/settings` | `view settings` | Page parametres. |
| PATCH | `/settings/notifications` | `edit settings` | Preferences notifications. |
| PATCH | `/settings/language` | `edit settings` | Langue utilisateur. |
| PATCH | `/settings/profile` | `edit settings` | Profil parametres. |
| DELETE | `/settings/profile` | `edit settings` | Suppression compte/profil. |
| GET | `/settings/password` | `view settings` | Page mot de passe. |
| PUT | `/settings/password` | `edit settings`, `throttle:6,1` | Changement mot de passe. |
| GET | `/settings/appearance` | `view settings` | Apparence. |
| GET | `/settings/security` | `view settings` | Securite. |
| GET | `/settings/two-factor` | `view settings` | Etat 2FA. |
| POST | `/settings/two-factor` | `edit settings` | Active 2FA. |
| DELETE | `/settings/two-factor` | `edit settings` | Desactive 2FA. |

## Administration

Toutes les routes ci-dessous utilisent le prefixe `/admin`, `auth:sanctum` et le middleware `admin`.

| Methode | Route | Permission | Description |
| --- | --- | --- | --- |
| GET | `/admin/settings` | `view settings` | Configuration globale. |
| POST | `/admin/settings` | `edit settings` | Sauvegarde configuration globale. |
| GET | `/admin/growth` | admin | Page admin Growth. |
| GET | `/admin/growth/config` | admin | Config Growth. |
| GET | `/admin/growth/advice/config` | admin | Config conseils. |
| GET | `/admin/growth/kit/config` | admin | Config kits. |
| GET | `/admin/growth/business/config` | admin | Config business models. |
| POST | `/admin/growth/advices` | admin | Cree un conseil. |
| PUT | `/admin/growth/advices/{id}` | admin | Modifie un conseil. |
| DELETE | `/admin/growth/advices/{id}` | admin | Supprime un conseil. |
| POST | `/admin/growth/routine-kits` | admin | Cree un kit. |
| PUT | `/admin/growth/routine-kits/{id}` | admin | Modifie un kit. |
| DELETE | `/admin/growth/routine-kits/{id}` | admin | Supprime un kit. |
| POST | `/admin/growth/business-models` | admin | Cree un business model. |
| PUT | `/admin/growth/business-models/{id}` | admin | Modifie un business model. |
| DELETE | `/admin/growth/business-models/{id}` | admin | Supprime un business model. |
| GET | `/admin/roles` | `manage roles` | Liste les roles. |
| POST | `/admin/roles` | `manage roles` | Cree un role. |
| PUT/PATCH | `/admin/roles/{role}` | `manage roles` | Modifie un role. |
| DELETE | `/admin/roles/{role}` | `manage roles` | Supprime un role. |
| GET | `/admin/permissions` | `manage permissions` | Liste les permissions. |
| POST | `/admin/permissions` | `manage permissions` | Cree une permission. |
| PUT/PATCH | `/admin/permissions/{permission}` | `manage permissions` | Modifie une permission. |
| DELETE | `/admin/permissions/{permission}` | `manage permissions` | Supprime une permission. |
| GET | `/admin/users` | `manage users` | Liste les utilisateurs. |
| POST | `/admin/users/{user}/roles` | `manage users` | Assigne un role a l'utilisateur. |

## Reponses et erreurs communes

- `200 OK`: operation reussie.
- `201 Created`: creation reussie (`accounts`, `transactions`, etc.).
- `204 No Content`: suppression sans corps de reponse (`budgets`).
- `400 Bad Request`: erreur domaine, par exemple devise deja existante ou fonds insuffisants.
- `401 Unauthorized`: utilisateur non authentifie.
- `403 Forbidden`: permission manquante.
- `404 Not Found`: ressource absente ou n'appartenant pas a l'utilisateur.
- `422 Unprocessable Entity`: validation Laravel echouee.
- `500 Internal Server Error`: exception non geree.
