import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import RoleSwitcher from '../components/RoleSwitcher';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [adminName, setAdminName] = useState('Admin');
    const [avatarLetter, setAvatarLetter] = useState('A');

    useEffect(() => {
        // Load user data from localStorage - try admin first, fallback to student
        const student = localStorage.getItem('admin') || localStorage.getItem('student');
        if (student) {
            try {
                const userData = JSON.parse(student);
                const firstName = userData.emri || 'Admin';
                const lastName = userData.mbiemri || '';
                const fullName = `${firstName} ${lastName}`.trim();
                setAdminName(fullName);
                setAvatarLetter((firstName.charAt(0) + lastName.charAt(0)).toUpperCase());
            } catch (err) {
                console.error('Failed to load user data:', err);
            }
        }
    }, []);

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 720);
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const pageStyle = {
        color: '#fff',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #6B7280 0%, #0B2E33 60%, #0B2E33 100%)',
        padding: '2rem',
        margin: 0,
        fontFamily: 'Inter, system-ui, Arial, sans-serif',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
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
        boxSizing: 'border-box'
    };

    const brandStyle = {
        color: '#B8E3E9',
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

    const adminBadge = {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontWeight: 600
    };

    const avatarStyle = {
        width: 42,
        height: 42,
        borderRadius: 21,
        background: '#4F7C82',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0B2E33',
        fontWeight: 700,
        letterSpacing: 0.8
    };

    const layoutContainer = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '900px'
    };

    const cardBase = {
        width: '100%',
        maxWidth: isMobile ? '300px' : '360px',
        padding: isMobile ? '2rem 1.5rem' : '2.5rem 2rem',
        background: 'rgba(11,46,51,0.75)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(184,227,233,0.25)',
        borderRadius: 16,
        boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
        color: '#B8E3E9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: isMobile ? '15px' : '16px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        textAlign: 'center',
        letterSpacing: '0.5px'
    };

    const cardsContainer = {
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '1.5rem' : '2rem',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    };

    const cards = useMemo(() => ([
        { id: 'students', label: 'Menaxho Studentët', to: '/admin/menaxho-studentet' },
        { id: 'professors', label: 'Menaxho Profesorët', to: '/admin/menaxho-profesoret' },
        { id: 'courses', label: 'Regjistro Lendet', to: '/admin/regjistro-lendet' }
    ]), []);

    const positions = useMemo(() => (
        isMobile
            ? [
                { left: '50%', top: '28%', transform: 'translateX(-50%)' },
                { left: '50%', top: '58%', transform: 'translateX(-50%)' },
                { left: '50%', top: '88%', transform: 'translateX(-50%)' }
            ]
            : [
                { left: '25%', top: '28%' },
                { left: '50%', top: '28%', transform: 'translateX(-50%)' },
                { left: '75%', top: '28%', transform: 'translateX(-100%)' }
            ]
    ), [isMobile]);

    const handleNavigate = useCallback((to) => {
        navigate(to);
    }, [navigate]);

    const handleKeyDown = useCallback((event, to) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleNavigate(to);
        }
    }, [handleNavigate]);

    return (
        <div className="admin-dashboard" style={pageStyle}>
            <div style={topBarStyle}>
                <div style={brandStyle}>Feedelate</div>
                <div style={{ flex: 1 }} />
                <div style={actionsStyle}>
                    <RoleSwitcher currentRole="admin" />
                    <UserMenu userName={adminName} userType="admin" />
                </div>
            </div>

            <main style={layoutContainer}>
                <div style={{ marginBottom: isMobile ? '2.5rem' : '3rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: isMobile ? '28px' : '32px', margin: '0 0 0.5rem 0', fontWeight: 800, letterSpacing: '-0.5px' }}>Paneli i Administrimit</h2>
                    <p style={{ fontSize: isMobile ? '13px' : '14px', opacity: 0.65, margin: '0.5rem 0 0 0', letterSpacing: '0.3px' }}>Menaxho studentët dhe profesorët në platformën e universitetit</p>
                </div>

                <div style={cardsContainer}>
                    {cards.map(({ id, label, to }, idx) => {
                        return (
                            <div
                                key={id}
                                role="button"
                                tabIndex={0}
                                aria-label={label}
                                onClick={() => handleNavigate(to)}
                                onKeyDown={(event) => handleKeyDown(event, to)}
                                style={cardBase}
                                className="admin-card"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(11,46,51,0.9)';
                                    e.currentTarget.style.borderColor = 'rgba(184,227,233,0.5)';
                                    e.currentTarget.style.boxShadow = '0 30px 80px rgba(11,46,51,0.45)';
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(11,46,51,0.75)';
                                    e.currentTarget.style.borderColor = 'rgba(184,227,233,0.25)';
                                    e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.45)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                {label}
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
