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
3. **Paiement** — Apple Pay ou carte bancaire : renvoi vers le prestataire
   si un lien est configuré, sinon une feuille de démonstration. Un bouton
   « Virement bancaire » apparaît si l'IBAN est renseigné, et « espèces à
   l'accueil » affiche le numéro de commande à présenter.
4. **Fin** — confirmation, numéro de commande, confettis.

Les écrans se remplacent dans le même cadre : `html, body { overflow:
hidden }` et chaque panneau est limité à la hauteur de la fenêtre. Testé
sur téléphone, tablette, ordinateur et téléphone en paysage.

## Encaisser pour de vrai

Tout est branché, il ne manque que **tes** informations. Elles se collent
dans le bloc `PAIEMENT` en haut de `script.js`. Tant qu'il est vide, le
site reste en démonstration et le dit à l'écran.

### Règle de sécurité

Ne colle jamais ici — ni dans un message, ni dans le dépôt — une **clé
secrète** (`sk_live_…`, `sk_test_…`), un identifiant de connexion, ou un
numéro de carte. Le fichier `script.js` est téléchargé par chaque visiteur :
tout ce qu'il contient est public. Seuls un lien de paiement, une clé
« publishable » (`pk_…`) et un IBAN que tu acceptes d'afficher ont leur
place ici.

### Le prix est libre — le client choisit ce qu'il paie

Le site ne fixe plus 5 € : la personne tape elle-même un montant par paire
(5 € suggéré au départ), choisit une quantité, et le total est calculé sur
la page. Ça change la façon de configurer Stripe : il faut un produit en
mode **« Le client choisit le prix »**, pas un prix fixe.

### Option 1 — Stripe Payment Link (recommandée, Apple Pay inclus)

1. Crée un compte sur stripe.com, en type **« Entrepreneur individuel »**
   (pas besoin de société). C'est **toi** qui saisis ton IBAN chez Stripe
   pour recevoir les virements — il ne passe jamais par le site.
   Frais : ~1,5 % + 0,25 € par paiement carte européenne.
2. Reste en mode **Test** pour essayer d'abord (bascule en haut du
   tableau de bord) ; tu repasseras en **Production** une fois que tout
   fonctionne.
3. Produits → *Ajouter un produit* : « Boucles d'oreilles grue ».
4. Sur le prix, choisis **« Le client choisit le prix »** (parfois affiché
   *Customer chooses price* / *pay what you want*), avec un prix suggéré
   à 5 € et, si l'option existe, un **minimum** (1 € par exemple, pour
   éviter les montants à 0).
5. Onglet *Payment Links* → crée un lien pour ce produit.
6. Copie l'adresse obtenue (`https://buy.stripe.com/…`, ou
   `.../test_…` en mode Test) dans :

   ```js
   var PAIEMENT = {
     lien: "https://buy.stripe.com/ton_lien",
     parametreMontant: "prefilled_price",
   ```

Le site calcule lui-même le total (prix par paire × quantité, remise
éventuelle déduite) et l'envoie pré-rempli sur la page Stripe via ce
paramètre. **À vérifier avant de passer en Production** : ouvre ton lien
de test en ajoutant `?prefilled_price=1000` à la fin de l'adresse dans un
navigateur, et confirme que **10,00 €** apparaît bien pré-rempli sur la
page. Si ce n'est pas le cas (Stripe fait parfois évoluer cette fonction),
laisse `parametreMontant: ""` : le client tapera son montant lui-même sur
la page Stripe, ce qui reste tout à fait utilisable.

Apple Pay et Google Pay apparaissent tout seuls sur les appareils
compatibles — rien à configurer, tant que le site est servi en HTTPS.

### Option 2 — un lien que tu as déjà

Même champ `lien` : SumUp, Lydia, Revolut.me… Regarde si le service
propose un paramètre d'URL pour pré-remplir un montant ; sinon mets
`parametreMontant: ""`.

### Option 3 — virement bancaire

Remplis le bloc `virement` avec ton IBAN : un bouton « Virement bancaire »
apparaît et affiche le montant, une référence de commande, le bénéficiaire
et l'IBAN, avec un bouton pour le copier.

```js
    virement: {
      iban: "FR76 …",
      beneficiaire: "Ton nom",
      banque: "Ta banque"
    }
```

Un IBAN ne permet que de **recevoir**. L'afficher publiquement reste un
choix : n'importe qui pourra le lire, le recopier, et s'en servir dans une
tentative d'arnaque en se faisant passer pour toi. Pour de la vente entre
connaissances c'est courant ; pour un site ouvert à tous, préfère
l'option 1.

### Ce qui reste manuel

Le site n'envoie pas de notification et ne tient pas de registre : tu vois
les paiements dans le tableau de bord de Stripe (ou sur ton compte
bancaire). Pour recevoir un mail à chaque commande, il faudrait un petit
serveur — c'est possible, mais c'est un autre chantier.

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
