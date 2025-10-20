// server.js
require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 4000;
const KUNNA_URL = process.env.KUNNA_URL;

if (!KUNNA_URL) {
  console.error('Falta KUNNA_URL en .env');
  process.exit(1);
}

app.use(express.json());

// CORS mínimo para clase (sirve si abren el HTML por file:// o Apache en localhost)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // para demo, abierto
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Endpoint que el front va a usar
app.post('/api/data', async (req, res) => {
  try {
    // Body que recibimos del front 
    const body = {
      time_start: req.body?.time_start,
      time_end: req.body?.time_end,
      limit: req.body?.limit ?? 100,
      count: req.body?.count ?? false,
      order: req.body?.order ?? 'DESC'
    };

    // Llamada a KUNNA (token oculto en el servidor)
    const r = await fetch(KUNNA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const text = await r.text();
    res.status(r.status);
    // Propagamos content-type si viene
    const ct = r.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', ct);
    res.send(text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'proxy_error' });
  }
});

app.listen(PORT, () => {
  console.log(`BFF escuchando en http://localhost:${PORT}`);
});
