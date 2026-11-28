import { Link, NavLink } from 'react-router-dom';
import { useReadingList } from '../context/ReadingListContext.jsx';

export default function Navbar() {
  const { items } = useReadingList() || { items: [] };
  const count = items?.length ?? 0;
  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <NavLink to="/" style={{ marginRight: '1rem' }}>Home</NavLink>
      <NavLink to="/login" style={{ marginRight: '1rem' }}>Login</NavLink>
      <NavLink to="/register" style={{ marginRight: '1rem' }}>Register</NavLink>
      <NavLink to="/booking" style={{ marginRight: '1rem' }}>Booking</NavLink>
      <span>Reading List: {count}</span>
    </nav>
  );
}
