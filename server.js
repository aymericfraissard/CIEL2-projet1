const express = require('express');
const app = express();
const port = 3001;
const mysql = require('mysql2');
require('dotenv').config();
const IPServer = process.env.IPServer;

const connection = mysql.createConnection({ // configuration de la connexion à la base de données
  host: process.env.ipBDD, //changer ip
  user: process.env.LoginBDD,
  password: process.env.PasswordBDD,
  database: process.env.DatabaseBDD
});

connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
    return;
  }
  console.log('Connecté à la base de données MySQL.');
});

app.use(express.json());
app.use(express.static('public'));

function inscription(login, passwd) {
  
}

app.listen(port, IPServer, () => {
  console.log(`Serveur en ligne sur http://${IPServer}:${port}/`);
});