import { Route, Routes } from 'react-router-dom';
import BookDetail from './pages/BookDetail.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SpaceBookingPage from './pages/SpaceBookingPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import { ReadingListProvider } from './context/ReadingListContext.jsx';

export default function App() {
  return (
    <ReadingListProvider>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <SpaceBookingPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </ReadingListProvider>
  );
}
