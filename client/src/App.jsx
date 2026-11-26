import { Route, Routes } from 'react-router-dom';
import BookDetail from './pages/BookDetail.jsx';
import HomePage from './pages/HomePage.jsx';

export default function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/books/:id" element={<BookDetail />} />
      </Routes>
    </div>
  );
}
