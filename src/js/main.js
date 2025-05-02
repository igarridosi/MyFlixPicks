// --- Imports ---
import { fetchGenres, searchMovies, searchTV, fetchTrendingContent } from './api/tmdb.js';
import { getFavorites, saveFavorites } from './api/localStorage.js';
import { showMessage } from './components/alert.js';
import { createMovieCard } from './components/movieCard.js';
import { renderFavorites } from './components/favorites.js';
import { setupSearchFilterBar, getFilterState } from './components/searchFilterBar.js';
import { getCustomLists, addCustomList } from './components/customLists.js';

// --- DOM Elements ---
const resultsDiv = document.getElementById('results');
const favoritesDiv = document.getElementById('favorites');
const trendingTitle = document.querySelector('h1.text-2xl.font-bold.mb-2');
const themeToggleBtn = document.getElementById('theme-toggle');
const root = document.documentElement;
const listSelect = document.getElementById('list-select');
const addListBtn = document.getElementById('add-list-btn');
const listTitle = document.querySelector('h2.text-3xl.font-bold.mb-4');
const reloadBtn = document.getElementById('reload-page-btn');

// --- Utility Functions ---
function getTitle(item) {
  return item.title || item.name || '';
}
function getDate(item) {
  return item.release_date || item.first_air_date || '';
}
function getYear(item) {
  const d = getDate(item);
  if (!d) return 'N/A';
  const year = d.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : 'N/A';
}
function isReleased(item) {
  const dateStr = getDate(item);
  if (!dateStr) return false;
  const today = new Date();
  const releaseDate = new Date(dateStr);
  return releaseDate <= today;
}
function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}

// --- Theme Toggle ---
function setTheme(theme) {
  if (theme === 'dark') {
    root.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
  } else {
    root.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
  }
}

function toggleTheme() {
  const isDark = root.classList.contains('dark');
  console.log(isDark)
  setTheme(isDark ? 'light' : 'dark');
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', toggleTheme);
}

// --- Reload Page ---
if (reloadBtn) {
  reloadBtn.addEventListener('click', () => window.location.reload());
}

// --- Render Results ---
let lastResults = [];
function renderResults(movies, filterState = getFilterState()) {
  lastResults = movies;
  resultsDiv.innerHTML = '';
  const { query = '', type = 'all', genreId = '', year = '', sortValue = 'date-desc' } = filterState;
  let typeLabel = 'Trending Movies';
  if (type === 'tv') typeLabel = 'Trending TV Shows';
  else if (type === 'movie') typeLabel = 'Trending Movies';
  else if (type === 'documentary') typeLabel = 'Trending Documentaries';
  else if (type === 'all') typeLabel = 'Trending Content';
  if (trendingTitle) {
    if (query) {
      trendingTitle.textContent = `Results for "${query}"`;
    } else {
      trendingTitle.textContent = typeLabel;
    }
  }
  if (!movies || movies.length === 0) {
    resultsDiv.innerHTML = '<p class="text-gray-500">No results found.</p>';
    return;
  }
  const filtered = filterAndSortMovies(movies, filterState)
    .filter(movie => {
      if (!query) return true;
      const title = getTitle(movie).toLowerCase();
      return title.includes(query.toLowerCase());
    });
  filtered.forEach(movie => {
    const hasValidRating = typeof movie.vote_average === 'number' && movie.vote_average > 0;
    const hasTitle = !!getTitle(movie);
    const hasPoster = !!movie.poster_path;
    const hasDate = !!getDate(movie);
    const hasYear = getYear(movie) !== 'N/A';
    if (!hasValidRating || !hasTitle || !hasPoster || !hasDate || !hasYear) return;
    const card = createMovieCard(
      movie,
      false,
      t => highlightText(t, query),
      getTitle,
      getDate,
      getYear,
      isReleased
    );
    resultsDiv.appendChild(card);
  });
  if (!resultsDiv.hasChildNodes()) {
    resultsDiv.innerHTML = '<p class="text-gray-500">No results found.</p>';
  }
}

// --- Filter and Sort Logic ---
function filterAndSortMovies(movies, filterState = {}) {
  let filtered = movies;
  const { type = 'all', genreId = '', year = '', sortValue = 'date-desc' } = filterState;
  if (type === 'tv') {
    filtered = filtered.filter(m => (m.media_type === 'tv' || (m.first_air_date && !m.title)));
  } else if (type === 'movie') {
    filtered = filtered.filter(m => (m.media_type === 'movie' || (m.release_date && !m.name)));
  } else if (type === 'documentary') {
    filtered = filtered.filter(m => (m.genre_ids || []).includes(99));
  }
  if (year) {
    filtered = filtered.filter(m => getYear(m) === year);
  }
  if (genreId) {
    filtered = filtered.filter(m => (m.genre_ids || []).includes(Number(genreId)));
  }
  if (sortValue.startsWith('date')) {
    const order = sortValue.endsWith('desc') ? 'desc' : 'asc';
    filtered = filtered.sort((a, b) => {
      const da = getDate(a), db = getDate(b);
      const dateA = da ? new Date(da) : null;
      const dateB = db ? new Date(db) : null;
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  } else {
    const order = sortValue.endsWith('desc') ? 'desc' : 'asc';
    filtered = filtered.sort((a, b) => {
      const va = a.vote_average || 0, vb = b.vote_average || 0;
      return order === 'desc' ? vb - va : va - vb;
    });
  }
  return filtered;
}

// --- Search and Trending ---
async function handleSearch(query) {
  const filterState = getFilterState();
  try {
    let type = filterState.type;
    if (type === 'tv') {
      const results = await searchTV(query);
      renderResults(results, { ...filterState, query });
    } else if (type === 'movie') {
      const results = await searchMovies(query);
      renderResults(results, { ...filterState, query });
    } else {
      const [movies, tv] = await Promise.all([
        searchMovies(query),
        searchTV(query)
      ]);
      renderResults([...movies, ...tv], { ...filterState, query });
    }
  } catch (e) {
    renderResults([], { ...filterState, query });
    showMessage('Error fetching movies.', 'red');
  }
}

async function showTrending() {
  const trending = await fetchTrendingContent();
  renderResults(trending, getFilterState());
}

// --- Favorites Toggle ---
let favoritesVisible = true;
let favSection = document.querySelector('#favorites')?.closest('section');
function updateFavoritesToggleBtnText() {
  const btn = document.getElementById('toggle-favorites');
  if (!btn) return;
  const span = btn.querySelector('span');
  if (span) span.textContent = favoritesVisible ? 'Hide Lists' : 'Show Lists';
}
function handleFavoritesToggle() {
  favSection = document.querySelector('#favorites')?.closest('section');
  favoritesVisible = !favoritesVisible;
  if (favSection) favSection.style.display = favoritesVisible ? '' : 'none';
  updateFavoritesToggleBtnText();
}

// --- Search and Filter Bar Setup ---
setupSearchFilterBar({
  onSearch: (query) => {
    if (!query) {
      showTrending();
      return;
    }
    handleSearch(query);
  },
  onFilterChange: () => renderResults(lastResults, getFilterState()),
  onToggleFavorites: handleFavoritesToggle,
  updateHeading: null
});

// --- Add/Remove Favorites ---
window.addEventListener('click', e => {
  if (e.target && e.target.matches('button[data-action="add-favorite"]')) {
    const movieId = e.target.closest('.relative').dataset.id;
    const movie = lastResults.find(m => m.id == movieId);
    if (movie) {
      const favorites = getFavorites();
      if (!favorites.some(fav => fav.id === movie.id)) {
        favorites.push({
          id: movie.id,
          title: movie.title || '',
          name: movie.name || '',
          release_date: movie.release_date || movie.first_air_date || '',
          first_air_date: movie.first_air_date || movie.release_date || '',
          poster_path: movie.poster_path || '',
          vote_average: typeof movie.vote_average === 'number' ? movie.vote_average : 0,
          genre_ids: Array.isArray(movie.genre_ids) ? movie.genre_ids : []
        });
        saveFavorites(favorites);
        renderFavorites(favoritesDiv, t => highlightText(t, ''), getTitle, getDate, getYear, isReleased);
        renderResults(lastResults, getFilterState());
        if (listSelect) listSelect.value = 'favorites';
        renderSelectedList();
        showMessage('Movie added to favorites!', 'green');
      }
    }
  } else if (e.target && e.target.matches('button[data-action="remove-favorite"]')) {
    const movieId = e.target.closest('.relative').dataset.id;
    let favorites = getFavorites();
    favorites = favorites.filter(movie => movie.id != movieId);
    saveFavorites(favorites);
    renderFavorites(favoritesDiv, t => highlightText(t, ''), getTitle, getDate, getYear, isReleased);
    renderResults(lastResults, getFilterState());
    showMessage('Movie removed from favorites.', 'green');
  }
});

// --- List Dropdown and Custom Lists ---
function renderListDropdown() {
  const lists = getCustomLists();
  listSelect.innerHTML = '<option value="favorites">Favorites</option>' +
    lists.map(l => `<option value="${l.name}">${l.name}</option>`).join('');
}

function renderSelectedList() {
  const selected = listSelect.value;
  if (listTitle) listTitle.textContent = `${selected.charAt(0).toUpperCase() + selected.slice(1)} List`;
  if (selected === 'favorites') {
    renderFavorites(favoritesDiv, t => highlightText(t, ''), getTitle, getDate, getYear, isReleased);
  } else {
    const lists = getCustomLists();
    const list = lists.find(l => l.name === selected);
    favoritesDiv.innerHTML = '';
    if (list && list.movies.length) {
      list.movies.forEach(movie => {
        const card = createMovieCard(movie, false, t => highlightText(t, ''), getTitle, getDate, getYear, isReleased, renderSelectedList, selected);
        favoritesDiv.appendChild(card);
      });
    } else {
      favoritesDiv.innerHTML = '<p class="text-gray-500">No movies in this list yet.</p>';
    }
  }
}

if (listSelect) {
  listSelect.addEventListener('change', renderSelectedList);
}

if (addListBtn) {
  addListBtn.addEventListener('click', () => {
    const name = prompt('Enter a name for your new list:');
    if (name && name.trim()) {
      addCustomList(name.trim());
      renderListDropdown();
      listSelect.value = name.trim();
      renderSelectedList();
    }
  });
}

// --- On Load ---
window.addEventListener('DOMContentLoaded', async () => {
  renderFavorites(favoritesDiv, t => highlightText(t, ''), getTitle, getDate, getYear, isReleased);
  favSection = document.querySelector('#favorites')?.closest('section');
  if (favSection) favSection.style.display = favoritesVisible ? '' : 'none';
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    setTheme('light');
  }
  renderListDropdown();
  listSelect.value = 'favorites';
  renderSelectedList();
  showTrending();
});