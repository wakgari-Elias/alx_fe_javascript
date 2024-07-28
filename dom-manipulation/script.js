const quotes = JSON.parse(localStorage.getItem('quotes')) || [];
let categoryFilter = localStorage.getItem('categoryFilter') || 'all';

// Function to display a random quote
function showRandomQuote() {
    const filteredQuotes = categoryFilter === 'all' ? quotes : quotes.filter(quote => quote.category === categoryFilter);
    const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    document.getElementById('quoteDisplay').textContent = randomQuote ? randomQuote.text : 'No quotes available';
}

// Function to add a new quote
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;
    if (newQuoteText && newQuoteCategory) {
        const newQuote = { text: newQuoteText, category: newQuoteCategory };
        quotes.push(newQuote);
        saveQuotes();
        syncQuotesWithServer(newQuote, 'POST');
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        populateCategories();
    }
}

// Function to populate the categories dropdown
function populateCategories() {
    const categories = [...new Set(quotes.map(quote => quote.category))];
    const select = document.getElementById('categoryFilter');
    select.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
    select.value = categoryFilter;
}

// Function to filter quotes based on selected category
function filterQuotes() {
    categoryFilter = document.getElementById('categoryFilter').value;
    localStorage.setItem('categoryFilter', categoryFilter);
    showRandomQuote();
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        alert('Quotes imported successfully!');
        populateCategories();
    };
    fileReader.readAsText(event.target.files[0]);
}

// Export quotes to JSON file
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'quotes.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Fetch quotes from the server
async function fetchQuotesFromServer() {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const serverQuotes = await response.json();
    return serverQuotes.map(sq => ({ text: sq.title, category: 'default' })); // Map server response to quote format
}

// Sync local quotes with the server
async function syncQuotesWithServer(quote, method) {
    const url = 'https://jsonplaceholder.typicode.com/posts';
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: quote.text, body: quote.category, userId: 1 })
    };
    await fetch(url, options);
}

// Sync quotes with the server and handle conflicts
async function syncQuotes() {
    const serverQuotes = await fetchQuotesFromServer();
    const newQuotes = serverQuotes.filter(sq => !quotes.some(q => q.text === sq.text && q.category === sq.category));

    if (newQuotes.length > 0) {
        document.getElementById('conflictNotification').style.display = 'block';
        quotes.push(...newQuotes);
        saveQuotes();
        populateCategories();
        showRandomQuote();
    } else {
        document.getElementById('conflictNotification').style.display = 'none';
    }

    document.getElementById('syncNotification').textContent = 'Quotes synced with server!';
    document.getElementById('syncNotification').style.display = 'block';
    setTimeout(() => {
        document.getElementById('syncNotification').style.display = 'none';
    }, 3000);
}

// Initialize
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
window.addEventListener('load', () => {
    populateCategories();
    filterQuotes();
    syncQuotes();
    setInterval(syncQuotes, 30000); // Sync with server every 30 seconds
});
