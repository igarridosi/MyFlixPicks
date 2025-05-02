// Search and Filter Bar Component
import { fetchGenres } from '../api/tmdb.js';

let filterState = {
  query: '',
  type: 'all',
  genreId: '',
  year: '',
  sortValue: 'date-desc'
};

export function getFilterState() {
  return { ...filterState };
}

export function setupSearchFilterBar({
  onSearch,
  onFilterChange,
  onToggleFavorites,
  updateHeading
}) {
  // DOM Elements
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const genreSelect = document.getElementById('filter-genre');
  const yearInput = document.getElementById('filter-year');
  const typeSelect = document.getElementById('filter-type');
  const sortMainSelect = document.getElementById('sort-main');
  const favToggleBtn = document.getElementById('toggle-favorites');
  const trendingTitle = document.querySelector('h1.text-2xl.font-bold.mb-2');

  // Debounce utility
  function debounce(fn, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function updateFilterState() {
    filterState = {
      query: searchInput.value.trim(),
      type: typeSelect.value,
      genreId: genreSelect.value,
      year: yearInput.value,
      sortValue: sortMainSelect.value
    };
  }

  // Update heading in real time as user types
  searchInput.addEventListener('input', () => {
    updateFilterState();
    if (trendingTitle) {
      const query = searchInput.value.trim();
      if (query) {
        trendingTitle.textContent = `Results for "${query}"`;
      } else {
        trendingTitle.textContent = 'Trending Content';
      }
    }
  });

  // Debounced search
  const debouncedSearch = debounce(() => {
    const query = searchInput.value.trim();
    if (!query) {
      onSearch('');
      return;
    }
    onSearch(query);
  }, 500);

  searchInput.addEventListener('input', debouncedSearch);
  searchBtn.addEventListener('click', () => {
    updateFilterState();
    const query = searchInput.value.trim();
    if (!query) {
      onSearch('');
      return;
    }
    onSearch(query);
  });
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      updateFilterState();
      searchBtn.click();
    }
  });
  [sortMainSelect, yearInput, genreSelect, typeSelect].forEach(el => {
    el.addEventListener('change', () => {
      updateFilterState();
      onFilterChange();
    });
    el.addEventListener('input', () => {
      updateFilterState();
      onFilterChange();
    });
  });
  if (favToggleBtn) {
    favToggleBtn.addEventListener('click', onToggleFavorites);
  }

  // Populate genres dropdown
  fetchGenres().then(genres => {
    genreSelect.innerHTML = '<option value="">All Genres</option>' + genres.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
  });
}
