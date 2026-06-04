# Blog Section Design Spec

## Summary

Ajouter une section "Ressources & Insights" dans `index.html`, entre les sections Tarifs et Contact. Section statique HTML/CSS, cohérente avec le thème dark du site.

## Décisions

- **Intégration** : section dans `index.html` (pas de page séparée)
- **Langue** : Français
- **Layout** : liste verticale — image couleur à gauche (120×80px), tag catégorie + titre + extrait + durée lecture à droite
- **Position** : après `#tarifs`, avant `#contact`

## 3 Articles

1. **"L'état du digital au Maroc en 2025 : chiffres clés pour les PME"**
   - Catégorie : Marché Marocain (couleur amber `#f59e0b`)
   - Durée : 5 min de lecture
   - Extrait : E-commerce, réseaux sociaux, mobile — où en est le Maroc numérique ?
   - Couleur image : dégradé bleu `#1e3a5f → #2d6a9f`

2. **"5 erreurs de site web qui font fuir vos visiteurs (et comment les corriger)"**
   - Catégorie : Conseils (couleur emerald `#10b981`)
   - Durée : 4 min de lecture
   - Extrait : Lenteur, design daté, absence de CTA clair…
   - Couleur image : dégradé vert `#1a3a2a → #2d7a4f`

3. **"Ce que doit absolument contenir une bonne landing page en 2025"**
   - Catégorie : Conseils (couleur violet `#a78bfa`)
   - Durée : 6 min de lecture
   - Extrait : Hero, preuves sociales, CTA, formulaire — les éléments indispensables.
   - Couleur image : dégradé violet `#2a1a3a → #6d4a9f`

## Design

- Fond : `#0a0a0a` (cohérent avec le reste du site)
- Titre section centré avec label "Blog" en amber au-dessus
- Cartes séparées par bordure `#1f1f1f`
- Hover state : fond `#111` sur la ligne
- Tags catégorie avec fond semi-transparent
- Flèche `→` à droite pour indiquer la lecture
- Les articles ne linkent nulle part pour l'instant (href="#" ou pas de lien)

## Skills à appliquer

- `ui-ux-pro-max` : cohérence design, hiérarchie typographique, espacement
- `impeccable` : polish visuel, micro-interactions hover, détails accessibility
