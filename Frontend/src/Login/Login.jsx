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
    // Open Google OAuth in centered popup window
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const features = `popup=yes,toolbar=0,location=0,status=0,menubar=0,scrollbars=1,resizable=1,width=${width},height=${height},left=${left},top=${top}`;
    let url = 'http://localhost:5000/api/auth/google?popup=1';
    if (firstTime) {
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

  const pageStyle = {
    color: '#fff',
    minHeight: '100vh',
    background: 'radial-gradient(circle at 20% 20%, rgba(27,148,92,0.15), transparent 35%), radial-gradient(circle at 80% 0%, rgba(23,199,122,0.12), transparent 30%), linear-gradient(180deg, rgba(9,16,12,1) 0%, rgba(12,26,18,1) 50%, rgba(8,18,12,1) 100%)',
    padding: isMobile ? '1rem' : '2rem',
    margin: 0,
    fontFamily: 'Inter, system-ui, Arial, sans-serif',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const cardStyle = {
    background: 'rgba(16, 24, 20, 0.9)',
    backdropFilter: 'blur(10px)',
    color: '#fff',
    padding: isMobile ? '1.5rem' : '2.25rem',
    borderRadius: isMobile ? 12 : 16,
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
    width: '100%',
    maxWidth: 420,
    textAlign: 'center'
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
    width: '20px',
    height: '20px'
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.01em' }}>Feedelate</h2>
          <p style={{ color: '#b7c2bd', margin: '0.35rem 0 0', fontSize: '0.95rem' }}>
            Sign in with your @uni-gjilan.net Google account.
          </p>
        </div>

        {/* First time login checkbox */}
        <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
            <input
              type="checkbox"
              checked={firstTime}
              onChange={e => setFirstTime(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Kyçem për herë të parë
          </label>
        </div>

        {/* Show academic year dropdown and StudentCardID input if first time */}
        {firstTime && (
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label style={{ fontSize: 14, color: '#b7c2bd' }}>
              Zgjedh vitin akademik:
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                style={{ ...inputStyle, margin: '0.5rem 0 0.5rem 0', color: '#222' }}
              >
                {academicYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
            <label style={{ fontSize: 14, color: '#b7c2bd', display: 'block', marginTop: 8 }}>
              Student Card ID:
              <input
                type="text"
                value={studentCardId}
                onChange={e => setStudentCardId(e.target.value)}
                style={{ ...inputStyle, margin: '0.5rem 0 0.5rem 0' }}
                placeholder="P.sh. 123456"
              />
            </label>
          </div>
        )}

        {error && (
          <div style={{
            color: '#ff6b6b',
            marginBottom: '1rem',
            padding: '0.75rem',
            background: 'rgba(255,107,107,0.1)',
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <button onClick={handleGoogleLogin} style={buttonStyle}>
          <svg style={logoStyle} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>

        <div style={{ marginTop: '1.5rem', color: '#90a39b', fontSize: '0.9rem', lineHeight: '1.5' }}>
          <p style={{ margin: 0 }}>Use your university email to continue.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
