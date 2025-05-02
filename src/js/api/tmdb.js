// TMDB API logic
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

export async function fetchGenres() {
  const [movieRes, tvRes] = await Promise.all([
    fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`),
    fetch(`${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}`)
  ]);
  const movieData = await movieRes.json();
  const tvData = await tvRes.json();
  const genresList = movieData.genres || [];
  const tvGenresList = tvData.genres || [];
  // Merge genres, remove duplicates by id
  return [...genresList, ...tvGenresList].reduce((acc, g) => {
    if (!acc.some(x => x.id === g.id)) acc.push(g);
    return acc;
  }, []);
}

export async function searchMovies(query) {
  const res = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
  const data = await res.json();
  return data.results || [];
}

export async function searchTV(query) {
  const res = await fetch(`${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
  const data = await res.json();
  return data.results || [];
}

export async function fetchTrendingContent() {
  const [movieRes, tvRes] = await Promise.all([
    fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`),
    fetch(`${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}`)
  ]);
  const movieData = await movieRes.json();
  const tvData = await tvRes.json();
  return [...(movieData.results || []), ...(tvData.results || [])];
}
