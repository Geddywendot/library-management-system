import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function SpaceBookingPage() {
  const [spaces, setSpaces] = useState([]);
  const [spaceId, setSpaceId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available spaces; fallback to sample data if endpoint missing
    fetch(`${API_URL}/spaces`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setSpaces)
      .catch(() => setSpaces([{ id: 1, name: 'Study Room A' }, { id: 2, name: 'Study Room B' }]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ spaceId, date, startTime, endTime }),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      setMessage('Booking successful');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage('Booking failed');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Space Booking</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Space:</label>
          <select value={spaceId} onChange={(e) => setSpaceId(e.target.value)} required>
            <option value="">Select a space</option>
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Date:</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <label>Start Time:</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <div>
          <label>End Time:</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>
        <button type="submit">Book</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
