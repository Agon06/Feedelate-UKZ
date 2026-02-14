import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userParam = params.get('user');
    const typeParam = params.get('type');

    if (userParam && typeParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        // Store user based on their type to avoid overwriting different user types
        if (typeParam === 'student') {
          localStorage.setItem('student', JSON.stringify(userData));
          localStorage.removeItem('profesor');
          localStorage.removeItem('admin');
        } else if (typeParam === 'profesor') {
          localStorage.setItem('profesor', JSON.stringify(userData));
          localStorage.removeItem('student');
          localStorage.removeItem('admin');
        } else if (typeParam === 'admin') {
          localStorage.setItem('admin', JSON.stringify(userData));
          localStorage.removeItem('student');
          localStorage.removeItem('profesor');
        }
        localStorage.setItem('authenticated', 'true');
        localStorage.setItem('userType', typeParam);
        
        // Replace history entry to prevent back button returning to callback
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Redirect based on user type
        if (typeParam === 'student') {
          navigate('/student', { replace: true });
        } else if (typeParam === 'profesor') {
          navigate('/profesor', { replace: true });
        } else if (typeParam === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Failed to process login data:', err);
        navigate('/login?error=processing_failed', { replace: true });
      }
    } else {
      navigate('/login?error=missing_data', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, rgba(10,18,12,1) 0%, rgba(14,28,20,1) 50%, rgba(12,30,18,1) 100%)',
      color: '#fff'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          fontSize: '2rem', 
          marginBottom: '1rem',
          animation: 'spin 1s linear infinite'
        }}>⟳</div>
        <p>Processing your login...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
