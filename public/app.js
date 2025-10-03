const form = document.getElementById('stock-form');
const tableBody = document.querySelector('#portfolio tbody');
let portfolio = [];
let refreshInterval;

// Auto-refresh every 30 seconds (adjust as needed)
const REFRESH_INTERVAL = 30000; // 30 seconds in milliseconds

async function getCurrentPrice(symbol) {
    try {
        const response = await fetch(`/api/price/${symbol}`);
        const data = await response.json();
        return data.price || 0;
    } catch (error) {
        console.error('Error fetching price:', error);
        return 0;
    }
}

// New function to update all stock prices
async function updateAllPrices() {
    console.log('Updating all stock prices...');
    
    for (let i = 0; i < portfolio.length; i++) {
        const stock = portfolio[i];
        const newPrice = await getCurrentPrice(stock.symbol);
        
        // Update the stock with new price and recalculate gain/loss
        portfolio[i].currentPrice = newPrice;
        portfolio[i].gainLoss = (newPrice - stock.buyPrice) * stock.shares;
    }
    
    renderTable();
    updateLastRefreshTime();
}

// Start auto-refresh
function startAutoRefresh() {
    if (portfolio.length > 0) {
        clearInterval(refreshInterval);
        refreshInterval = setInterval(updateAllPrices, REFRESH_INTERVAL);
        console.log('Auto-refresh started');
    }
}

// Stop auto-refresh
function stopAutoRefresh() {
    clearInterval(refreshInterval);
    console.log('Auto-refresh stopped');
}

// Update last refresh time display
function updateLastRefreshTime() {
    const now = new Date().toLocaleTimeString();
    let refreshDisplay = document.getElementById('last-refresh');
    if (!refreshDisplay) {
        refreshDisplay = document.createElement('p');
        refreshDisplay.id = 'last-refresh';
        refreshDisplay.style.color = '#666';
        refreshDisplay.style.fontSize = '12px';
        document.querySelector('h1').after(refreshDisplay);
    }
    refreshDisplay.textContent = `Last updated: ${now}`;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const symbol = document.getElementById('symbol').value.toUpperCase();
    const shares = parseFloat(document.getElementById('shares').value);
    const buyPrice = parseFloat(document.getElementById('buyPrice').value);

    console.log('Adding stock:', symbol, shares, buyPrice);

    const currentPrice = await getCurrentPrice(symbol);
    const gainLoss = (currentPrice - buyPrice) * shares;

    const stock = { symbol, shares, buyPrice, currentPrice, gainLoss };
    portfolio.push(stock);
    renderTable();
    updateLastRefreshTime();
    
    // Start auto-refresh when first stock is added
    if (portfolio.length === 1) {
        startAutoRefresh();
    }
    
    form.reset();
});

function renderTable() {
    tableBody.innerHTML = '';
    portfolio.forEach((stock, index) => {
        const row = document.createElement('tr');
        const percentChange = ((stock.currentPrice - stock.buyPrice) / stock.buyPrice * 100).toFixed(2);
        
        row.innerHTML = `
            <td>${stock.symbol}</td>
            <td>${stock.shares}</td>
            <td>$${stock.buyPrice.toFixed(2)}</td>
            <td>$${stock.currentPrice.toFixed(2)}</td>
            <td style="color: ${stock.gainLoss >= 0 ? 'green' : 'red'}">
                ${stock.gainLoss >= 0 ? '+' : ''}$${stock.gainLoss.toFixed(2)}
                <br><small>(${percentChange}%)</small>
            </td>
            <td>
                <button onclick="removeStock(${index})" style="background: red; color: white; border: none; padding: 5px 10px; cursor: pointer;">Remove</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Remove stock function
function removeStock(index) {
    portfolio.splice(index, 1);
    renderTable();
    
    // Stop auto-refresh if no stocks left
    if (portfolio.length === 0) {
        stopAutoRefresh();
        document.getElementById('last-refresh')?.remove();
    }
}

// Manual refresh button functionality
function manualRefresh() {
    if (portfolio.length > 0) {
        updateAllPrices();
    }
}

// Clean up interval when page unloads
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});