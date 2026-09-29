// variables globales


// récupération des éléments du DOM
const btnConnexion = document.getElementById('btnConnexion');
const btnInscription = document.getElementById('btnInscription');
const btnDeconnexion = document.getElementById('btnDeconnexion');

// envoi du formulaire d'inscription vers POST /register
btnInscription.addEventListener('click', function () {
  const pseudo = document.getElementById('regUser').value;
  const motDePasse = document.getElementById('regPass').value;
  const zoneMessage = document.getElementById('registerMsg');

  fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ V_log: pseudo, V_pass: motDePasse })
  })
    .then(function (reponse) { return reponse.json(); })
    .then(function (donnees) {
      zoneMessage.textContent = donnees.message;
    });
});


// envoi du formulaire de connexion vers POST /login
btnConnexion.addEventListener('click', function () {
  const pseudo = document.getElementById('loginUser').value;
  const motDePasse = document.getElementById('loginPass').value;
  const zoneMessage = document.getElementById('loginMsg');

  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ V_log: pseudo, V_pass: motDePasse })
  })
    .then(function (reponse) { return reponse.json(); })
    .then(function (donnees) {
      if (donnees.tokenId) {
        pseudoConnecte = pseudo;
        localStorage.setItem('TokenId', donnees.tokenId);
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
      'Authorization': 'Bearer ' + localStorage.getItem('TokenId')
    },
    body: JSON.stringify({})
  })
    .then(function (reponse) { return reponse.json(); })
    .then(function (donnees) {
      console.log(donnees.message);
    });

  pseudoConnecte = null;
  localStorage.removeItem('TokenId');
});


// on cache le pop-up et on affiche l'application principale
// function afficherApplication() {
//   fetch('/check', {
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': 'Bearer ' + localStorage.getItem('Token   Id')
//     }
//   })
//     .then(reponse => reponse.json())
//     .then(data => {
//       if (data.data === true) {
//         document.getElementById('authOverlay').style.display = 'none';
//         document.getElementById('mainApp').style.display = 'block';
//         document.getElementById('displayUsername').textContent = pseudoConnecte;
//         chargerClassement();
//       }
//       else {
//         return;

//       }
//     })
// };
