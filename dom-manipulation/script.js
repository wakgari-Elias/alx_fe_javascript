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
        quotes.push({ text: newQuoteText, category: newQuoteCategory });
        localStorage.setItem('quotes', JSON.stringify(quotes));
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

// Import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        localStorage.setItem('quotes', JSON.stringify(quotes));
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

// Simulate server interaction for syncing data
async function syncWithServer() {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const serverQuotes = await response.json();
    const newQuotes = serverQuotes.filter(sq => !quotes.some(q => q.text === sq.text && q.category === sq.category));

    if (newQuotes.length > 0) {
        // Conflict detected, use server data
        document.getElementById('conflictNotification').style.display = 'block';
    }

    quotes.push(...newQuotes);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    populateCategories();
    showRandomQuote();
}

// Initialize
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
window.addEventListener('load', () => {
    populateCategories();
    filterQuotes();
    syncWithServer();
    setInterval(syncWithServer, 30000); // Sync with server every 30 seconds
});
