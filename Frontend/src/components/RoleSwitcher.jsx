import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSwitcher = ({ currentRole = 'student' }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);

  useEffect(() => {
    // Get available roles from localStorage
    const student = localStorage.getItem('student');
    if (student) {
      try {
        const userData = JSON.parse(student);
        console.log('RoleSwitcher - userData:', userData);
        console.log('RoleSwitcher - userData.roles:', userData.roles);
        if (userData.roles) {
          let roles;
          // Handle both string and array formats
          if (typeof userData.roles === 'string') {
            try {
              // Try to parse as JSON first
              roles = JSON.parse(userData.roles);
            } catch (e) {
              // If it fails, treat it as a comma-separated string
              roles = userData.roles.split(',').map(r => r.trim());
            }
          } else {
            roles = userData.roles;
          }
          console.log('RoleSwitcher - parsed roles:', roles);
          setAvailableRoles(Array.isArray(roles) ? roles : []);
        }
      } catch (err) {
        console.error('Failed to parse roles:', err);
      }
    }
  }, []);

  const roleLabels = {
    student: 'Student',
    profesor: 'Profesor',
    admin: 'Admin'
  };

  const roleEmojis = {
    student: '👤',
    profesor: '👨‍🏫',
    admin: '⚙️'
  };

  const dashboardRoutes = {
    student: '/student',
    profesor: '/profesor',
    admin: '/admin'
  };

  const handleRoleSwitch = (role) => {
    if (role !== currentRole) {
      navigate(dashboardRoutes[role], { replace: true });
    }
    setIsDropdownOpen(false);
  };

  // Only show switcher if user has multiple roles
  if (availableRoles.length <= 1) {
    return null;
  }

  const menuStyle = {
    position: 'relative',
    display: 'inline-block'
  };

  const switcherButtonStyle = {
    background: 'rgba(23, 199, 122, 0.1)',
    border: '1px solid rgba(23, 199, 122, 0.3)',
    color: '#17c77a',
    padding: '0.6rem 1rem',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px',
    transition: 'all 200ms ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    letterSpacing: '0.3px'
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
    minWidth: '180px',
    zIndex: 1000,
    display: isDropdownOpen ? 'block' : 'none',
    animation: isDropdownOpen ? 'fadeIn 0.2s ease' : 'none'
  };

  const dropdownItemStyle = (role) => ({
    padding: '12px 16px',
    color: currentRole === role ? '#17c77a' : '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    cursor: 'pointer',
    background: currentRole === role ? 'rgba(23, 199, 122, 0.1)' : 'transparent',
    fontWeight: currentRole === role ? 600 : 500,
    transition: 'all 150ms ease'
  });

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
        
        .role-switcher-item:hover {
          background-color: rgba(23, 199, 122, 0.08);
        }
      `}</style>

      <button
        style={switcherButtonStyle}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(23, 199, 122, 0.15)';
          e.target.style.borderColor = 'rgba(23, 199, 122, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(23, 199, 122, 0.1)';
          e.target.style.borderColor = 'rgba(23, 199, 122, 0.3)';
        }}
      >
        {roleEmojis[currentRole]} {roleLabels[currentRole]}
      </button>

      <div style={dropdownStyle}>
        {availableRoles.map((role) => (
          <div
            key={role}
            style={dropdownItemStyle(role)}
            onClick={() => handleRoleSwitch(role)}
            className="role-switcher-item"
            onMouseEnter={(e) => {
              if (currentRole !== role) {
                e.currentTarget.style.backgroundColor = 'rgba(23, 199, 122, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentRole !== role) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span>{roleEmojis[role]}</span>
            <span>{roleLabels[role]}</span>
            {currentRole === role && <span style={{ marginLeft: 'auto' }}>✓</span>}
          </div>
        ))}
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

export default RoleSwitcher;
