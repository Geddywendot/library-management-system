import { useEffect, useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <input
      type="search"
      placeholder="Search by title or author..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
