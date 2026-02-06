import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStudentById } from '../services/studentApi';


// Funksion për llogaritjen dinamike të viteve akademike
function getAcademicYears(today = new Date()) {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const baseYear = (month >= 10) ? year : year - 1;
  // 3 vitet më të reja (dinamike)
  const dynamicYears = [
    `${baseYear}/${baseYear + 1}`,
    `${baseYear - 1}/${baseYear}`,
    `${baseYear - 2}/${baseYear - 1}`
  ];
  // Gjej 2 vitet më të vjetra që nuk janë në dynamicYears
  const minYear = 2021; // Viti më i vjetër që mund të shfaqet ndonjëherë
  const allYears = [];
  for (let y = baseYear; y >= minYear; y--) {
    allYears.push(`${y}/${y + 1}`);
  }
  // Filtrimi i viteve historike
  const legacyYears = allYears.filter(y => !dynamicYears.includes(y)).slice(-2);
  return [...legacyYears, ...dynamicYears];
}

const Login = () => {
  const [error, setError] = useState('');
  const [idError, setIdError] = useState('');
  const [userType, setUserType] = useState(null); // 'student' or 'profesor'
  const [firstTime, setFirstTime] = useState(false);
  const academicYears = getAcademicYears();
  const [selectedYear, setSelectedYear] = useState(academicYears[0]);
  const [studentCardId, setStudentCardId] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Check if already authenticated - prevent back button returning to login
    const isAuthenticated = localStorage.getItem('authenticated') === 'true';
    const student = localStorage.getItem('student');

    if (isAuthenticated && student) {
      try {
        const userData = JSON.parse(student);
        // Redirect based on user type
        const userType = userData.type || 'student';
        if (userType === 'student') {
          navigate('/student', { replace: true });
        } else if (userType === 'profesor') {
          navigate('/profesor', { replace: true });
        } else if (userType === 'admin') {
          navigate('/admin', { replace: true });
        }
        return;
      } catch (err) {
        console.error('Failed to parse stored user data:', err);
      }
    }

    // Listen for popup postMessage from backend
    const onMessage = (event) => {
      // Ensure message comes from backend origin
      if (event.origin !== 'http://localhost:5000') return;
      const data = event.data;
      if (data && data.type === 'auth' && data.payload) {
        const { user, type } = data.payload;
        try {
          localStorage.setItem('authenticated', 'true');
          // Fetch full student profile if type is student
          if (type === 'student' && user?.id) {
            getStudentById(user.id)
              .then((fullStudent) => {
                localStorage.setItem('student', JSON.stringify(fullStudent));
                navigate('/student', { replace: true });
              })
              .catch(() => {
                // fallback if fetch fails
                localStorage.setItem('student', JSON.stringify(user));
                navigate('/student', { replace: true });
              });
          } else if (type === 'profesor') {
            localStorage.setItem('student', JSON.stringify(user));
            navigate('/profesor', { replace: true });
          } else if (type === 'admin') {
            localStorage.setItem('student', JSON.stringify(user));
            navigate('/admin', { replace: true });
          } else {
            localStorage.setItem('student', JSON.stringify(user));
            navigate('/login');
          }
        } catch (err) {
          setError('Failed to process login data.');
        }
      } else if (data && data.type === 'auth-error') {
        // Show error on main page
        setError(data.message || 'Authentication failed.');
      }
    };
    window.addEventListener('message', onMessage);

    // Check for auth callback
    const params = new URLSearchParams(location.search);
    const userParam = params.get('user');
    const typeParam = params.get('type');
    const errorParam = params.get('error');

    if (errorParam) {
      if (errorParam === 'auth_failed') {
        setError('Authentication failed. Please try again.');
      } else if (errorParam === 'no_user') {
        setError('No user found. Please contact support.');
      } else {
        setError('An error occurred during login.');
      }
      return () => window.removeEventListener('message', onMessage);
    }

    if (userParam && typeParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('authenticated', 'true');
        // Fetch full student profile if type is student
        if (typeParam === 'student' && userData?.id) {
          getStudentById(userData.id)
            .then((fullStudent) => {
              localStorage.setItem('student', JSON.stringify(fullStudent));
              window.history.replaceState({}, document.title, '/student');
              navigate('/student', { replace: true });
            })
            .catch(() => {
              localStorage.setItem('student', JSON.stringify(userData));
              window.history.replaceState({}, document.title, '/student');
              navigate('/student', { replace: true });
            });
        } else if (typeParam === 'profesor') {
          localStorage.setItem('student', JSON.stringify(userData));
          window.history.replaceState({}, document.title, '/profesor');
          navigate('/profesor', { replace: true });
        } else if (typeParam === 'admin') {
          localStorage.setItem('student', JSON.stringify(userData));
          window.history.replaceState({}, document.title, '/admin');
          navigate('/admin', { replace: true });
        }
      } catch (err) {
        setError('Failed to process login data.');
      }
    }
    return () => window.removeEventListener('message', onMessage);
  }, [location, navigate]);

  const handleGoogleLogin = () => {
    // Validate student card ID if first time login and user type is student
    if (userType === 'student' && firstTime) {
      if (!isValidStudentCardId(studentCardId)) {
        setIdError('Vendosni një ID valide');
        return;
      }
    }

    setIdError('');
    // Open Google OAuth in centered popup window
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const features = `popup=yes,toolbar=0,location=0,status=0,menubar=0,scrollbars=1,resizable=1,width=${width},height=${height},left=${left},top=${top}`;
    let url = `http://localhost:5000/api/auth/google?popup=1&userType=${userType}`;
    if (userType === 'student' && firstTime) {
      const params = new URLSearchParams();
      params.set('firstTime', '1');
      params.set('academicYear', selectedYear);
      params.set('studentCardId', studentCardId);
      url += `&${params.toString()}`;
    }
    const popup = window.open(url, 'google-oauth', features);
    if (!popup) {
      setError('Popup blocked. Please allow popups and try again.');
    }
  };

  const isValidStudentCardId = (id) => {
    // Must be exactly 8 digits and start with 2
    return /^2\d{7}$/.test(id);
  };

  const handleStudentCardIdChange = (e) => {
    const value = e.target.value;
    setStudentCardId(value);
    
    // Clear error if user starts typing a valid ID
    if (value && isValidStudentCardId(value)) {
      setIdError('');
    }
  };

  const pageStyle = {
    color: '#fff',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #94A3B8 0%, #0B2E33 100%)',
    padding: isMobile ? '1rem' : '2rem',
    margin: 0,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    scrollBehavior: 'smooth',
    overflowY: 'auto'
  };

  const cardStyle = {
    background: 'rgba(11, 46, 51, 0.9)',
    backdropFilter: 'blur(10px)',
    color: '#fff',
    padding: isMobile ? '1.4rem 1.15rem' : '2.1rem 1.85rem',
    borderRadius: '14px',
    border: '1px solid rgba(184, 227, 233, 0.2)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.35), inset 0 1px 1px rgba(184,227,233,0.08)',
    width: '100%',
    maxWidth: isMobile ? '100%' : 520,
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
    // maxHeight: '90vh',
    // overflowY: 'auto'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '1rem'
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.9rem',
    margin: '1rem 0',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    background: '#fff',
    color: '#111',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.65rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
  };

  const logoStyle = {
    width: '16px',
    height: '16px'
  };

  const typeButtonStyle = {
    flex: 1,
    padding: '1rem',
    border: '1px solid rgba(23, 199, 122, 0.3)',
    borderRadius: '8px',
    background: 'rgba(23, 199, 122, 0.08)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 200ms ease',
    textAlign: 'center'
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={{ marginBottom: '1.9rem' }}>
          <img 
            src="https://uni-gjilan.net/wp-content/themes/kadrizeka/img/uni-gjilan_sq.png" 
            alt="Uni Gjilan Logo"
            style={{
              height: '60px',
              marginBottom: '1.5rem',
              objectFit: 'contain'
            }}
          />
          <h1 style={{ 
            margin: '0 0 0.4rem 0', 
            fontSize: '2.8rem', 
            fontWeight: 900, 
            letterSpacing: '-0.02em',
            color: '#fff'
          }}>
            Feedelate
          </h1>
          <div style={{
            height: '2px',
            width: '50px',
            background: 'linear-gradient(90deg, #B8E3E9 0%, rgba(184,227,233,0) 100%)',
            margin: '0 auto 0'
          }}></div>
        </div>

        {/* User Type Selection */}
        {!userType && (
          <div style={{ marginBottom: '1.7rem' }}>
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}>
              <button
                onClick={() => setUserType('student')}
                style={{
                  flex: 1,
                  padding: '1.5rem 1.25rem',
                  border: '2px solid rgba(184, 227, 233, 0.25)',
                  borderRadius: '10px',
                  background: 'rgba(184, 227, 233, 0.08)',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 250ms ease',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  textTransform: 'uppercase',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#B8E3E9';
                  e.target.style.background = 'rgba(184, 227, 233, 0.15)';
                  e.target.style.boxShadow = '0 0 20px rgba(184, 227, 233, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'rgba(184, 227, 233, 0.25)';
                  e.target.style.background = 'rgba(184, 227, 233, 0.08)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Student
              </button>
              <button
                onClick={() => setUserType('profesor')}
                style={{
                  flex: 1,
                  padding: '1.5rem 1.25rem',
                  border: '2px solid rgba(184, 227, 233, 0.25)',
                  borderRadius: '10px',
                  background: 'rgba(184, 227, 233, 0.08)',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 250ms ease',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  textTransform: 'uppercase',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#B8E3E9';
                  e.target.style.background = 'rgba(184, 227, 233, 0.15)';
                  e.target.style.boxShadow = '0 0 20px rgba(184, 227, 233, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'rgba(184, 227, 233, 0.25)';
                  e.target.style.background = 'rgba(184, 227, 233, 0.08)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Profesor
              </button>
            </div>
          </div>
        )}

        {/* Authentication Form */}
        {userType && (
          <>
            <div style={{ marginBottom: '1.7rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setUserType(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#B8E3E9',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  padding: 0,
                  fontWeight: 600,
                  transition: 'opacity 200ms',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                ← Kthehu prapa
              </button>
              <p style={{
                margin: 0,
                fontSize: '0.9rem',
                color: '#B8E3E9',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {userType === 'student' ? 'Student' : 'Profesor'}
              </p>
            </div>

            {/* Form Container - Only show for students who check first time login */}
            {userType === 'student' && firstTime && (
              <div style={{
                background: 'rgba(184, 227, 233, 0.08)',
                border: '1px solid rgba(184, 227, 233, 0.25)',
                borderRadius: '10px',
                padding: '1.5rem',
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                {/* Academic Year & Card ID */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ 
                        fontSize: '0.75rem', 
                        color: 'rgba(184, 227, 233, 0.75)',
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        Viti Akademik
                      </label>
                      <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        style={{ 
                          width: '100%',
                          padding: '0.65rem 0.8rem',
                          fontSize: '0.9rem',
                          color: '#e5f0eb',
                          borderRadius: '7px',
                          border: '1px solid rgba(184, 227, 233, 0.35)',
                          background: 'rgba(11, 46, 51, 0.5)',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'border-color 200ms'
                        }}
                        onMouseEnter={(e) => e.target.style.borderColor = 'rgba(184, 227, 233, 0.6)'}
                        onMouseLeave={(e) => e.target.style.borderColor = 'rgba(184, 227, 233, 0.35)'}
                      >
                        {academicYears.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ 
                        fontSize: '0.75rem', 
                        color: 'rgba(184, 227, 233, 0.75)',
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        ID-ja e Kartës Studenti
                      </label>
                      <input
                        type="text"
                        value={studentCardId}
                        onChange={handleStudentCardIdChange}
                        style={{ 
                          width: '100%',
                          padding: '0.65rem 0.8rem',
                          fontSize: '0.9rem',
                          border: idError ? '1px solid rgba(255, 100, 100, 0.4)' : '1px solid rgba(184, 227, 233, 0.35)',
                          background: idError ? 'rgba(255, 100, 100, 0.05)' : 'rgba(11, 46, 51, 0.5)',
                          borderRadius: '7px',
                          color: '#e5f0eb',
                          fontWeight: 500,
                          transition: 'border-color 200ms',
                          boxSizing: 'border-box'
                        }}
                        placeholder="Vendosni 8 shifra"
                        maxLength="8"
                        onFocus={(e) => e.target.style.borderColor = 'rgba(184, 227, 233, 0.6)'}
                        onBlur={(e) => e.target.style.borderColor = idError ? 'rgba(255, 100, 100, 0.4)' : 'rgba(184, 227, 233, 0.35)'}
                      />
                    </div>

                    {idError && (
                      <div style={{
                        color: '#ff9999',
                        marginTop: '0.75rem',
                        fontSize: '0.8rem',
                        padding: '0.75rem',
                        background: 'rgba(255, 100, 100, 0.08)',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 100, 100, 0.2)',
                        fontWeight: 500
                      }}>
                        {idError}
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* First time login checkbox - only for students */}
            {userType === 'student' && (
              <div style={{ marginBottom: '1.2rem', textAlign: 'left' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  color: '#e5f0eb',
                  fontWeight: 500,
                  userSelect: 'none'
                }}>
                  <input
                    type="checkbox"
                    checked={firstTime}
                    onChange={e => setFirstTime(e.target.checked)}
                    style={{ 
                      width: '18px', 
                      height: '18px', 
                      cursor: 'pointer',
                      accentColor: '#B8E3E9'
                    }}
                  />
                  Kyçem për herë të parë
                </label>
              </div>
            )}

            {error && (
              <div style={{
                color: '#ff9999',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'rgba(255, 100, 100, 0.08)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                border: '1px solid rgba(255, 100, 100, 0.2)',
                fontWeight: 500
              }}>
                {error}
              </div>
            )}

            <button onClick={handleGoogleLogin} style={{
              width: '100%',
              padding: '0.7rem 1rem',
              border: '1px solid rgba(23, 199, 122, 0.3)',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(184, 227, 233, 0.2) 0%, rgba(184, 227, 233, 0.1) 100%)',
              color: '#B8E3E9',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              letterSpacing: '0.02em',
              transition: 'all 250ms ease',
              textTransform: 'uppercase',
              boxShadow: '0 4px 12px rgba(184, 227, 233, 0.18)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, rgba(184, 227, 233, 0.3) 0%, rgba(184, 227, 233, 0.18) 100%)';
              e.target.style.borderColor = '#B8E3E9';
              e.target.style.boxShadow = '0 8px 24px rgba(184, 227, 233, 0.28)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, rgba(184, 227, 233, 0.2) 0%, rgba(184, 227, 233, 0.1) 100%)';
              e.target.style.borderColor = 'rgba(184, 227, 233, 0.3)';
              e.target.style.boxShadow = '0 4px 12px rgba(184, 227, 233, 0.18)';
            }}>
              <svg style={logoStyle} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#B8E3E9" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#B8E3E9" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#B8E3E9" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#B8E3E9" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Kyçu me Google
            </button>

            <p style={{ 
              marginTop: '1rem', 
              color: '#7a8d86', 
              fontSize: '0.8rem',
              fontWeight: 500,
              letterSpacing: '0.01em',
              margin: '1rem 0 0 0'
            }}>
              Përdorni llogarinë tuaj @uni-gjilan.net
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
