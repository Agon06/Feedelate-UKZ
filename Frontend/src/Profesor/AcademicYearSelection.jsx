import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import RoleSwitcher from '../components/RoleSwitcher';

const AcademicYearSelection = () => {
  const navigate = useNavigate();
  const [profesorName, setProfessorName] = useState('Profesor');
  const [avatarLetter, setAvatarLetter] = useState('P');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Load user data from localStorage - try profesor first, fallback to student
    const student = localStorage.getItem('profesor') || localStorage.getItem('student');
    if (student) {
      try {
        const userData = JSON.parse(student);
        const firstName = userData.emri || 'Profesor';
        const lastName = userData.mbiemri || '';
        const fullName = `${firstName} ${lastName}`.trim();
        setProfessorName(fullName);
        setAvatarLetter((firstName.charAt(0) + lastName.charAt(0)).toUpperCase());
      } catch (err) {
        console.error('Failed to load user data:', err);
      }
    }
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 720);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Generate academic years (e.g., 23/24, 24/25, 25/26)
  const academicYears = useMemo(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Academic year starts in September (month 8)
    const academicStartYear = currentMonth >= 8 ? currentYear : currentYear - 1;
    
    return [
      { id: '1', label: `${String(academicStartYear - 2).slice(-2)}/${String(academicStartYear - 1).slice(-2)}` },
      { id: '2', label: `${String(academicStartYear - 1).slice(-2)}/${String(academicStartYear).slice(-2)}` },
      { id: '3', label: `${String(academicStartYear).slice(-2)}/${String(academicStartYear + 1).slice(-2)}` }
    ];
  }, []);

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

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 200px)',
    width: '100%',
    padding: isMobile ? '2rem 1rem' : '3rem 2rem',
    boxSizing: 'border-box'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: isMobile ? '2rem' : '3rem'
  };

  const headingStyle = {
    fontSize: isMobile ? 24 : 32,
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: '#fff',
    letterSpacing: 0.5
  };

  const subheadingStyle = {
    fontSize: isMobile ? 14 : 16,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 400
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
    gap: isMobile ? '1.5rem' : '2rem',
    width: '100%',
    maxWidth: isMobile ? '100%' : '900px'
  };

  const cardStyle = {
    background: 'rgba(16, 24, 20, 0.85)',
    border: '1px solid rgba(23, 199, 122, 0.2)',
    borderRadius: 14,
    padding: isMobile ? '2rem 1.5rem' : '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isMobile ? 140 : 180,
    cursor: 'pointer',
    transition: 'all 200ms ease',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    textDecoration: 'none'
  };

  const cardHoverStyle = {
    ...cardStyle,
    background: 'rgba(23, 199, 122, 0.08)',
    borderColor: '#17c77a',
    boxShadow: '0 14px 40px rgba(23, 199, 122, 0.15)',
    transform: 'translateY(-4px)'
  };

  const yearLabelStyle = {
    fontSize: isMobile ? 18 : 24,
    fontWeight: 800,
    color: '#17c77a',
    marginBottom: '0.5rem',
    letterSpacing: 0.8
  };

  const yearTextStyle = {
    fontSize: isMobile ? 13 : 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 500
  };

  const handleCardHover = (e, isHovering) => {
    if (isHovering) {
      e.currentTarget.style.background = cardHoverStyle.background;
      e.currentTarget.style.borderColor = cardHoverStyle.borderColor;
      e.currentTarget.style.boxShadow = cardHoverStyle.boxShadow;
      e.currentTarget.style.transform = cardHoverStyle.transform;
    } else {
      e.currentTarget.style.background = cardStyle.background;
      e.currentTarget.style.borderColor = 'rgba(23, 199, 122, 0.2)';
      e.currentTarget.style.boxShadow = cardStyle.boxShadow;
      e.currentTarget.style.transform = 'translateY(0)';
    }
  };

  const handleNavigate = (yearLabel) => {
    // Ruaj vitin akademik në localStorage
    localStorage.setItem('profesorAcademicYear', yearLabel);
    // Shko në dashboard kryesor
    navigate(`/profesor/dashboard`);
  };

  return (
    <div className="academic-year-selection" style={pageStyle}>
      {/* Top bar */}
      <div style={topBarStyle}>
        <div style={brandStyle}>Feedelate</div>
        <div style={{flex: 1}} />
        <div style={actionsStyle}>
          <RoleSwitcher currentRole="profesor" />
          <div style={bellStyle} aria-label="notifications" role="img">
            🔔
          </div>
          <UserMenu userName={profesorName} userType="profesor" />
        </div>
      </div>

      <div style={{width: '100%', boxSizing: 'border-box'}}>
        <div style={titleStyle}>
          <h2 style={{margin: 0}}>Universiteti Publik Kadri Zeka</h2>
        </div>
      </div>

      <main style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={headingStyle}>Zgjedh Vitin Akademik</h1>
          <p style={subheadingStyle}>Zgjidh vitin akademik për të vazhduar</p>
        </div>

        <div style={gridStyle}>
          {academicYears.map((year) => (
            <div
              key={year.id}
              role="button"
              tabIndex={0}
              aria-label={`Zgjidh vitin akademik ${year.label}`}
              onClick={() => handleNavigate(year.label)}
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}
              style={cardStyle}
              className="academic-year-card"
            >
              <div style={yearLabelStyle}>{year.label}</div>
              <div style={yearTextStyle}>Viti Akademik</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AcademicYearSelection;
