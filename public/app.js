const form = document.getElementById('stock-form');
const tableBody = document.querySelector('#portfolio tbody');
let portfolio = [];

async function getCurrentPrice(symbol) {
    const response = await fetch(`/api/price/${symbol}`);
    const data = await response.json();
    return data.price || 0;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const symbol = document.getElementById('symbol').value.toUpperCase();
    const shares = parseFloat(document.getElementById('shares').value);
    const buyPrice = parseFloat(document.getElementById('buyPrice').value);

    const currentPrice = await getCurrentPrice(symbol);
    const gainLoss = (currentPrice - buyPrice) * shares;

    const stock = { symbol, shares, buyPrice, currentPrice, gainLoss };
    portfolio.push(stock);
    renderTable();
    form.reset();
});

function renderTable() {
    tableBody.innerHTML = '';
    portfolio.forEach((stock) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stock.symbol}</td>
            <td>${stock.shares}</td>
            <td>$${stock.buyPrice.toFixed(2)}</td>
            <td>$${stock.currentPrice.toFixed(2)}</td>
            <td>${stock.gainLoss >= 0 ? '+' : ''}$${stock.gainLoss.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });
}
