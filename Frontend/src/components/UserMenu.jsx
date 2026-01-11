import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserMenu = ({ userName, userType = 'student' }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const avatarLetter = (userName && userName.length > 0) ? userName.split(' ')[0][0].toUpperCase() : 'U';

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'GET',
        credentials: 'include'
      });

      // Clear localStorage
      localStorage.removeItem('student');
      localStorage.removeItem('authenticated');

      // Redirect to login
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear localStorage and redirect even if API call fails
      localStorage.removeItem('student');
      localStorage.removeItem('authenticated');
      navigate('/login', { replace: true });
    }
  };

  const menuStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px'
  };

  const userNameStyle = {
    color: '#fff',
    fontSize: '14px',
    fontWeight: 500,
    maxWidth: '150px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  const avatarStyle = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #17c77a 0%, #1fc789 100%)',
    border: '2px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 700,
    color: '#fff',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 15px rgba(23, 199, 122, 0.2)'
  };

  const avatarHoverStyle = {
    ...avatarStyle,
    transform: 'scale(1.05)',
    boxShadow: '0 6px 20px rgba(23, 199, 122, 0.3)'
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    background: 'rgba(16, 24, 20, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
    minWidth: '200px',
    zIndex: 1000,
    display: isDropdownOpen ? 'block' : 'none',
    animation: isDropdownOpen ? 'fadeIn 0.2s ease' : 'none'
  };

  const dropdownItemStyle = {
    padding: '12px 16px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    cursor: 'default'
  };

  const logoutButtonStyle = {
    padding: '12px 16px',
    color: '#ff6b6b',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left',
    transition: 'background-color 0.2s ease',
  };

  return (
    <div style={menuStyle}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .user-menu-logout:hover {
          background-color: rgba(255, 107, 107, 0.1);
        }
      `}</style>
      
      <div style={userNameStyle} title={userName}>
        {userName}
      </div>

      <div
        style={isDropdownOpen ? avatarHoverStyle : avatarStyle}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        title={userName}
      >
        {avatarLetter}
      </div>

      <div style={dropdownStyle}>
        <div style={dropdownItemStyle}>
          <span>👤</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>{userName}</div>
            <div style={{ fontSize: '12px', opacity: 0.7, textTransform: 'capitalize' }}>{userType}</div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          style={logoutButtonStyle}
          className="user-menu-logout"
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>

      {/* Close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default UserMenu;
