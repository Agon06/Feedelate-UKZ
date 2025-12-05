import React, { useState, useEffect } from 'react';

const StudentDashboard = () => {
  const [studentet, setStudentet] = useState([]);

  useEffect(() => {
    // TODO: replace static UI with fetched data from backend
    // Example fetch (uncomment and adjust URL when backend is ready):
    // fetch('http://localhost:5000/api/studentet')
    //   .then(res => res.json())
    //   .then(data => setStudentet(data));
  }, []);

  const years = ['Viti I', 'Viti II', 'Viti III'];

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4rem',
    padding: '3rem 1rem',
    minHeight: '60vh',
    flexWrap: 'wrap',
  };

  const cardStyle = {
    width: 220,
    height: 220,
    background: 'rgba(16, 24, 20, 0.85)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    boxShadow: '0 14px 30px rgba(0,0,0,0.6)',
    fontSize: 22,
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'transform 180ms ease, box-shadow 180ms ease',
  };

  const cardHover = {
    transform: 'translateY(-6px)',
    boxShadow: '0 22px 40px rgba(0,0,0,0.7)'
  };

  return (
    <div className="student-dashboard" style={{color: '#fff'}}>
      <header style={{textAlign: 'center', paddingTop: '1rem'}}>
        <h1 style={{margin: 0}}>Student Dashboard</h1>
        <p style={{opacity: 0.8}}>Zgjidh vitin për të parë informatat (statike fillimisht)</p>
      </header>

      <main style={containerStyle}>
        {years.map((y) => (
          <div
            key={y}
            role="button"
            tabIndex={0}
            onClick={() => console.log('clicked', y)}
            onKeyDown={() => {}}
            style={cardStyle}
            className="student-year-card"
          >
            {y}
          </div>
        ))}
      </main>
    </div>
  );
};

export default StudentDashboard;
