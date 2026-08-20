(function () {
  "use strict";

  var PRIX_UNITAIRE = 5; // euros la paire

  var motionReduite = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var COULEURS_FETE = ["#ff5f7e", "#ffd166", "#5ec8ff", "#b98cff", "#6ee7a8", "#ff8f5e"];

  /* ============ Confettis ============ */
  function lacherConfettis(hote, nombre, duree) {
    if (motionReduite) return;
    for (var i = 0; i < nombre; i++) {
      var c = document.createElement("span");
      c.style.left = Math.random() * 100 + "%";
      c.style.background = COULEURS_FETE[i % COULEURS_FETE.length];
      c.style.animationDuration = (duree + Math.random() * 1.2).toFixed(2) + "s";
      c.style.animationDelay = (Math.random() * 1.1).toFixed(2) + "s";
      c.style.width = (6 + Math.random() * 7).toFixed(0) + "px";
      c.style.height = (10 + Math.random() * 10).toFixed(0) + "px";
      if (Math.random() > 0.6) c.style.borderRadius = "50%";
      hote.appendChild(c);
    }
  }

  /* ============ Intro boule disco ============ */
  var intro = document.getElementById("intro");

  if (intro) {
    var fermee = false;

    function fermerIntro() {
      if (fermee) return;
      fermee = true;
      intro.classList.add("is-gone");
      document.body.style.overflow = "";
      window.setTimeout(function () { intro.remove(); }, 800);
      window.removeEventListener("keydown", surTouche);
    }

    function surTouche() { fermerIntro(); }

    document.body.style.overflow = "hidden";
    lacherConfettis(document.getElementById("confetti"), 40, 2.6);

    document.getElementById("introSkip").addEventListener("click", fermerIntro);
    intro.addEventListener("click", fermerIntro);
    window.addEventListener("keydown", surTouche);
    window.setTimeout(fermerIntro, motionReduite ? 600 : 3400);
  }

  /* ============ Quantité et total ============ */
  var qtyInput = document.getElementById("qty");
  var totalEl  = document.getElementById("total");

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

  /* ============ Commande ============ */
  var form        = document.getElementById("orderForm");
  var confirmBox  = document.getElementById("confirm");
  var confirmIcon = document.getElementById("confirmIcon");
  var confirmTtl  = document.getElementById("confirmTitle");
  var confirmMsg  = document.getElementById("confirmMessage");
  var recap       = document.getElementById("recap");

  function numeroCommande() {
    var d = new Date();
    var jour = String(d.getDate()).padStart(2, "0") + String(d.getMonth() + 1).padStart(2, "0");
    return "GR-" + jour + "-" + String(Math.floor(Math.random() * 9000) + 1000);
  }

  function ligneRecap(terme, valeur) {
    var dt = document.createElement("dt");
    dt.textContent = terme;
    var dd = document.createElement("dd");
    dd.textContent = valeur;
    recap.append(dt, dd);
  }

  function feteDeCommande() {
    if (motionReduite) return;
    var pluie = document.createElement("div");
    pluie.className = "confetti confetti-page";
    document.body.appendChild(pluie);
    lacherConfettis(pluie, 60, 2.4);
    window.setTimeout(function () { pluie.remove(); }, 5200);
  }

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
    var envie    = document.getElementById("wish").value.trim();
    var paiement = form.querySelector('input[name="payment"]:checked').value;
    var numero   = numeroCommande();

    recap.textContent = "";
    ligneRecap("Commande", numero);
    ligneRecap("Nom", nom.value.trim());
    ligneRecap("Quantité", n + (n > 1 ? " paires" : " paire"));
    if (envie) ligneRecap("Envie de couleur", envie);
    ligneRecap("Total", total + " €");

    if (paiement === "especes") {
      confirmIcon.classList.remove("pending");
      confirmIcon.textContent = "✓";
      confirmTtl.textContent = "Commande enregistrée — paiement en espèces";
      confirmMsg.innerHTML =
        "<strong>Rendez-vous à l'accueil pour payer.</strong><br>" +
        "Présentez le numéro de commande <strong>" + numero + "</strong> et réglez " +
        "<strong>" + total + " €</strong> en espèces. Vous choisirez le papier sur place, " +
        "et vos boucles vous seront remises dans la foulée.";
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
    feteDeCommande();
  });

  document.getElementById("again").addEventListener("click", function () {
    form.reset();
    majTotal();
    document.querySelectorAll("input.invalid").forEach(function (i) {
      i.classList.remove("invalid");
    });
    confirmBox.hidden = true;
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
