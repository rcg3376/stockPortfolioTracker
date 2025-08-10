// server.js

const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = 3000;

// Serve static frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/price/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    const url = `https://yh-finance.p.rapidapi.com/stock/v3/get-summary?symbol=${symbol}&region=US`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com'
            }
        });

        const data = await response.json();
        const price = data.price?.regularMarketPrice?.raw || 0;
        res.json({ symbol, price });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching stock price" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
