const form = document.getElementById('stock-form');
const tableBody = document.querySelector('#portfolio tbody');
let portfolio = [];

const API_KEY = '1c0333cd36msheb6880cafd60546p1ece99jsn5fd93a357b28';  // Replace with your actual key

async function getCurrentPrice(symbol) {
    const url = `https://yh-finance.p.rapidapi.com/stock/v3/get-summary?symbol=${symbol}&region=US`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com'
        }
    });

    const data = await response.json();
    console.log(data);

    return data.price?.regularMarketPrice?.raw || 0;
}


form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const symbol = document.getElementById('symbol').value.toUpperCase();
  const shares = parseFloat(document.getElementById('shares').value);
  const buyPrice = parseFloat(document.getElementById('buyPrice').value);

  const currentPrice = await getCurrentPrice(symbol);
  const gainLoss = ((currentPrice - buyPrice) * shares).toFixed(2);

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
      <td>$${stock.buyPrice}</td>
      <td>$${stock.currentPrice.toFixed(2)}</td>
      <td>${stock.gainLoss >= 0 ? '+' : ''}$${stock.gainLoss}</td>
    `;
    tableBody.appendChild(row);
  });
}
