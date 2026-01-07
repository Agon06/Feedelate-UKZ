import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();

  const years = useMemo(() => ([
    { id: '1', label: 'Viti I' },
    { id: '2', label: 'Viti II' },
    { id: '3', label: 'Viti III' }
  ]), []);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 720);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const student = JSON.parse(localStorage.getItem('student') || '{}');
  const studentName = `${student.emri || ''} ${student.mbiemri || ''}`.trim() || 'Student';
  const avatarLetter = (student.emri && student.emri.length > 0) ? student.emri[0].toUpperCase() : 'S';

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
    padding: isMobile ? '0.85rem 1.5rem' : '1rem 2.5rem',
    minHeight: 64,
    width: '100%',
    boxSizing: 'border-box'
  };

  const brandStyle = {
    color: '#17c77a',
    fontWeight: 800,
    fontSize: isMobile ? 18 : 22,
    letterSpacing: 0.6
  };

  const titleStyle = {
    textAlign: 'center',
    fontSize: isMobile ? 16 : 19,
    marginTop: isMobile ? 10 : 6,
    opacity: 0.95,
    letterSpacing: 0.5
  };

  const actionsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 12 : 18
  };

  const bellStyle = {
    width: 40,
    height: 40,
    borderRadius: 20,
    background: 'rgba(23, 199, 122, 0.12)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    color: '#fbd38d'
  };

  const studentBadge = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontWeight: 600
  };

  const avatarStyle = {
    width: 42,
    height: 42,
    borderRadius: 21,
    background: '#0e6b3d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    letterSpacing: 0.8
  };

  const layoutContainer = {
    position: 'relative',
    minHeight: isMobile ? '90vh' : '70vh',
    width: '100%',
    display: 'block',
    overflow: 'visible'
  };

  const cardBase = {
    position: 'absolute',
    width: isMobile ? 160 : 260,
    height: isMobile ? 160 : 260,
    background: 'rgba(16, 24, 20, 0.85)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    boxShadow: '0 14px 30px rgba(0,0,0,0.6)',
    fontSize: isMobile ? 16 : 22,
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'transform 180ms ease, box-shadow 180ms ease'
  };

  const positions = useMemo(() => (
    isMobile
      ? [
          { left: '50%', top: '20%', transform: 'translateX(-50%)' },
          { left: '50%', top: '48%', transform: 'translateX(-50%)' },
          { left: '50%', top: '76%', transform: 'translateX(-50%)' }
        ]
      : [
          { left: '14%', top: '24%' },
          { left: '45%', top: '36%' },
          { left: '76%', top: '48%' }
        ]
  ), [isMobile]);

  const handleNavigate = useCallback((yearId) => {
    navigate(`/student/lendet/${yearId}`);
  }, [navigate]);

  const handleKeyDown = useCallback((event, yearId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigate(yearId);
    }
  }, [handleNavigate]);

  return (
    <div className="student-dashboard" style={pageStyle}>
      {/* Top bar - uses full available width (no negative margins) */}
      <div style={topBarStyle}>
        <div style={brandStyle}>Feedelate</div>
        <div style={{flex: 1}} />
        <div style={actionsStyle}>
          <div style={bellStyle} aria-label="notifications" role="img">
            🔔
          </div>
          <div style={studentBadge}>
            <div style={avatarStyle}>{avatarLetter}</div>
            <span>{studentName}</span>
          </div>
        </div>
      </div>

      <div style={{width: '100%', boxSizing: 'border-box'}}>
        <div style={titleStyle}>
          <h2 style={{margin: 0}}>Universiteti Publik Kadri Zeka</h2>
        </div>
      </div>

      <main style={{...layoutContainer, width: '100%', boxSizing: 'border-box'}}>
        {years.map(({ id, label }, idx) => {
          const pos = positions[idx % positions.length];
          const transformStyle = pos.transform ? { transform: pos.transform } : {};
          return (
            <div
              key={id}
              role="button"
              tabIndex={0}
              aria-label={`Hapet programi ${label}`}
              onClick={() => handleNavigate(id)}
              onKeyDown={(event) => handleKeyDown(event, id)}
              style={{ ...cardBase, left: pos.left, top: pos.top, ...transformStyle }}
              className="student-year-card"
            >
              {label}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default StudentDashboard;
