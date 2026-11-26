import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <h3>{book.title}</h3>
      <p className="muted">{book.author}</p>
      {book.genre?.name && <p className="muted">{book.genre.name}</p>}
      <p className="muted">
        {book.availableCopies} / {book.totalCopies} available
      </p>
    </Link>
  );
}
