// Initial quotes array
let quotes = [];

// Load quotes from local storage if available
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Load last selected category from local storage
function loadLastSelectedCategory() {
  return localStorage.getItem('selectedCategory') || 'all';
}

// Save last selected category to local storage
function saveLastSelectedCategory(category) {
  localStorage.setItem('selectedCategory', category);
}

// Function to display a random quote
function showRandomQuote() {
  const filteredQuotes = getFilteredQuotes();
  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').innerHTML = "<p>No quotes available.</p>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = `<p>${quote.text}</p><p><em>${quote.category}</em></p>`;
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Function to create and add the form for adding new quotes
function createAddQuoteForm() {
  const formDiv = document.createElement('div');
  formDiv.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteButton">Add Quote</button>
  `;
  document.body.appendChild(formDiv);

  // Event listener for the "Add Quote" button
  document.getElementById('addQuoteButton').addEventListener('click', addQuote);
}

// Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;

  if (newQuoteText && newQuoteCategory) {
    const newQuote = { text: newQuoteText, category: newQuoteCategory };
    quotes.push(newQuote);
    saveQuotes();
    updateCategoryFilter();
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    alert('Quote added successfully!');
  } else {
    alert('Please enter both quote text and category.');
  }
}

// Function to export quotes to JSON
function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      updateCategoryFilter();
      alert('Quotes imported successfully!');
    } catch (e) {
      alert('Invalid JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Function to get filtered quotes based on selected category
function getFilteredQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  return selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.category === selectedCategory);
}

// Function to populate categories dynamically in the dropdown
function populateCategories() {
  const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
  const categoryFilter = document.getElementById('categoryFilter');
  categoryFilter.innerHTML = categories.map(category => `<option value="${category}">${category}</option>`).join('');
}

// Function to filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  saveLastSelectedCategory(selectedCategory);
  showRandomQuote();
}

// Event listener for the "Show New Quote" button
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Event listener for the "Export Quotes to JSON" button
document.getElementById('exportJson').addEventListener('click', exportToJson);

// Event listener for the "Import Quotes from JSON" input
document.getElementById('importFile').addEventListener('change', importFromJsonFile);

// Load existing quotes from local storage, update category filter, and initialize the form
loadQuotes();
populateCategories();
createAddQuoteForm();
document.getElementById('categoryFilter').value = loadLastSelectedCategory();
filterQuotes();
