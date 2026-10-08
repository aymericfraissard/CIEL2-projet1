const token = localStorage.getItem('tokenId');
if (!token) {
  window.location.href = 'index.html';
}

const nouveauMotDePasse = document.getElementById('nouveauMotDePasse');
const confirmationMotDePasse = document.getElementById('confirmationMotDePasse');
const btnModifierMotDePasse = document.getElementById('btnModifierMotDePasse');
const btnSupprimerCompte = document.getElementById('btnSupprimerCompte');

let isAdmin = false;

// Charger le profil
fetch('/profil', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(response => response.json())
.then(data => {
  if (document.getElementById('loginAffiche')) {
    document.getElementById('loginAffiche').textContent += data.login;
  }
  if (document.getElementById('dateCreation')) {
    document.getElementById('dateCreation').textContent += new Date(data.dateCreation).toLocaleDateString();
  }
  
  if (document.getElementById('photoAffiche') && data.photo) {
    document.getElementById('photoAffiche').src = data.photo;
  }
  document.getElementById('prenomInfo').textContent += data.prenom;
  document.getElementById('nomInfo').textContent += data.nom;
  document.getElementById('mailInfo').textContent += data.mail;
  isAdmin = data.admin === 1;

  // Si admin, cacher la section supprimer
  if (isAdmin) {
    const deletionSection = document.getElementById('deletionSection');
    if (deletionSection) {
      deletionSection.style.display = 'none';
    }
  }
})
.catch(err => console.log(err));

// Modifier mot de passe
if (btnModifierMotDePasse) {
  btnModifierMotDePasse.onclick = () => {
    if (nouveauMotDePasse.value !== confirmationMotDePasse.value) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }
    if (nouveauMotDePasse.value.length < 8) {
      alert('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }

    fetch('/Modifprofilmdp', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: nouveauMotDePasse.value
      })
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      nouveauMotDePasse.value = '';
      confirmationMotDePasse.value = '';
    })
    .catch(err => console.log(err));
  };
}

// Supprimer compte
if (btnSupprimerCompte) {
  btnSupprimerCompte.onclick = () => {
    if (isAdmin) {
      alert('Les administrateurs ne peuvent pas supprimer leur compte via cette page.');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte? Cette action est irréversible.')) {
      return;
    }

    fetch('/deleteprofil', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      localStorage.removeItem('tokenId');
      window.location.href = 'index.html';
    })
    .catch(err => console.log(err));
  };
}