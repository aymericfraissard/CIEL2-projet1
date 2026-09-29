// envoi du formulaire de connexion vers POST /login
btnConnexion.addEventListener('click', function () {
  const pseudo = document.getElementById('loginUser').value;
  const motDePasse = document.getElementById('loginPass').value;

  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ V_log: pseudo, V_pass: motDePasse })
  })
    .then(function (reponse) { return reponse.json(); })
    .then(function (donnees) {
      if (donnees.tokenId) {
        localStorage.setItem('tokenId', donnees.tokenId);
        localStorage.setItem('pseudo', pseudo);
        afficherApplication();
      } else {
        zoneMessage.textContent = donnees.message;
      }
    });
});


// déconnexion
btnDeconnexion.addEventListener('click', function () {
  fetch('/endgame', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('tokenId')
    },
    body: JSON.stringify({})
  })
    .then(function (reponse) { return reponse.json(); })
    .then(function (donnees) {
      console.log(donnees.message);
    });

});