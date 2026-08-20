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
| `script.js`  | Intro disco, quantité, total, message de confirmation        |

## Le paiement

Le formulaire ne prélève rien, il enregistre juste le choix du client :

- **Espèces** → message « **Rendez-vous à l'accueil pour payer** », avec le
  numéro de commande (`GR-JJMM-XXXX`) et le montant à régler sur place.
- **Carte bancaire** → message « paiement en ligne bientôt disponible »,
  la commande est mise de côté. À brancher plus tard sur un vrai
  prestataire (Stripe, SumUp, PayPal…).

## L'intro disco

À l'ouverture du site : une boule à facettes qui descend, des faisceaux
colorés qui tournent et des confettis, pendant ~3,4 s. On peut passer avec
le bouton « Passer », un clic ou une touche. Des confettis retombent aussi
quand une commande est validée.

Pour raccourcir ou allonger, la durée est dans `script.js`
(`window.setTimeout(fermerIntro, ... 3400)`). Les visiteurs qui ont activé
« réduire les animations » sur leur appareil n'ont ni confettis ni boule
qui tourne.

## Ce qu'on peut changer facilement

- **Le prix** : `PRIX_UNITAIRE` en haut de `script.js`.
- **La couleur du papier de la grue** : les variables `--paper-light`,
  `--paper-mid`, `--paper-shade`, `--paper-deep` en haut de `style.css`.
- **Les textes** (matières, dimensions, entretien) : section « Détails ».
- **La boucle d'oreille** : crochet, chaîne et grue sont dessinés ensemble
  dans un seul SVG (`<symbol id="earring">` en haut de `index.html`), donc
  la chaîne reste toujours accrochée à la grue. On peut le remplacer par
  une vraie photo du produit.

Le choix des couleurs se fait de vive voix : le formulaire garde juste un
champ facultatif « une envie de couleur ? ».
