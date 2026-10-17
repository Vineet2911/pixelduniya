const cards = [...document.querySelectorAll('.asset-card')];
const categoryButtons = [...document.querySelectorAll('[data-category]')];
const searchInput = document.getElementById('search-input');
const searchForm = document.getElementById('search-form');
const sortSelect = document.getElementById('sort-select');
const grid = document.getElementById('asset-grid');
const emptyState = document.getElementById('empty-state');
const resultsCount = document.getElementById('results-count');
const toast = document.getElementById('toast');
let activeCategory = 'all';
let searchTerm = '';
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
function renderCards() {
  const visible = cards.filter(card => {
    const categoryMatch = activeCategory === 'all' || card.dataset.category === activeCategory;
    const haystack = `${card.dataset.name} ${card.dataset.tags} ${card.dataset.category}`.toLowerCase();
    return categoryMatch && haystack.includes(searchTerm.toLowerCase());
  });
  cards.forEach(card => card.hidden = !visible.includes(card));
  if (sortSelect.value === 'az') {
    visible.sort((a,b) => a.dataset.name.localeCompare(b.dataset.name));
    visible.forEach(card => grid.appendChild(card));
  } else {
    cards.forEach(card => grid.appendChild(card));
  }
  emptyState.hidden = visible.length > 0;
  resultsCount.textContent = `${visible.length} download${visible.length === 1 ? '' : 's'}`;
}
categoryButtons.forEach(button => button.addEventListener('click', () => {
  activeCategory = button.dataset.category;
  categoryButtons.forEach(b => b.classList.toggle('active', b === button));
  renderCards();
}));
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  searchTerm = searchInput.value.trim();
  renderCards();
  document.getElementById('explore').scrollIntoView({behavior:'smooth',block:'start'});
});
document.querySelectorAll('[data-search]').forEach(button => button.addEventListener('click', () => {
  searchInput.value = button.dataset.search;
  searchTerm = button.dataset.search;
  renderCards();
  document.getElementById('explore').scrollIntoView({behavior:'smooth',block:'start'});
}));
sortSelect.addEventListener('change', renderCards);
document.getElementById('reset-search').addEventListener('click', () => {
  searchTerm = '';
  activeCategory = 'all';
  searchInput.value = '';
  categoryButtons.forEach(b => b.classList.toggle('active', b.dataset.category === 'all'));
  sortSelect.value = 'featured';
  renderCards();
});
document.querySelectorAll('.download-btn').forEach(button => button.addEventListener('click', async () => {
  const path = button.dataset.file;
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('asset not found');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = path.split('/').pop();
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Download started — enjoy your visual!');
  } catch (error) {
    showToast('For downloads, open this site through a local server or after publishing it online.');
  }
}));
document.getElementById('year').textContent = new Date().getFullYear();
renderCards();
