// 1. Sélectionner les éléments du DOM (la page HTML)
const monBouton = document.querySelector('#mon-bouton');
const monTitre = document.querySelector('h1');

// 2. Définir une fonction pour modifier la page
function changerTexte() {
    monTitre.textContent = 'Hello World !';
    monTitre.style.color = 'blue';
}

// 3. Ajouter un écouteur d'événement (ex: un clic sur le bouton)
if (monBouton) {
    monBouton.addEventListener('click', changerTexte);
}