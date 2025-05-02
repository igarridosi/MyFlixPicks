// Custom Lists Component
// Handles creation, deletion, and display of user custom movie lists

const CUSTOM_LISTS_KEY = 'myflixpicks_custom_lists';

export function getCustomLists() {
  return JSON.parse(localStorage.getItem(CUSTOM_LISTS_KEY)) || [];
}

export function saveCustomLists(lists) {
  localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(lists));
}

export function addCustomList(name) {
  const lists = getCustomLists();
  if (!lists.find(l => l.name === name)) {
    lists.push({ name, movies: [] });
    saveCustomLists(lists);
  }
}

export function removeCustomList(name) {
  let lists = getCustomLists();
  lists = lists.filter(l => l.name !== name);
  saveCustomLists(lists);
}

export function addMovieToList(listName, movie) {
  const lists = getCustomLists();
  const list = lists.find(l => l.name === listName);
  if (list && !list.movies.find(m => m.id === movie.id)) {
    list.movies.push(movie);
    saveCustomLists(lists);
  }
}

export function removeMovieFromList(listName, movieId) {
  const lists = getCustomLists();
  const list = lists.find(l => l.name === listName);
  if (list) {
    list.movies = list.movies.filter(m => m.id !== movieId);
    saveCustomLists(lists);
  }
}
