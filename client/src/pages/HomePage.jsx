import { useCallback, useEffect, useState } from 'react';
import BookGrid from '../components/BookGrid.jsx';
import SearchBar from '../components/SearchBar.jsx';

const API_URL = import.meta.env.VITE_API_URL;

export default function HomePage() {
  const [genres, setGenres] = useState([]);
  const [genreId, setGenreId] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/genres`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setGenres)
      .catch(() => setGenres([]));
  }, []);

  const handleSearch = useCallback((value) => {
    setSearch(value);
  }, []);

  return (
    <main>
      <h1>Library Catalog</h1>
      <div className="controls">
        <SearchBar onSearch={handleSearch} />
        <select value={genreId} onChange={(e) => setGenreId(e.target.value)} aria-label="Filter by genre">
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      <BookGrid genreId={genreId} search={search} />
    </main>
  );
}
