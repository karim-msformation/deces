require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();

// Config
const PORT = process.env.PORT || 3000;
const MATCHID_API_BASE = process.env.MATCHID_API_BASE || 'https://deces.matchid.io/deces/api/v1';

// Middleware statique
app.use(express.static(path.join(__dirname, 'public')));

// Parsing JSON (utile si tu ajoutes du POST plus tard)
app.use(express.json());

// Route API : recherche (proxy vers matchID)
app.get('/api/search', async (req, res) => {
  try {
    const { nom, prenom, datenaissance, lieunaissance } = req.query;

    // Au moins nom ou prénom
    if (!nom && !prenom) {
      return res.status(400).json({ error: 'Veuillez renseigner au moins un nom ou un prénom.' });
    }

    // Construction des paramètres pour matchID
    const params = new URLSearchParams();
    params.set('size', '20');

    if (nom) params.set('lastName', nom);
    if (prenom) params.set('firstName', prenom);
    if (datenaissance) params.set('birthDate', datenaissance); // format AAAA-MM-JJ
    if (lieunaissance) params.set('birthCity', lieunaissance);

    const url = `${MATCHID_API_BASE}/search?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).json({ error: 'Erreur lors de l’appel à l’API matchID.' });
    }

    const data = await response.json();
    const persons = data.response?.persons || [];

    res.json({ results: persons });
  } catch (err) {
    console.error('Erreur /api/search :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la recherche.' });
  }
});

// Fallback : servir index.html pour la racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
