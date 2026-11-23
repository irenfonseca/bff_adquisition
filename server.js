
require('dotenv').config();
const express = require('express');

const app = express();

const PORT = process.env.PORT || 4000;
const KUNNA_URL = process.env.KUNNA_URL;
const TOKEN = process.env.TOKEN;

if (!KUNNA_URL || !TOKEN) {
    console.error('Faltan KUNNA_URL o TOKEN en .env');
    process.exit(1);
}

app.use(express.json());

// CORS para prácticas (permite HTML local o Apache)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

// Endpoint del BFF
app.post('/api/data', async (req, res) => {
    try {

        // Construir el body que espera la nueva API de KUNNA
        const body = {
            time_range: {
                start: req.body?.time_range?.start,
                end: req.body?.time_range?.end
            },
            filters: req.body?.filters ?? [],
            options: {
                limit: req.body?.options?.limit ?? 100
            }
        };

        // Petición HTTP a KUNNA
        const r = await fetch(KUNNA_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-token-open-api': TOKEN
            },
            body: JSON.stringify(body)
        });

        // Reenviar la respuesta al frontend
        const text = await r.text();

        res.status(r.status);

        const ct = r.headers.get('content-type') || 'application/json';
        res.setHeader('Content-Type', ct);

        res.send(text);

    } catch (err) {
        console.error(err);
        res.status(502).json({ error: 'proxy_error' });
    }
});

app.listen(PORT, () => {
    console.log(`BFF escuchando en http://localhost:${PORT}`);
});
