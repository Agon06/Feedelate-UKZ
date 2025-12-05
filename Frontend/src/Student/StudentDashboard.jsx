import React, { useState, useEffect } from 'react';

const StudentDashboard = () => {
  const [studentet, setStudentet] = useState([]);

  useEffect(() => {
    // TODO: replace static UI with fetched data from backend
  }, []);

  const years = ['Viti I', 'Viti II', 'Viti III'];

  const pageStyle = {
    color: '#fff',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, rgba(10,18,12,1) 0%, rgba(14,28,20,1) 50%, rgba(12,30,18,1) 100%)',
    padding: 0,
    margin: 0,
    fontFamily: 'Inter, system-ui, Arial, sans-serif',
    boxSizing: 'border-box'
  };

  const topBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    height: 64,
  };

  const brandStyle = {
    color: '#17c77a',
    fontWeight: 800,
    fontSize: 20,
    letterSpacing: 0.6
  };

  const titleStyle = {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 6,
    opacity: 0.95
  };

  const layoutContainer = {
    position: 'relative',
    height: '72vh',
    width: '100%',
    display: 'block',
    overflow: 'hidden'
  };

  const cardBase = {
    position: 'absolute',
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
    transition: 'transform 180ms ease, box-shadow 180ms ease'
  };

  const positions = [
    { left: '10%', top: '22%' },
    { left: '42%', top: '38%' },
    { left: '74%', top: '54%' }
  ];

  // responsive fallback for small screens
  const smallScreen = typeof window !== 'undefined' && window.innerWidth < 720;

  return (
    <div className="student-dashboard" style={pageStyle}>
      {/* Top bar - uses full available width (no negative margins) */}
      <div style={{...topBarStyle, width: '100%', boxSizing: 'border-box'}}>
        <div style={brandStyle}>Feedelate</div>
        <div style={{flex: 1}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{width: 40, height: 40, borderRadius: 20, background: '#0e6b3d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'}}>S</div>
        </div>
      </div>

      <div style={{width: '100%', boxSizing: 'border-box'}}>
        <div style={titleStyle}>
          <h2 style={{margin: 0}}>Universiteti Publik Kadri Zeka</h2>
        </div>
      </div>

      <main style={{...layoutContainer, width: '100%', boxSizing: 'border-box'}}>
        {years.map((y, idx) => {
          const pos = smallScreen ? { left: '50%', top: `${20 + idx * 26}%`, transform: 'translateX(-50%)' } : positions[idx];
          return (
            <div
              key={y}
              role="button"
              tabIndex={0}
              onClick={() => console.log('clicked', y)}
              onKeyDown={() => {}}
              style={{ ...cardBase, left: pos.left, top: pos.top, ...(pos.transform ? { transform: pos.transform } : {} ) }}
              className="student-year-card"
            >
              {y}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default StudentDashboard;
