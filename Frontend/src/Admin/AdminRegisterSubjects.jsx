import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import RoleSwitcher from '../components/RoleSwitcher';

const AdminRegisterSubjects = () => {
    const navigate = useNavigate();
    const [adminName, setAdminName] = useState('Admin');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const student = localStorage.getItem('student');
        if (student) {
            try {
                const userData = JSON.parse(student);
                const firstName = userData.emri || 'Admin';
                const lastName = userData.mbiemri || '';
                const fullName = `${firstName} ${lastName}`.trim();
                setAdminName(fullName);
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

    const pageStyle = {
        color: '#fff',
        minHeight: '100vh',
        background: 'radial-gradient(circle at 20% 20%, rgba(27,148,92,0.15), transparent 35%), radial-gradient(circle at 80% 0%, rgba(23,199,122,0.12), transparent 30%), linear-gradient(180deg, rgba(9,16,12,1) 0%, rgba(12,26,18,1) 50%, rgba(8,18,12,1) 100%)',
        padding: '2rem',
        margin: 0,
        fontFamily: 'Inter, system-ui, Arial, sans-serif',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
    };

    const topBarStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '0.85rem 1.5rem' : '1rem 2.5rem',
        minHeight: 64,
        width: '100%',
        boxSizing: 'border-box',
        zIndex: 100
    };

    const brandStyle = {
        color: '#17c77a',
        fontWeight: 800,
        fontSize: isMobile ? 18 : 22,
        letterSpacing: 0.6,
        cursor: 'pointer'
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

    const containerStyle = {
        width: '100%',
        maxWidth: '1200px',
        marginTop: '5rem',
        marginLeft: 'auto',
        marginRight: 'auto'
    };

    const backButtonStyle = {
        width: 40,
        height: 40,
        borderRadius: 8,
        background: 'rgba(23, 199, 122, 0.1)',
        border: '1px solid rgba(23, 199, 122, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#17c77a',
        cursor: 'pointer',
        fontSize: 20,
        transition: 'all 200ms ease',
        marginBottom: '2rem'
    };

    const titleStyle = {
        fontSize: isMobile ? 24 : 32,
        fontWeight: 800,
        margin: 0,
        letterSpacing: '-0.5px',
        marginBottom: '1rem'
    };

    const subtitleStyle = {
        fontSize: isMobile ? 12 : 14,
        opacity: 0.65,
        margin: 0,
        letterSpacing: '0.3px'
    };

    return (
        <div style={pageStyle}>
            <div style={topBarStyle}>
                <div style={brandStyle} onClick={() => navigate('/admin')}>
                    Feedelate
                </div>
                <div style={{ flex: 1 }} />
                <div style={actionsStyle}>
                    <RoleSwitcher currentRole="admin" />
                    <div style={bellStyle}>🔔</div>
                    <UserMenu userName={adminName} userType="admin" />
                </div>
            </div>

            <div style={containerStyle}>
                <button
                    style={backButtonStyle}
                    onClick={() => navigate('/admin')}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(23, 199, 122, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(23, 199, 122, 0.1)'}
                >
                    ←
                </button>

                <h1 style={titleStyle}>Regjistro Lendet</h1>
                <p style={subtitleStyle}>Menaxho lendet e studimit</p>

                <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(16, 24, 20, 0.6)', borderRadius: 12, border: '1px solid rgba(23, 199, 122, 0.2)' }}>
                    <p style={{ fontSize: 16, opacity: 0.7 }}>Përmbajtja do të shtohet këtu</p>
                </div>
            </div>
        </div>
    );
};

export default AdminRegisterSubjects;
