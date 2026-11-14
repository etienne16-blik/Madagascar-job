# MADA JOBS — dossier GitHub

Ce dossier est une base de déploiement GitHub Pages avec Supabase. Il reprend le schéma SQL retrouvé dans les fichiers du projet et applique les règles convenues : 50 Ar par mission, 5 missions maximum par jour, prime de parrainage de 500 Ar et retrait minimum de 10 000 Ar.

## Contenu
- `index.html` : interface web responsive en français.
- `assets/style.css` : thème sombre.
- `js/config.js` : configuration publique Supabase à compléter.
- `js/app.js` : inscription, connexion, affichage des missions, parrainage et demandes de retrait.
- `supabase/mada-jobs-schema.sql` : schéma SQL repris et ajusté.
- `.github/workflows/deploy.yml` : déploiement GitHub Pages automatique sur chaque push vers `main`.

## Installation
1. Dans Supabase, ouvrez **SQL Editor** et exécutez `supabase/mada-jobs-schema.sql` sur une sauvegarde ou un projet de test avant la production.
2. Dans `js/config.js`, remplacez `VOTRE-PROJET` et `VOTRE_CLE_ANON_PUBLIQUE` par l'URL et la clé **anon/public** du projet Supabase.
3. N'ajoutez jamais la clé `service_role` dans le site ou dans GitHub.
4. Téléversez le contenu de ce dossier à la racine du dépôt GitHub, branche `main`.
5. Dans GitHub : **Settings → Pages → Build and deployment → GitHub Actions**. Le workflow publiera le site.
6. Vérifiez l'URL Pages, l'inscription, la connexion, les règles RLS et les journaux Supabase.

## Sécurité et limites à traiter avant lancement
- Le schéma SQL contient des flux de dépôt/retrait **en attente de validation** et des libellés qui signalent une simulation. Cela ne transfère pas d'argent. Un véritable paiement exige un prestataire autorisé, une vérification serveur/webhook et un rapprochement des transactions.
- Le code navigateur ne doit jamais pouvoir s'attribuer le rôle administrateur. Ajouter manuellement l'identifiant UUID du compte administrateur dans `admin_roles` depuis l'éditeur SQL, après vérification.
- Les missions soumises passent par validation admin avant crédit. La page actuelle ne fournit pas encore d'interface complète de traitement admin ni de formulaire de preuve image.
- Le code de parrainage ajoute la prime au parrain lorsque le nouveau compte applique un code valide. Avant mise en production, prévoir anti-fraude renforcée (contrôle multi-comptes, validation d'activité et politique de remboursement).
- Faire un audit SQL/RLS et tester les règles sur un projet Supabase de préproduction avant d'utiliser des fonds réels.

## Dépôt
Le dépôt cible mentionné dans le projet est `https://github.com/etienne16-blik/mada-jobs-`. Ce ZIP ne pousse aucun changement automatiquement : il faut déposer ses fichiers dans le dépôt.
