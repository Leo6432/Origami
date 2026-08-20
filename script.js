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
    lien: "",

    /* 2. Nom du paramètre d'URL utilisé pour pré-remplir le
          montant sur la page Stripe. Le prix par paire × la
          quantité (remise éventuelle déduite) est calculé ici,
          converti en centimes, et transmis via ce paramètre —
          Stripe l'appelle "prefilled_price". À VÉRIFIER en mode
          Test avant de passer en Production : ouvrez le lien
          test avec `?prefilled_price=1000` et confirmez que
          10,00 € apparaît bien pré-rempli. Si votre prestataire
          n'a pas cette option, mettez "" : le client tapera son
          montant lui-même sur la page de paiement.              */
    parametreMontant: "prefilled_price",

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

  /* Codes promo. remise : 0.5 = −50 %. */
  var CODES_PROMO = {
    "gregoire50": { remise: 0.5 }
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
  var promoActif = null;
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
    var brut = qte * prixUnitaire();
    var remise = promoActif ? brut * promoActif.remise : 0;
    return { brut: brut, remise: remise, net: brut - remise };
  }

  function majPrix() {
    var m = montants();
    $("qtyValue").textContent = qte;
    $("price").textContent = euros(m.net);
    $("priceOld").textContent = euros(m.brut);
    $("priceOld").hidden = !promoActif;
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

  /* ============ Code promo ============ */
  var promoInput = $("promo");
  var promoMsg   = $("promoMsg");

  promoInput.addEventListener("input", function () {
    var cle = promoInput.value.trim().toLowerCase().replace(/\s+/g, "");

    if (cle === "") {
      promoActif = null;
      promoMsg.textContent = "";
      promoMsg.className = "promo-msg";
      promoInput.classList.remove("ok");
    } else if (CODES_PROMO[cle]) {
      promoActif = { code: cle, remise: CODES_PROMO[cle].remise };
      promoMsg.textContent = "Code accepté : −" + Math.round(promoActif.remise * 100) + " % 🎉";
      promoMsg.className = "promo-msg ok";
      promoInput.classList.add("ok");
    } else {
      promoActif = null;
      promoMsg.textContent = "Ce code n'existe pas.";
      promoMsg.className = "promo-msg ko";
      promoInput.classList.remove("ok");
    }
    majPrix();
  });

  majPrix();

  /* ============ Paiement ============ */
  if (LIEN_ACTIF) $("sheetDemo").hidden = true;
  var moyen = "apple"; // "apple" ou "carte"

  function reference() {
    var d = new Date();
    var jour = String(d.getDate()).padStart(2, "0") + String(d.getMonth() + 1).padStart(2, "0");
    return "GR-" + jour + "-" + String(Math.floor(Math.random() * 9000) + 1000);
  }

  var LOGO_APPLE = '<svg viewBox="0 0 24 24" class="apple" aria-hidden="true">' +
    '<path fill="currentColor" d="M16.2 12.6c0-2.2 1.8-3.3 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.3.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.6.7 2.8.7c1.2 0 1.9-1 2.6-2.1.8-1.2 1.2-2.4 1.2-2.5-.1 0-2.3-.9-2.3-3.3zM14 6.2c.6-.7 1-1.7.9-2.7-.9 0-2 .6-2.6 1.3-.6.6-1.1 1.7-.9 2.6 1 .1 2-.5 2.6-1.2z"/></svg>';

  function ouvrirFeuille(type) {
    moyen = type;
    var m = montants();
    $("sheetBrand").innerHTML = (type === "apple") ? LOGO_APPLE + "<span>Pay</span>" : "Carte bancaire";

    if (promoActif) {
      $("sheetPromo").hidden = false;
      $("sheetPromoCode").textContent = "Code " + promoActif.code;
      $("sheetPromoValue").textContent = "−" + euros(m.remise);
    } else {
      $("sheetPromo").hidden = true;
    }

    $("sheetQty").textContent = qte + (qte > 1 ? " paires" : " paire");
    $("sheetTotal").textContent = euros(m.net);
    $("sheetPay").textContent = "Payer " + euros(m.net);
    $("sheetPay").className = "btn " + (type === "apple" ? "btn-apple" : "btn-card");
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

  function demarrerPaiement(type) {
    if (LIEN_ACTIF) { allerAuPaiement(); return; }
    ouvrirFeuille(type);
  }

  $("payApple").addEventListener("click", function () { demarrerPaiement("apple"); });
  $("payCard").addEventListener("click", function () { demarrerPaiement("carte"); });
  $("sheetBack").addEventListener("click", function () { montrer("shop"); });

  $("sheetPay").addEventListener("click", function () {
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
        "Paiement de <b>" + euros(m.net) + "</b> par " +
        (moyen === "apple" ? "Apple Pay" : "carte bancaire") + " — <b>simulé</b>, " +
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
    promoActif = null;
    promoInput.value = "";
    promoMsg.textContent = "";
    promoMsg.className = "promo-msg";
    promoInput.classList.remove("ok");
    majPrix();
    montrer("shop");
  });
})();
