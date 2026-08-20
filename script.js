(function () {
  "use strict";

  var PRIX_SUGGERE = 5;  // euros la paire, valeur de départ dans le champ
  var PRIX_MIN     = 1;  // euros — garde-fou local, doit rester ≤ au minimum Stripe
  var PRIX_MAX     = 50; // euros — garde-fou local, purement pour éviter les fautes de frappe

  /* ==========================================================
     PAIEMENT — à remplir par Colin. Voir le README, section
     « Encaisser pour de vrai ». Tant que le lien est vide, le
     site reste en démonstration (aucun argent n'est encaissé).
     N'écrivez ici QUE des informations publiques : un lien de
     paiement, une clé « publishable » (pk_live_…), un IBAN que
     vous acceptez d'afficher. JAMAIS une clé secrète (sk_…).
     ========================================================== */
  var PAIEMENT = {

    /* 1. Lien de paiement, créé côté Stripe avec l'option
          « Le client choisit le prix » (customer chooses price)
          sur le produit — puisqu'ici chaque client fixe son
          propre montant. Dès qu'il est rempli, les boutons
          Apple Pay / carte envoient le client dessus.
          Exemple : "https://buy.stripe.com/xxxxxxxx"            */
    lien: "https://buy.stripe.com/test_00w8wP2vD7BD84XeTWds400",

    /* 2. Nom du paramètre d'URL pour pré-remplir le montant sur
          la page Stripe. VÉRIFIÉ le 20/08 : ce lien Stripe ignore
          "prefilled_price" et demande au client de taper son
          montant lui-même — ce qui reste cohérent avec un prix
          libre. Laissé à "" pour ne pas envoyer un paramètre
          inutile. Repassez-le à "prefilled_price" seulement si
          vous recréez un lien et que le test ci-dessus marche :
          ouvrez `votre_lien?prefilled_price=1000` et vérifiez
          que 10,00 € apparaît pré-rempli avant de vous y fier.  */
    parametreMontant: "",

    /* 3. Virement bancaire (facultatif). Renseigné = un bouton
          « Virement » apparaît et affiche ces informations.
          Un IBAN affiché sur un site public ne permet que de
          RECEVOIR de l'argent, mais il devient lisible par tous. */
    virement: {
      iban: "",
      beneficiaire: "",
      banque: ""
    }
  };

  var LIEN_ACTIF    = /^https:\/\//.test(PAIEMENT.lien.trim());
  var VIREMENT_ACTIF = PAIEMENT.virement.iban.trim() !== "";

  var motionReduite = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var COULEURS_FETE = ["#ff5f7e", "#ffd166", "#5ec8ff", "#b98cff", "#6ee7a8", "#ff8f5e"];

  var $ = function (id) { return document.getElementById(id); };

  /* ============ Confettis ============ */
  function lacherConfettis(hote, nombre, duree) {
    if (motionReduite || !hote) return;
    for (var i = 0; i < nombre; i++) {
      var c = document.createElement("span");
      c.style.left = Math.random() * 100 + "%";
      c.style.background = COULEURS_FETE[i % COULEURS_FETE.length];
      c.style.animationDuration = (duree + Math.random() * 1.2).toFixed(2) + "s";
      c.style.animationDelay = (Math.random() * 1).toFixed(2) + "s";
      c.style.width = (6 + Math.random() * 7).toFixed(0) + "px";
      c.style.height = (10 + Math.random() * 10).toFixed(0) + "px";
      if (Math.random() > 0.6) c.style.borderRadius = "50%";
      hote.appendChild(c);
    }
  }

  function fete() {
    if (motionReduite) return;
    var pluie = document.createElement("div");
    pluie.className = "confetti confetti-page";
    document.body.appendChild(pluie);
    lacherConfettis(pluie, 55, 2.4);
    window.setTimeout(function () { pluie.remove(); }, 5000);
  }

  /* ============ Arrivée ============ */
  var intro = $("intro");
  if (intro) {
    var partie = false;
    var fermerIntro = function () {
      if (partie) return;
      partie = true;
      intro.classList.add("is-gone");
      window.setTimeout(function () { intro.remove(); }, 700);
      window.removeEventListener("keydown", fermerIntro);
    };
    lacherConfettis($("confetti"), 34, 2.4);
    intro.addEventListener("click", fermerIntro);
    window.addEventListener("keydown", fermerIntro);
    window.setTimeout(fermerIntro, motionReduite ? 500 : 2800);
  }

  /* ============ Panneaux (un seul visible à la fois) ============ */
  var panneaux = {
    shop:  $("panelShop"),
    sheet: $("panelSheet"),
    iban:  $("panelIban"),
    done:  $("panelDone")
  };

  function montrer(nom) {
    Object.keys(panneaux).forEach(function (cle) {
      panneaux[cle].hidden = (cle !== nom);
    });
    var p = panneaux[nom];      // relance l'animation d'apparition
    p.style.animation = "none";
    void p.offsetWidth;
    p.style.animation = "";
  }

  /* ============ Prix (libre, fixé par le client) ============ */
  var qte = 1;
  var unitPriceInput = $("unitPrice");

  function euros(m) {
    return (Math.round(m * 100) / 100).toFixed(m % 1 === 0 ? 0 : 2).replace(".", ",") + " €";
  }

  function prixUnitaire() {
    var v = parseFloat(String(unitPriceInput.value).replace(",", "."));
    if (isNaN(v) || v <= 0) v = PRIX_SUGGERE;
    return v;
  }

  function montants() {
    var net = qte * prixUnitaire();
    return { net: net };
  }

  function majPrix() {
    var m = montants();
    $("qtyValue").textContent = qte;
    $("price").textContent = euros(m.net);
  }

  $("minus").addEventListener("click", function () {
    if (qte > 1) { qte--; majPrix(); }
  });
  $("plus").addEventListener("click", function () {
    if (qte < 20) { qte++; majPrix(); }
  });

  unitPriceInput.addEventListener("input", majPrix);
  unitPriceInput.addEventListener("blur", function () {
    var v = prixUnitaire();
    if (v < PRIX_MIN) v = PRIX_MIN;
    if (v > PRIX_MAX) v = PRIX_MAX;
    unitPriceInput.value = v;
    majPrix();
  });

  majPrix();

  /* ============ Paiement ============ */
  /* Message affiché au-dessus du bouton, selon le cas. */

  function reference() {
    var d = new Date();
    var jour = String(d.getDate()).padStart(2, "0") + String(d.getMonth() + 1).padStart(2, "0");
    return "GR-" + jour + "-" + String(Math.floor(Math.random() * 9000) + 1000);
  }

  function ouvrirFeuille() {
    var m = montants();
    $("sheetQty").textContent = qte + (qte > 1 ? " paires" : " paire");
    $("sheetTotal").textContent = euros(m.net);
    if (LIEN_ACTIF) {
      $("sheetDemo").hidden = false;
      $("sheetDemo").textContent =
        "Sur la page suivante, indiquez ce montant : " + euros(m.net) + ".";
      $("sheetPay").textContent = "Continuer vers le paiement";
    } else {
      $("sheetDemo").hidden = false;
      $("sheetDemo").textContent = "Démonstration : aucun paiement n'est réellement encaissé.";
      $("sheetPay").textContent = "Payer " + euros(m.net);
    }
    $("sheetPay").className = "btn btn-stripe";
    montrer("sheet");
  }

  /* Envoie le client vers le vrai prestataire de paiement, avec le
     montant total (prix libre × quantité, remise déduite). */
  function allerAuPaiement() {
    var url = PAIEMENT.lien.trim();
    if (PAIEMENT.parametreMontant) {
      var centimes = Math.round(montants().net * 100);
      url += (url.indexOf("?") === -1 ? "?" : "&") +
             encodeURIComponent(PAIEMENT.parametreMontant) + "=" + centimes;
    }
    window.location.href = url;
  }

  /* Le lien accepte-t-il un montant pré-rempli ? Si oui, la page
     Stripe affichera déjà le bon total et on peut y envoyer le
     client directement. Sinon, on lui montre d'abord le montant
     à taper lui-même, pour qu'il ne parte pas les mains vides. */
  var MONTANT_TRANSMIS = LIEN_ACTIF && !!PAIEMENT.parametreMontant;

  function demarrerPaiement() {
    if (MONTANT_TRANSMIS) { allerAuPaiement(); return; }
    ouvrirFeuille();
  }

  $("payStripe").addEventListener("click", demarrerPaiement);
  $("sheetBack").addEventListener("click", function () { montrer("shop"); });

  $("sheetPay").addEventListener("click", function () {
    if (LIEN_ACTIF) { allerAuPaiement(); return; }

    var bouton = $("sheetPay");
    bouton.classList.add("is-loading");
    bouton.textContent = "Paiement…";

    window.setTimeout(function () {
      bouton.classList.remove("is-loading");
      var m = montants();
      $("doneMark").classList.remove("pending");
      $("doneMark").textContent = "✓";
      $("doneTitle").textContent = "Merci !";
      $("doneMsg").innerHTML =
        "Paiement de <b>" + euros(m.net) + "</b> par Stripe — <b>simulé</b>, " +
        "rien n'a été débité. Vos boucles vous attendent auprès de Colin.";
      $("doneRef").textContent = reference();
      montrer("done");
      fete();
    }, 1100);
  });

  /* ============ Virement bancaire ============ */
  if (VIREMENT_ACTIF) {
    $("payTransfer").hidden = false;
    $("ibanValue").textContent = PAIEMENT.virement.iban;
    $("ibanHolder").textContent = PAIEMENT.virement.beneficiaire || "—";
    $("ibanBank").textContent = PAIEMENT.virement.banque || "—";
    $("ibanBankRow").hidden = !PAIEMENT.virement.banque;

    $("payTransfer").addEventListener("click", function () {
      var m = montants();
      $("ibanAmount").textContent = euros(m.net);
      $("ibanRef").textContent = reference();
      montrer("iban");
    });

    $("ibanCopy").addEventListener("click", function () {
      var texte = PAIEMENT.virement.iban.replace(/\s+/g, "");
      var fini = function () {
        $("ibanCopy").textContent = "IBAN copié ✓";
        window.setTimeout(function () { $("ibanCopy").textContent = "Copier l'IBAN"; }, 2000);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(texte).then(fini, function () {});
      }
    });

    $("ibanBack").addEventListener("click", function () { montrer("shop"); });
  }

  /* ============ Espèces ============ */
  $("payCash").addEventListener("click", function () {
    var m = montants();
    $("doneMark").classList.add("pending");
    $("doneMark").textContent = "💶";
    $("doneTitle").textContent = "Rendez-vous à l'accueil";
    $("doneMsg").innerHTML =
      "Présentez ce numéro et réglez <b>" + euros(m.net) + "</b> en espèces. " +
      "Vos boucles vous seront remises sur place.";
    $("doneRef").textContent = reference();
    montrer("done");
  });

  /* ============ Recommencer ============ */
  $("restart").addEventListener("click", function () {
    qte = 1;
    unitPriceInput.value = PRIX_SUGGERE;
    majPrix();
    montrer("shop");
  });
})();
