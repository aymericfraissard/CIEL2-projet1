const btnConnexion = document.getElementById('btnConnexion');
const btnInscription = document.getElementById('btnInscription');
const zoneMessage1 = document.getElementById('zoneMessage1');
const zoneMessage = document.getElementById('zoneMessage');

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

btnInscription.addEventListener('click', function () {
  const pseudo = document.getElementById('registerUser').value;
  const motDePasse = document.getElementById('registerPass').value;
  const mail =document.getElementById('registerMail').value;
  const prenom = document.getElementById('registerprenom').value;
  const nom = document.getElementById('registernom').value;

  fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ V_log: pseudo, V_pass: motDePasse , V_mail:mail , V_prenom : prenom , V_nom : nom})
  })
    .then(function (reponse) { return reponse.json(); })
    .then(function (donnees) {
      if (donnees.tokenId) {
        localStorage.setItem('tokenId', donnees.tokenId);
        localStorage.setItem('pseudo', pseudo);
        afficherApplication();
      } else {
        zoneMessage1.textContent = donnees.message;
      }
    });
});

//on cache le pop-up et on affiche l'application principale
function afficherApplication() {
  fetch('/check', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('tokenId')
    }
  })
    .then(reponse => reponse.json())
    .then(data => {
      if (data.data === true) {
        fetch('/profil', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('tokenId')
          }
        })
        .then(response => response.json())
        .then(profil => {
          if (profil.admin === 1) {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'accueil.html';
          }
        });
      }
    })
};