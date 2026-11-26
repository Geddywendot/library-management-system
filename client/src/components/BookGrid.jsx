import { useEffect, useState } from 'react';
import BookCard from './BookCard.jsx';

const API_URL = import.meta.env.VITE_API_URL;

export default function BookGrid({ genreId, search }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (genreId) params.set('genreId', genreId);
    if (search) params.set('search', search);

    setLoading(true);
    setError(null);

    fetch(`${API_URL}/books?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load books (${res.status})`);
        return res.json();
      })
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [genreId, search]);

  if (loading) return <p>Loading books...</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (books.length === 0) return <p className="muted">No books found.</p>;

  return (
    <div className="book-grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
