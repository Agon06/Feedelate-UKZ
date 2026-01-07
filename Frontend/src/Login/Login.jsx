import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [emri, setEmri] = useState('');
  const [mbiemri, setMbiemri] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nrId, setNrId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validatePassword = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter.';
    if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.';
    if (!/\d/.test(password)) return 'Password must include at least one number.';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must include at least one symbol.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      try {
        const response = await fetch('http://localhost:5000/api/studentet/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('student', JSON.stringify(data.student));
          navigate('/student');
        } else {
          const errorData = await response.json();
          setError(errorData.message);
        }
      } catch (error) {
        setError('An error occurred. Please try again.');
      }
    } else {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!email.endsWith('.st@uni-gjilan.net')) {
        setError('Only .st@uni-gjilan.net emails are allowed to signup.');
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/studentet/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emri, mbiemri, email, password, nrIdCard: nrId })
        });
        if (response.ok) {
          setError('Signup successful! Please login.');
          setIsLogin(true);
        } else {
          const errorData = await response.json();
          setError(errorData.message);
        }
      } catch (error) {
        setError('An error occurred. Please try again.');
      }
    }
  };

  const pageStyle = {
    color: '#fff',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, rgba(10,18,12,1) 0%, rgba(14,28,20,1) 50%, rgba(12,30,18,1) 100%)',
    padding: 0,
    margin: 0,
    fontFamily: 'Inter, system-ui, Arial, sans-serif',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const cardStyle = {
    background: 'rgba(16, 24, 20, 0.85)',
    color: '#fff',
    padding: '2rem',
    borderRadius: 14,
    boxShadow: '0 14px 30px rgba(0,0,0,0.6)',
    width: '100%',
    maxWidth: 400,
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
    padding: '0.75rem',
    margin: '1rem 0',
    border: 'none',
    borderRadius: 8,
    background: '#17c77a',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.3s'
  };

  const toggleStyle = {
    marginTop: '1rem',
    color: '#17c77a',
    cursor: 'pointer',
    textDecoration: 'underline'
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2>{isLogin ? 'Login' : 'Signup'}</h2>
        {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div>
                <label>Emri:</label>
                <input
                  type="text"
                  value={emri}
                  onChange={(e) => setEmri(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label>Mbiemri:</label>
                <input
                  type="text"
                  value={mbiemri}
                  onChange={(e) => setMbiemri(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
            </>
          )}
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          {!isLogin && (
            <>
              <div>
                <label>Confirm Password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label>Nr.ID:</label>
                <input
                  type="text"
                  value={nrId}
                  onChange={(e) => setNrId(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </>
          )}
          <button type="submit" style={buttonStyle}>{isLogin ? 'Login' : 'Signup'}</button>
        </form>
        <div style={toggleStyle} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need an account? Signup' : 'Already have an account? Login'}
        </div>
      </div>
    </div>
  );
};

export default Login;
