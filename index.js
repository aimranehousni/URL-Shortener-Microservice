require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');

const app = express();

// Basic configuration
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Stockage en mémoire des URLs
const urlDatabase = {};
let idCounter = 1;

// POST /api/shorturl - créer un URL raccourci
app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;

  try {
    // Valide la structure de l'URL
    const urlObj = new URL(original_url);

    // Valide la partie hostname via DNS
    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      // Stocke la nouvelle URL raccourcie
      const short_url = idCounter++;
      urlDatabase[short_url] = original_url;

      res.json({
        original_url,
        short_url,
      });
    });
  } catch (e) {
    // URL mal formée (ex: pas http/https)
    return res.json({ error: 'invalid url' });
  }
});

// GET /api/shorturl/:short_url - redirige vers l'URL originale
app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url = parseInt(req.params.short_url);

  if (urlDatabase[short_url]) {
    return res.redirect(urlDatabase[short_url]);
  } else {
    return res.json({ error: 'No short URL found for the given input' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
