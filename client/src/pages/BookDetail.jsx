import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/books/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Book not found (${res.status})`);
        return res.json();
      })
      .then((data) => {
        setBook(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading book...</p>;
  if (error) {
    return (
      <div>
        <p className="error">{error}</p>
        <Link to="/">Back to catalog</Link>
      </div>
    );
  }

  return (
    <main>
      <Link to="/">← Back to catalog</Link>
      <h1>{book.title}</h1>
      <p className="muted">By {book.author}</p>
      {book.genre?.name && <p>Genre: {book.genre.name}</p>}
      <p>ISBN: {book.isbn}</p>
      <p>
        Copies: {book.availableCopies} available / {book.totalCopies} total
      </p>
      <p>{book.description}</p>
    </main>
  );
}
