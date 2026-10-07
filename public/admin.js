const token = localStorage.getItem('tokenId');
if (!token) {
  window.location.href = 'index.html';
}

const btnGestion = document.getElementById('btnGestion');
const btnDeconnexion = document.getElementById('btnDeconnexion');

// Configurer le bouton
btnGestion.style.position = 'relative';

// Créer le dropdown menu
const menuDropdown = document.createElement('div');
menuDropdown.style.display = 'none';
menuDropdown.style.position = 'absolute';
menuDropdown.style.top = '100%';
menuDropdown.style.left = '0';
menuDropdown.style.background = 'white';
menuDropdown.style.border = '1px solid #ccc';
menuDropdown.style.zIndex = '10000';
menuDropdown.style.minWidth = '250px';
menuDropdown.style.marginTop = '5px';
menuDropdown.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
btnGestion.appendChild(menuDropdown);

btnGestion.onclick = (e) => {
  e.stopPropagation();
  menuDropdown.style.display = menuDropdown.style.display === 'none' ? 'block' : 'none';
};

// Fermer le dropdown si on clique ailleurs
document.addEventListener('click', () => {
  menuDropdown.style.display = 'none';
});

// Vérifier que c'est un admin et charger le dropdown
fetch('/admin/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(response => {
  if (response.status === 403) {
    alert('Accès refusé. Vous n\'êtes pas administrateur.');
    window.location.href = 'accueil.html';
  }
  return response.json();
})
.then(users => {
  chargerDropdown(users);
})
.catch(err => console.log(err));

function chargerDropdown(users) {
  menuDropdown.innerHTML = '';
  if (!users || users.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.style.padding = '10px';
    emptyMsg.textContent = 'Aucun utilisateur';
    menuDropdown.appendChild(emptyMsg);
    return;
  }

  users.forEach(user => {
    const userItem = document.createElement('div');
    userItem.style.padding = '10px';
    userItem.style.borderBottom = '1px solid #eee';
    userItem.style.display = 'flex';
    userItem.style.justifyContent = 'space-between';
    userItem.style.alignItems = 'center';

    const userLogin = document.createElement('span');
    userLogin.textContent = user.login;
    userLogin.style.color = '#000';

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Supprimer';
    deleteBtn.style.background = '#d32f2f';
    deleteBtn.style.color = 'white';
    deleteBtn.style.border = 'none';
    deleteBtn.style.padding = '5px 10px';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.onclick = () => supprimerUser(user.id, user.login);

    userItem.appendChild(userLogin);
    userItem.appendChild(deleteBtn);
    menuDropdown.appendChild(userItem);
  });
}

function supprimerUser(userId, login) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ' + login + '?')) {
    return;
  }

  fetch('/admin/delete', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: userId
    })
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
    if (data.message.includes('supprimé')) {
      location.reload();
    }
  })
  .catch(err => console.log(err));
}

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