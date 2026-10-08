const express = require('express');
const app = express();
const port = 3001;
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const IPServer = process.env.IPServer;
const auth = require('./middleware/auth');

const connection = mysql.createConnection({ // configuration de la connexion à la base de données
  host: process.env.ipBDD,
  user: process.env.LoginBDD,
  password: process.env.PasswordBDD,
  database: process.env.DatabaseBDD 
});

connection.connect((err) => {
  if (err) {
    console.error('[BDD] Erreur de connexion :', err.code, err.message);
    return;
  }
  console.log('[BDD] Connexion MySQL réussie.');
});

app.use(express.json());
app.use(express.static('public'));

//=========================================================================================================

app.get('/check', auth, (req, res) => {
  res.json({ data: true });
});


// Route pour l'inscription d'un nouvel utilisateur
app.post('/register', async (req, res) => {
  console.log('[INSCRIPTION] Début de la demande.');

  const login = req.body.V_log;
  const motDePasse = req.body.V_pass;
  const mail = req.body.V_mail;
  const nom = req.body.V_nom;
  const prenom = req.body.V_prenom;

  if (typeof login !== 'string' || typeof motDePasse !== 'string' || typeof mail !== 'string' || typeof nom !== 'string' || typeof prenom !== 'string') {
    console.log('[INSCRIPTION] Champs absents ou invalides.');
    return res.status(400).json({ message: 'Veuillez remplir tout les champs.' });
  }
  const loginUser = login.trim();
  console.log(`[INSCRIPTION] Vérification des champs pour le login de ${loginUser.length} caractères.`);

  if (loginUser.length < 4) {
    console.log('[INSCRIPTION] Login trop court.');
    return res.status(400).json({ message: 'Le login doit contenir au moins 4 caractères.' });
  }
  if (loginUser.length > 20) {
    console.log('[INSCRIPTION] Login trop long.');
    return res.status(400).json({ message: 'Le login ne doit pas dépasser 20 caractères.' });
  }
  if (motDePasse.length < 8) {
    console.log('[INSCRIPTION] Mot de passe trop court.');
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
  }
  if (motDePasse.length > 30) {
    console.log('[INSCRIPTION] Mot de passe trop long.');
    return res.status(400).json({ message: 'Le mot de passe ne doit pas dépasser 30 caractères.' });
  }
  console.log('[INSCRIPTION] Vérification du login dans la base.');
  connection.query(
    'SELECT login FROM user WHERE login = ?',
    [loginUser],
    (err, utilisateurs) => {
      if (err) {
        console.log('[INSCRIPTION] Erreur pendant la recherche :', err.message);
        return res.status(500).json({ message: 'Erreur serveur lors de l’inscription.' });
      }

      if (utilisateurs.length > 0) {
        console.log('[INSCRIPTION] Login déjà utilisé.');
        return res.status(400).json({ message: 'Ce login est déjà utilisé.' });
      }

      console.log('[INSCRIPTION] Hachage du mot de passe.');
      bcrypt.hash(motDePasse, 10, (err, motDePasseHache) => {
        if (err) {
          console.log('[INSCRIPTION] Erreur pendant le hachage :', err.message);
          return res.status(500).json({ message: 'Erreur serveur lors de l’inscription.' });
        }

        console.log('[INSCRIPTION] Enregistrement du nouvel utilisateur.');
        connection.query(
          'INSERT INTO user (login, password,dateCreation,nom,prenom,mail) VALUES (?, ?, ?, ?, ?, ?)',
          [loginUser, motDePasseHache, new Date(),nom,prenom,mail],
          (err, resultat) => {
            if (err) {
              console.log('[INSCRIPTION] Erreur pendant l’enregistrement :', err.message);
              return res.status(500).json({ message: 'Erreur serveur lors de l’inscription.' });
            }

            console.log('[INSCRIPTION] Création du token.');
            jwt.sign(
              { id: resultat.insertId },
              process.env.SecretJWT,
              { expiresIn: '24h' },
              (err, tokenId) => {
                if (err) {
                  console.log('[INSCRIPTION] Erreur pendant la création du token :', err.message);
                  return res.status(500).json({ message: 'Erreur serveur lors de l’inscription.' });
                }

                console.log('[INSCRIPTION] Inscription réussie.');
                return res.status(201).json({ message: 'Inscription réussie.', tokenId });
              }
            );
          }
        );
      });
    }
  );
});

//Route pour la connexion d'un utilisateur existant
app.post('/login', async (req, res) => {
  console.log('[CONNEXION] Début de la demande.');

  const login = req.body.V_log;
  const motDePasse = req.body.V_pass;

  if (typeof login !== 'string' || typeof motDePasse !== 'string' || !login.trim() || !motDePasse) {
    console.log('[CONNEXION] Champs absents ou invalides.');
    return res.status(400).json({ message: 'Veuillez remplir les deux champs.' });
  }

  console.log('[CONNEXION] Recherche de l’utilisateur dans la base.');
  connection.query(
    'SELECT id, login, password FROM user WHERE login = ?',
    [login.trim()],
    (err, utilisateurs) => {
      if (err) {
        console.log('[CONNEXION] Erreur pendant la recherche :', err.message);
        return res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
      }

      if (utilisateurs.length === 0) {
        console.log('[CONNEXION] Login inconnu.');
        return res.status(401).json({ message: 'Identifiants invalides.' });
      }

      const utilisateur = utilisateurs[0];
      console.log('[CONNEXION] Vérification du mot de passe.');
      bcrypt.compare(motDePasse, utilisateur.password, (err, motDePasseValide) => {
        if (err) {
          console.log('[CONNEXION] Erreur pendant la vérification :', err.message);
          return res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
        }

        if (!motDePasseValide) {
          console.log('[CONNEXION] Mot de passe incorrect.');
          return res.status(401).json({ message: 'Identifiants invalides.' });
        }

        console.log('[CONNEXION] Création du token.');
        jwt.sign(
          { id: utilisateur.id },
          process.env.SecretJWT,
          { expiresIn: '24h' },
          (err, tokenId) => {
            if (err) {
              console.log('[CONNEXION] Erreur pendant la création du token :', err.message);
              return res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
            }

            console.log('[CONNEXION] Connexion réussie.');
            return res.json({ message: 'Connexion réussie.', tokenId });
          }
        );
      });
    }
  );
});

app.get('/profil', auth, (req, res) => {
  connection.query('SELECT login, dateCreation, admin FROM user WHERE id = ?',
    [req.auth.id],
    (err, result) => {
      if (err) {
        console.log('Erreur lors de la récupération du profil :', err.message);
        return res.status(500).json({ message: 'Erreur serveur lors de la récupération du profil.' });
      }

      if (result.length === 0) {
        console.log('Utilisateur non trouvé.');
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }
      const utilisateur = result[0];
      return res.json({ login: utilisateur.login, dateCreation: utilisateur.dateCreation, admin: utilisateur.admin });
    }
  );
});

// Modifier le mot de passe
app.post('/Modifprofilmdp', auth, async (req, res) => {
  const password = req.body.password;

  if (password && password.length < 8) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
  }
  if (password && password.length > 30) {
    return res.status(400).json({ message: 'Le mot de passe ne doit pas dépasser 30 caractères.' });
  }
  if (password === undefined) {
    return res.status(400).json({ message: 'Veuillez mettre votre nouveau mot de passe.' });
  }

  try {
    const hache = await bcrypt.hash(password, 10);
    connection.query('UPDATE user SET password = ? WHERE id = ?',
      [hache, req.auth.id],
      (err, result) => {
        if (err) {
          console.log('Erreur lors de la modification du mot de passe :', err.message);
          return res.status(500).json({ message: 'Erreur serveur lors de la modification du mot de passe.' });
        }
        return res.json({ message: 'Mot de passe modifié avec succès.' });
      }
    );
  } catch (err) {
    console.log('Erreur lors du hachage du mot de passe :', err.message);
    return res.status(500).json({ message: 'Erreur serveur lors de la modification du mot de passe.' });
  }
});

app.post('/deleteprofil', auth, (req, res) => {
  const id = req.auth.id;
  connection.query('SELECT admin FROM user WHERE id = ?', [id],
    (err, result) => {
      if (err) {
        console.log('Erreur lors de la vérification des droits d\'administrateur :', err.message);
        return res.status(500).json({ message: 'Erreur serveur lors de la vérification des droits d\'administrateur.' });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }

      if (result[0].admin === 1) {
        return res.status(403).json({ message: 'Les administrateurs ne peuvent pas supprimer leur compte.' });
      }

      connection.query('DELETE FROM user WHERE id = ?', [id],
        (err) => {
          if (err) {
            console.log('Erreur lors de la suppression du profil :', err.message);
            return res.status(500).json({ message: 'Erreur serveur lors de la suppression du profil.' });
          }
          return res.json({ message: 'Profil supprimé avec succès.' });
        }
      );
    }
  );
});
  
app.get('/admin/users', auth, (req, res) => {
  connection.query('SELECT id, admin FROM user WHERE id = ?', [req.auth.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur serveur.' });
      }
      if (result.length === 0 || result[0].admin !== 1) {
        return res.status(403).json({ message: 'Accès refusé.' });
      }

      connection.query('SELECT id, login FROM user', (err, users) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur serveur.' });
        }
        return res.json(users);
      });
    }
  );
});

app.post('/admin/delete', auth, (req, res) => {
  const { userId } = req.body;

  connection.query('SELECT admin FROM user WHERE id = ?', [req.auth.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur serveur.' });
      }

      if (result.length === 0 || result[0].admin !== 1) {
        return res.status(403).json({ message: 'Accès refusé.' });
      }

      if (req.auth.id == userId) {
        return res.status(400).json({ message: 'Impossible de supprimer votre propre compte.' });
      }

      connection.query('DELETE FROM user WHERE id = ?', [userId], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur serveur.' });
        }
        return res.json({ message: 'Utilisateur supprimé.' });
      });
    }
  );
});

app.post('/deconnection', auth, (req, res) => {
  res.json({ message: 'Déconnexion réussie.' });
});
//=========================================================================================================

app.listen(port, IPServer, () => {
  console.log(`[SERVEUR] En ligne sur http://${IPServer}:${port}/`);
});