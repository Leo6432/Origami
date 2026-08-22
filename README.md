# Coupe de cheveux — par Philémon

Page unique pour prendre un paiement de coupe de cheveux, prix libre
(5 € suggéré), environ 20 minutes. Un seul écran, aucun scroll, aucune
animation.

## Ouvrir

Aucune installation : ouvrez `index.html` dans un navigateur.
Pour le mettre en ligne, n'importe quel hébergement statique convient
(GitHub Pages, Netlify, Vercel…) — il suffit de déposer les trois fichiers.

| Fichier      | Rôle                                             |
|--------------|--------------------------------------------------|
| `index.html` | Les quatre écrans + l'icône ciseaux en SVG         |
| `style.css`  | Mise en page (verrouillée sur la hauteur d'écran) |
| `script.js`  | Quantité, prix, parcours de paiement              |

## Le parcours

1. **Boutique** — le nombre de coupes, le prix suggéré, et les boutons
   de paiement.
2. **Paiement** — Stripe ouvre soit directement la page de paiement
   (lien configuré), soit un récapitulatif avec le montant à indiquer.
   « Payer en espèces à l'accueil » affiche directement le numéro de
   commande à présenter.
3. **Fin** — confirmation et numéro de commande.

Les écrans se remplacent dans le même cadre : `html, body { overflow:
hidden }` et chaque panneau est limité à la hauteur de la fenêtre. Testé
sur téléphone, tablette, ordinateur et téléphone en paysage.

## ⚠️ Le paiement en démonstration

Tant que le lien Stripe n'est pas rempli avec un vrai lien de production,
**aucun argent n'est encaissé** : le bouton joue une simulation et le dit
à l'écran.

## Encaisser pour de vrai

Tout est branché, il ne manque que **tes** informations. Elles se collent
dans le bloc `PAIEMENT` en haut de `script.js`.

### Règle de sécurité

Ne colle jamais ici — ni dans un message, ni dans le dépôt — une **clé
secrète** (`sk_live_…`, `sk_test_…`), un identifiant de connexion, ou un
numéro de carte. Le fichier `script.js` est téléchargé par chaque visiteur :
tout ce qu'il contient est public. Seuls un lien de paiement et un IBAN
que tu acceptes d'afficher ont leur place ici.

### Le prix est libre — le client choisit ce qu'il paie

Le site suggère 5 € par coupe (repère affiché, et base de calcul pour
l'espèces et le virement, qui n'ont pas de page Stripe). Sur Stripe, le
produit doit être configuré en mode **« Le client choisit le prix »**.

### Option 1 — Stripe Payment Link (recommandée, Apple Pay inclus)

1. Crée un compte sur stripe.com, en type **« Entrepreneur individuel »**
   (pas besoin de société). C'est **toi** qui saisis ton IBAN chez Stripe
   pour recevoir les virements — il ne passe jamais par le site.
   Frais : ~1,5 % + 0,25 € par paiement carte européenne.
2. Reste en mode **Test** pour essayer d'abord (bascule en haut du
   tableau de bord) ; tu repasseras en **Production** une fois que tout
   fonctionne.
3. Produits → *Ajouter un produit* : « Coupe de cheveux ».
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
     parametreMontant: "",   // voir ci-dessous
   ```

**Vérifié le 20/08 sur le lien actuel : Stripe ignore le pré-remplissage
et demande au client de taper son montant lui-même** — `parametreMontant`
est donc laissé à `""`. Dans ce cas, le site montre d'abord un écran
récapitulatif avec le montant exact à indiquer, avant que le client
clique sur « Continuer vers le paiement ». Si tu recrées un lien et veux
retester le pré-remplissage : ouvre `ton_lien?prefilled_price=1000` dans
un navigateur et vérifie que 10,00 € apparaît déjà rempli avant de
remettre `parametreMontant: "prefilled_price"`.

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

## Réglages rapides

- **Le prix suggéré** : `PRIX_SUGGERE` en haut de `script.js`.
- **La durée affichée** ("environ 20 min") : dans `index.html`, à côté de
  « vous choisissez le prix ».
- **L'icône** : ciseaux dessinés en SVG dans `index.html`, remplaçable par
  une photo.

Le site ne contient aucune animation (pas d'écran d'intro, pas de
confettis) : les écrans changent instantanément.
