# Dashboard contacts — Design Spec
Date: 2026-06-07

## Objectif
Enregistrer chaque soumission du formulaire de contact de studioweb.ma dans un Google Sheet, en plus de l'email existant sur iCloud.

## Architecture

```
Formulaire site → api/contact.js → Resend (email iCloud) ✅ existant
                                 → Google Apps Script URL → Google Sheets 🆕
```

## Stockage : Google Apps Script Web App

- L'utilisateur crée un Google Sheet et y déploie un Apps Script en tant que Web App publique
- L'URL du Web App est stockée dans Vercel comme variable d'environnement `GOOGLE_SHEET_URL`
- Pas de Google Cloud, pas de Service Account, pas de credentials complexes

## Colonnes du Google Sheet

| # | Colonne | Valeur |
|---|---------|--------|
| 1 | Date | Horodatage automatique (DD/MM/YYYY HH:mm) |
| 2 | Nom | `name` du formulaire |
| 3 | Email | `email` du formulaire |
| 4 | Type de projet | `type` du formulaire |
| 5 | Message | `message` du formulaire |
| 6 | Statut | "À traiter" par défaut (mis à jour manuellement) |

## Modifications

### `api/contact.js`
Après l'envoi Resend réussi, appel fire-and-forget vers `GOOGLE_SHEET_URL` avec les données JSON. L'échec du Sheet ne bloque pas la réponse au client.

### Google Apps Script (nouveau, dans le Sheet)
`doPost(e)` : parse le JSON, appelle `sheet.appendRow()`, retourne "OK".

## Gestion d'erreurs
- Si `GOOGLE_SHEET_URL` est absent → log warning, continue sans planter
- Si le Sheet est inaccessible → log error, ne pas retourner d'erreur au client
- L'email reste la source de vérité principale

## Setup utilisateur (one-time)
1. Créer Google Sheet, nommer la feuille
2. Coller le script Apps Script, déployer en Web App (accès : Tout le monde)
3. Copier l'URL de déploiement
4. Ajouter `GOOGLE_SHEET_URL=<url>` dans Vercel Environment Variables
