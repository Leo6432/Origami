(function () {
  "use strict";

  var PRIX_UNITAIRE = 5; // euros la paire

  var root        = document.documentElement;
  var colorBtns   = document.querySelectorAll(".color");
  var colorSelect = document.getElementById("colorSelect");
  var qtyInput    = document.getElementById("qty");
  var totalEl     = document.getElementById("total");
  var form        = document.getElementById("orderForm");
  var confirmBox  = document.getElementById("confirm");
  var confirmIcon = document.getElementById("confirmIcon");
  var confirmTtl  = document.getElementById("confirmTitle");
  var confirmMsg  = document.getElementById("confirmMessage");
  var recap       = document.getElementById("recap");

  /* ---------- Couleur du papier ---------- */
  function appliquerCouleur(btn) {
    root.style.setProperty("--paper-light", btn.dataset.light);
    root.style.setProperty("--paper-mid",   btn.dataset.mid);
    root.style.setProperty("--paper-shade", btn.dataset.shade);
    root.style.setProperty("--paper-deep",  btn.dataset.deep);

    colorBtns.forEach(function (b) {
      var actif = b === btn;
      b.classList.toggle("is-active", actif);
      b.setAttribute("aria-checked", actif ? "true" : "false");
    });

    colorSelect.value = btn.dataset.name;
  }

  colorBtns.forEach(function (btn) {
    btn.addEventListener("click", function () { appliquerCouleur(btn); });
  });

  // Le menu déroulant du formulaire pilote aussi l'aperçu.
  colorSelect.addEventListener("change", function () {
    colorBtns.forEach(function (b) {
      if (b.dataset.name === colorSelect.value) appliquerCouleur(b);
    });
  });

  /* ---------- Quantité et total ---------- */
  function quantite() {
    var n = parseInt(qtyInput.value, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (n > 20) n = 20;
    return n;
  }

  function majTotal() {
    qtyInput.value = quantite();
    totalEl.textContent = quantite() * PRIX_UNITAIRE + " €";
  }

  document.getElementById("minus").addEventListener("click", function () {
    qtyInput.value = quantite() - 1;
    majTotal();
  });
  document.getElementById("plus").addEventListener("click", function () {
    qtyInput.value = quantite() + 1;
    majTotal();
  });
  qtyInput.addEventListener("input", majTotal);
  qtyInput.addEventListener("blur", majTotal);
  majTotal();

  /* ---------- Numéro de commande ---------- */
  function numeroCommande() {
    var d = new Date();
    var jour = String(d.getDate()).padStart(2, "0") + String(d.getMonth() + 1).padStart(2, "0");
    var suffixe = String(Math.floor(Math.random() * 9000) + 1000);
    return "GR-" + jour + "-" + suffixe;
  }

  /* ---------- Récapitulatif ---------- */
  function ligneRecap(terme, valeur) {
    var dt = document.createElement("dt");
    dt.textContent = terme;
    var dd = document.createElement("dd");
    dd.textContent = valeur;
    recap.append(dt, dd);
  }

  /* ---------- Envoi ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var nom     = document.getElementById("name");
    var contact = document.getElementById("contact");
    var valide  = true;

    [nom, contact].forEach(function (champ) {
      var vide = champ.value.trim() === "";
      champ.classList.toggle("invalid", vide);
      if (vide) valide = false;
    });

    if (!valide) {
      (nom.value.trim() === "" ? nom : contact).focus();
      return;
    }

    var n        = quantite();
    var total    = n * PRIX_UNITAIRE;
    var paiement = form.querySelector('input[name="payment"]:checked').value;
    var numero   = numeroCommande();

    recap.textContent = "";
    ligneRecap("Commande", numero);
    ligneRecap("Nom", nom.value.trim());
    ligneRecap("Couleur", colorSelect.value);
    ligneRecap("Quantité", n + (n > 1 ? " paires" : " paire"));
    ligneRecap("Total", total + " €");

    if (paiement === "especes") {
      confirmIcon.classList.remove("pending");
      confirmIcon.textContent = "✓";
      confirmTtl.textContent = "Commande enregistrée — paiement en espèces";
      confirmMsg.innerHTML =
        "<strong>Rendez-vous à l'accueil pour payer.</strong><br>" +
        "Présentez le numéro de commande <strong>" + numero + "</strong> et réglez " +
        "<strong>" + total + " €</strong> en espèces. Vos boucles vous seront remises sur place.";
    } else {
      confirmIcon.classList.add("pending");
      confirmIcon.textContent = "⏳";
      confirmTtl.textContent = "Commande notée — paiement par carte";
      confirmMsg.innerHTML =
        "Le paiement par carte bancaire <strong>arrive bientôt</strong>. " +
        "Votre commande <strong>" + numero + "</strong> est mise de côté : on vous recontacte " +
        "dès que le paiement en ligne est ouvert. Vous pouvez aussi repasser en espèces à l'accueil.";
    }

    form.hidden = true;
    confirmBox.hidden = false;
    confirmBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  /* ---------- Nouvelle commande ---------- */
  document.getElementById("again").addEventListener("click", function () {
    form.reset();
    majTotal();
    colorSelect.dispatchEvent(new Event("change"));
    document.querySelectorAll("input.invalid").forEach(function (i) {
      i.classList.remove("invalid");
    });
    confirmBox.hidden = true;
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
