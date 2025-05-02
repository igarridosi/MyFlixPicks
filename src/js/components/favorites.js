// Favorites section rendering logic
import { getFavorites } from '../api/localStorage.js';
import { createMovieCard } from './movieCard.js';

export function renderFavorites(favoritesDiv, highlightText, getTitle, getDate, getYear, isReleased) {
  const favorites = getFavorites();
  favoritesDiv.innerHTML = '';
  if (!favorites.length) {
    favoritesDiv.innerHTML = '<p class="text-gray-500">No favorites yet.</p>';
    return;
  }
  favorites.forEach(movie => {
    const card = createMovieCard(movie, true, highlightText, getTitle, getDate, getYear, isReleased);
    favoritesDiv.appendChild(card);
  });
}
