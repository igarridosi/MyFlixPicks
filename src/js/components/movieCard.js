// Movie/TV card creation logic
import { getFavorites } from '../api/localStorage.js';
import { getCustomLists, addMovieToList, removeMovieFromList, removeCustomList } from './customLists.js';

// Add to List (+) button and modal logic
function createAddToListModal(movie, onUpdate) {
// Remove any existing modal
document.getElementById('add-to-list-modal')?.remove();
const lists = getCustomLists();
const modal = document.createElement('div');
modal.id = 'add-to-list-modal';
modal.className = 'fixed inset-0 flex items-center justify-center z-50';
modal.style.background = 'rgba(31,40,51,0.80)';
modal.innerHTML = `
    <div class="bg-beis dark:bg-darkblue text-darkblue dark:text-beis rounded-xl shadow-xl p-6 min-w-[300px] max-w-xs w-full relative">
        <div class="flex justify-between">
            <button id="close-add-to-list" class="absolute rounded top-2 right-4 text-3xl" aria-label="Close">&times;</button>
            <h3 class="font-bold text-3xl mb-4">Save to List</h3>
        </div>
        
        <form id="add-to-list-form" class="flex flex-col gap-2 mb-4">
            ${lists.length === 0 ? '<div class="text-gray-500">No lists yet. Create one first!</div>' :
            lists.map(list => {
                const checked = list.movies.some(m => m.id === movie.id) ? 'checked' : '';
                return `<div class="flex flex-row justify-between"><label class="flex items-center text-xl gap-2 cursor-pointer"><input type="checkbox" name="list" value="${list.name}" ${checked} class="size-6">${list.name}</label><button type="button" class="remove-list-btn ml-5 text-red-500" data-list= "${list.name}" title="Delete list">🗑️</button></div>`;
            }).join('')}
        </form>
        <div class="flex justify-end gap-2">
            <button id="save-add-to-list" class="px-3 py-1 rounded bg-dishmaster text-beis">Save</button>
            <button id="cancel-add-to-list" class="px-3 py-1 rounded bg-darkblue text-beis">Cancel</button>
        </div>
    </div>
`;
document.body.appendChild(modal);
document.getElementById('close-add-to-list').onclick = () => modal.remove();
document.getElementById('cancel-add-to-list').onclick = e => { e.preventDefault(); modal.remove(); };
document.getElementById('save-add-to-list').onclick = e => {
    e.preventDefault();
    const checked = Array.from(modal.querySelectorAll('input[type=checkbox][name=list]:checked')).map(cb => cb.value);
    const unchecked = Array.from(modal.querySelectorAll('input[type=checkbox][name=list]:not(:checked)')).map(cb => cb.value);
    checked.forEach(listName => addMovieToList(listName, movie));
    unchecked.forEach(listName => removeMovieFromList(listName, movie.id));
    modal.remove();
    if (typeof onUpdate === 'function') onUpdate();
};
// Remove list logic
modal.querySelectorAll('.remove-list-btn').forEach(btn => {
    btn.onclick = e => {
    e.preventDefault();
    removeCustomList(btn.dataset.list);
    modal.remove();
    if (typeof onUpdate === 'function') onUpdate();
    };
});
}

export function createMovieCard(movie, isFavorite, highlightText, getTitle, getDate, getYear, isReleased, onListUpdate, currentListName) {
const released = isReleased(movie);
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const card = document.createElement('div');
card.className = 'relative bg-beis rounded-xl p-4 flex flex-col items-center transition-transform hover:scale-105';
card.dataset.id = movie.id;

// Poster wrapper for badge
const posterWrapper = document.createElement('div');
posterWrapper.className = 'relative mb-2';
const poster = document.createElement('img');
poster.src = movie.poster_path ? `${TMDB_IMG_BASE}${movie.poster_path}` : '/images/movie-background-collage.jpg';
poster.alt = getTitle(movie);
poster.className = 'w-50 h-70 object-cover rounded-lg shadow';
posterWrapper.appendChild(poster);

// TMDB rating badge (right top)
if (released) {
    const badge = document.createElement('span');
    badge.className = 'absolute top-2 right-2 bg-yellow-400 text-black font-bold px-2 py-1 rounded shadow text-xs z-10';
    badge.textContent = movie.vote_average ? `★ ${movie.vote_average.toFixed(1)}` : '★ N/A';
    posterWrapper.appendChild(badge);
}

// Lock overlay for unreleased
if (!released) {
    const lockOverlay = document.createElement('div');
    lockOverlay.className = 'absolute inset-0 bg-opacity-60 flex flex-col items-center justify-center rounded-lg z-20';
    lockOverlay.innerHTML = '<svg class="w-[64px] h-[64px] fill-beis" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 16c0-1.104.896-2 2-2s2 .896 2 2c0 .738-.404 1.376-1 1.723v2.277h-2v-2.277c-.596-.347-1-.985-1-1.723zm11-6v14h-18v-14h3v-4c0-3.313 2.687-6 6-6s6 2.687 6 6v4h3zm-13 0h8v-4c0-2.206-1.795-4-4-4s-4 1.794-4 4v4zm11 2h-14v10h14v-10z"/></svg>';
    posterWrapper.appendChild(lockOverlay);
    poster.style.filter = 'grayscale(1)';
    card.className = 'relative bg-beis rounded-xl shadow-lg p-4 flex flex-col items-center';
}
card.appendChild(posterWrapper);

// Check if movie is in any list
const lists = getCustomLists();
const inAnyList = lists.some(list => list.movies.some(m => m.id === movie.id));
// Add to List (+) button (only if not in any list)
if (!inAnyList) {
    const addBtn = document.createElement('button');
    addBtn.className = 'absolute top-1 left-13 bg-dishmaster text-darkblue rounded-full w-9 h-9 flex items-center justify-center shadow hover:scale-105 transition z-20';
    addBtn.innerHTML = `<span class="text-xl font-bold">+</span>`;
    addBtn.title = 'Save to list';
    addBtn.onclick = e => {
    e.stopPropagation();
    createAddToListModal(movie, onListUpdate);
    };
    card.appendChild(addBtn);
}

// Title
const title = document.createElement('h3');
title.innerHTML = highlightText(getTitle(movie));
title.className = 'font-bold text-lg mb-1 text-center truncate w-full';
card.appendChild(title);

// Year
const year = document.createElement('p');
year.textContent = getYear(movie) || 'N/A';
year.className = 'text-gray-600 mb-1';
card.appendChild(year);

// Add/Remove button
if (released) {
    const favorites = getFavorites();
    const alreadyFavorite = favorites.some(fav => fav.id === movie.id);
    // If rendering inside a custom list, show Remove from {currentListName}
    if (currentListName && currentListName !== 'favorites') {
    const btn = document.createElement('button');
    btn.className = 'bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 mb-2 transition';
    btn.textContent = `Remove from ${currentListName}`;
    btn.onclick = () => {
        // Remove from this list and update UI
        import('./customLists.js').then(({ removeMovieFromList }) => {
        removeMovieFromList(currentListName, movie.id);
        if (typeof onListUpdate === 'function') onListUpdate();
        });
    };
    card.appendChild(btn);
    } else if (!alreadyFavorite && !isFavorite) {
    const btn = document.createElement('button');
    btn.className = 'bg-darkblue text-white px-3 py-1 rounded hover:bg-blue-700 mb-2 transition';
    btn.textContent = 'Add to Favorites';
    btn.setAttribute('data-action', 'add-favorite');
    card.appendChild(btn);
    } else if (isFavorite) {
    const btn = document.createElement('button');
    btn.className = 'bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 mb-2 transition';
    btn.textContent = 'Remove from Favorites';
    btn.setAttribute('data-action', 'remove-favorite');
    card.appendChild(btn);
    }

    // TMDB Link button
    const tmdbBtn = document.createElement('a');
    tmdbBtn.href = movie.title
    ? `https://www.themoviedb.org/movie/${movie.id}`
    : `https://www.themoviedb.org/tv/${movie.id}`;
    tmdbBtn.target = '_blank';
    tmdbBtn.rel = 'noopener noreferrer';
    tmdbBtn.className = 'bg-[#1CD2AE] text-white px-3 py-1 rounded hover:bg-[#029CD5] mb-2 transition ml-2 inline-block text-center';
    tmdbBtn.textContent = 'View on TMDB';
    card.appendChild(tmdbBtn);
}

return card;
}
