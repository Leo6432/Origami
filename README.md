# Grues d'Origami — boutique

Petit site vitrine pour vendre des boucles d'oreilles grue en origami, **5 € la paire**.

## Ouvrir le site

Aucune installation : ouvrez `index.html` dans un navigateur.
Pour le mettre en ligne, n'importe quel hébergement statique convient
(GitHub Pages, Netlify, Vercel…) — il suffit de déposer les trois fichiers.

## Fichiers

| Fichier      | Rôle                                                        |
|--------------|-------------------------------------------------------------|
| `index.html` | Le site : accueil, fiche produit, détails, formulaire        |
| `style.css`  | Mise en page et couleurs                                     |
| `script.js`  | Choix de couleur, quantité, total, message de confirmation   |

## Le paiement

Le formulaire ne prélève rien, il enregistre juste le choix du client :

- **Espèces** → message « **Rendez-vous à l'accueil pour payer** », avec le
  numéro de commande (`GR-JJMM-XXXX`) et le montant à régler sur place.
- **Carte bancaire** → message « paiement en ligne bientôt disponible »,
  la commande est mise de côté. À brancher plus tard sur un vrai
  prestataire (Stripe, SumUp, PayPal…).

## Ce qu'on peut changer facilement

- **Le prix** : `PRIX_UNITAIRE` en haut de `script.js`.
- **Les couleurs de papier** : les boutons `.color` dans `index.html`
  (attributs `data-light`, `data-mid`, `data-shade`, `data-deep`) et les
  options du menu déroulant du formulaire.
- **Les textes** (matières, dimensions, entretien) : section « Détails ».
- **La grue** : dessinée en SVG dans `index.html`, elle prend
  automatiquement la couleur choisie. On peut la remplacer par une vraie
  photo du produit.
