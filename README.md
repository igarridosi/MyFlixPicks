# MyFlixPicks

A modern movie and TV show discovery app built with **Vanilla JavaScript, HTML, and CSS**. Search, browse, and organize your favorite content using The Movie Database (TMDB) API. Favorites and custom lists are saved in your browser using `localStorage`.

## Features
- Search for movies and TV shows via TMDB API
- Trending content on homepage
- Add favorites and create custom lists (e.g., "Watch Later", "Top 10")
- Light/Dark mode toggle
- Responsive, cinematic UI
- No frameworks—just pure JS, HTML, and CSS

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/myflixpicks.git
cd myflixpicks
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the project root:
```
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
```
You can get a free TMDB API key at https://www.themoviedb.org/settings/api

### 4. Run the development server
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment

### Deploy to Netlify
- Set the build command to `vite build`
- Set the publish directory to `dist`
- Add your environment variables (`VITE_TMDB_API_KEY`, `VITE_TMDB_BASE_URL`) in the Netlify dashboard

## Project Structure
```
index.html           # Main HTML file
src/
  style.css          # Main stylesheet
  js/
    main.js          # App entry point
    api/
      tmdb.js        # TMDB API logic
      localStorage.js# Favorites/local data
    components/      # UI components (cards, lists, alerts, etc.)
images/              # App images and backgrounds
```

## License
MIT
