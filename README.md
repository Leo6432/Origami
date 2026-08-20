# Origami — fait main par Colin

Page unique pour vendre les boucles d'oreilles grue, **5 € la paire**.
Un seul écran, aucun scroll : tout se passe au même endroit.

## Ouvrir

Aucune installation : ouvrez `index.html` dans un navigateur.
Pour le mettre en ligne, n'importe quel hébergement statique convient
(GitHub Pages, Netlify, Vercel…) — il suffit de déposer les trois fichiers.

| Fichier      | Rôle                                            |
|--------------|-------------------------------------------------|
| `index.html` | Les trois écrans + le dessin de la boucle en SVG |
| `style.css`  | Mise en page (verrouillée sur la hauteur d'écran) |
| `script.js`  | Prix, code promo, parcours de paiement            |

## Le parcours

1. **Arrivée** — boule à facettes, confettis, « Origami / Fait main par
   Colin ». Disparaît après ~2,8 s, ou au premier clic / touche.
2. **Boutique** — les deux boucles, la quantité, le prix, le code promo et
   les boutons de paiement.
3. **Paiement** — Apple Pay ou carte bancaire ouvrent une feuille avec le
   montant ; « ou régler en espèces à l'accueil » affiche directement le
   numéro de commande à présenter.
4. **Fin** — confirmation, numéro de commande, confettis.

Les écrans se remplacent dans le même cadre : `html, body { overflow:
hidden }` et chaque panneau est limité à la hauteur de la fenêtre. Testé
sur téléphone, tablette, ordinateur et téléphone en paysage.

## ⚠️ Le paiement est simulé

**Aucun argent n'est encaissé.** Les boutons Apple Pay et carte bancaire
jouent une animation de paiement puis affichent une confirmation — c'est
une maquette, et la feuille le dit à l'écran.

Pour encaisser pour de vrai, il faut un prestataire ; une page statique
seule ne peut pas le faire (il faut une clé secrète côté serveur, et Apple
Pay exige en plus un domaine en HTTPS vérifié auprès d'Apple). Deux pistes,
de la plus simple à la plus souple :

- **Stripe Payment Link** — le plus rapide. On crée un lien de paiement
  dans le tableau de bord Stripe, et le bouton pointe dessus. Apple Pay et
  Google Pay s'affichent tout seuls sur les appareils compatibles. En
  échange, on quitte la page le temps du paiement.
- **SumUp / Stripe Checkout** — même principe, avec la possibilité
  d'encaisser aussi en présentiel avec un petit lecteur de carte.

Le remplacement se fait dans `script.js` : au lieu d'ouvrir la feuille,
`ouvrirFeuille()` renvoie vers l'URL du prestataire.

## Le code promo

| Code         | Effet              |
|--------------|--------------------|
| `gregoire50` | −50 % sur le total |

Insensible aux majuscules et aux espaces. Pour en ajouter, une ligne dans
`CODES_PROMO` en haut de `script.js` (`remise: 0.5` = −50 %).

Le code est écrit dans le fichier JavaScript, donc lisible par qui regarde
le code source de la page : pratique pour un code donné de la main à la
main, inutile d'espérer le garder secret.

## Réglages rapides

- **Le prix** : `PRIX_UNITAIRE` en haut de `script.js`.
- **La couleur du papier** : les variables `--paper-*` en haut de
  `style.css`.
- **La durée de l'intro** : le `setTimeout(fermerIntro, … 2800)` dans
  `script.js`.
- **La boucle d'oreille** : crochet, chaîne et grue forment un seul SVG
  (`<symbol id="earring">` dans `index.html`). Remplaçable par une photo.

Les animations se coupent d'elles-mêmes pour les visiteurs qui ont activé
« réduire les animations » sur leur appareil.
