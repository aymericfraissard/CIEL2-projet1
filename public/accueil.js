const token = localStorage.getItem('tokenId');
if (!token) {
  window.location.href = 'index.html';
}

const pseudoConnecte = document.getElementById('pseudoConnecte');
const btnDeconnexion = document.getElementById('btnDeconnexion');

// Récupérer le profil
fetch('/profil', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(response => response.json())
.then(data => {
  pseudoConnecte.textContent = data.login;
})
.catch(err => console.log(err));

// Déconnexion
if (btnDeconnexion) {
  btnDeconnexion.onclick = () => {
    fetch('/deconnection', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
    .then(() => {
      localStorage.removeItem('tokenId');
      window.location.href = 'index.html';
    })
    .catch(err => {
      localStorage.removeItem('tokenId');
      window.location.href = 'index.html';
    });
  };
}