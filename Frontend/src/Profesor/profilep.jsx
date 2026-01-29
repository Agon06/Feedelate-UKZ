// merr dhe shfaq te dhenat e profesorit nga API
import React, { useState, useEffect } from 'react';
import { getProfesorProfile } from '../services/profesorApi';
import { useNavigate } from 'react-router-dom';

const Profilep = () => {
    const navigate = useNavigate();
    const student = JSON.parse(localStorage.getItem('student') || '{}');
    const PROFESOR_ID = student.id || 1;
    const [profesorData, setProfesorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchProfesorData = async () => {
            try {
                const data = await getProfesorProfile(PROFESOR_ID);
                setProfesorData(data);
            } catch (err) {
                setError(err?.message ?? 'Nuk u lexuan të dhënat e profesorit.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfesorData();
    }, [PROFESOR_ID]);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, rgba(10,18,12,1) 0%, rgba(14,28,20,1) 50%, rgba(12,30,18,1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#17c77a',
                fontSize: isMobile ? 16 : 18
            }}>
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, rgba(10,18,12,1) 0%, rgba(14,28,20,1) 50%, rgba(12,30,18,1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff6b6b',
                fontSize: isMobile ? 16 : 18,
                padding: isMobile ? '1rem' : '2rem',
                textAlign: 'center'
            }}>
                Error: {error}
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, rgba(10,18,12,1) 0%, rgba(14,28,20,1) 50%, rgba(12,30,18,1) 100%)',
            color: '#fff',
            padding: isMobile ? '1.5rem' : '2.5rem',
            fontFamily: 'Inter, system-ui, Arial, sans-serif'
        }}>
            <div style={{
                maxWidth: 800,
                margin: '0 auto',
                background: 'rgba(16, 24, 20, 0.6)',
                border: '1px solid rgba(23, 199, 122, 0.3)',
                borderRadius: isMobile ? 12 : 16,
                padding: isMobile ? '1.5rem' : '2rem'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '2rem',
                    paddingBottom: '1.5rem',
                    borderBottom: '1px solid rgba(23, 199, 122, 0.2)'
                }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(23, 199, 122, 0.5)',
                            color: '#17c77a',
                            padding: '0.5rem 1rem',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 600
                        }}
                    >
                        ← Kthehu
                    </button>
                    <h1 style={{
                        margin: 0,
                        fontSize: isMobile ? 24 : 32,
                        fontWeight: 800,
                        color: '#17c77a'
                    }}>Profili i Profesorit</h1>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{
                        background: 'rgba(23, 199, 122, 0.05)',
                        padding: isMobile ? '1rem' : '1.25rem',
                        borderRadius: 10,
                        border: '1px solid rgba(23, 199, 122, 0.2)'
                    }}>
                        <p style={{ margin: 0, fontSize: 14, opacity: 0.7, marginBottom: '0.5rem' }}>Emri</p>
                        <p style={{ margin: 0, fontSize: isMobile ? 18 : 20, fontWeight: 600 }}>{profesorData.emri}</p>
                    </div>

                    <div style={{
                        background: 'rgba(23, 199, 122, 0.05)',
                        padding: isMobile ? '1rem' : '1.25rem',
                        borderRadius: 10,
                        border: '1px solid rgba(23, 199, 122, 0.2)'
                    }}>
                        <p style={{ margin: 0, fontSize: 14, opacity: 0.7, marginBottom: '0.5rem' }}>Mbiemri</p>
                        <p style={{ margin: 0, fontSize: isMobile ? 18 : 20, fontWeight: 600 }}>{profesorData.mbiemri}</p>
                    </div>

                    <div style={{
                        background: 'rgba(23, 199, 122, 0.05)',
                        padding: isMobile ? '1rem' : '1.25rem',
                        borderRadius: 10,
                        border: '1px solid rgba(23, 199, 122, 0.2)'
                    }}>
                        <p style={{ margin: 0, fontSize: 14, opacity: 0.7, marginBottom: '0.5rem' }}>Email</p>
                        <p style={{ margin: 0, fontSize: isMobile ? 16 : 18, fontWeight: 600, wordBreak: 'break-all' }}>{profesorData.email}</p>
                    </div>

                    <div style={{
                        background: 'rgba(23, 199, 122, 0.05)',
                        padding: isMobile ? '1rem' : '1.25rem',
                        borderRadius: 10,
                        border: '1px solid rgba(23, 199, 122, 0.2)'
                    }}>
                        <p style={{ margin: 0, fontSize: 14, opacity: 0.7, marginBottom: '0.5rem' }}>Departamenti</p>
                        <p style={{ margin: 0, fontSize: isMobile ? 18 : 20, fontWeight: 600 }}>{profesorData.departamenti || 'N/A'}</p>
                    </div>

                    <div style={{
                        background: 'rgba(23, 199, 122, 0.05)',
                        padding: isMobile ? '1rem' : '1.25rem',
                        borderRadius: 10,
                        border: '1px solid rgba(23, 199, 122, 0.2)'
                    }}>
                        <p style={{ margin: 0, fontSize: 14, opacity: 0.7, marginBottom: '0.5rem' }}>Grada</p>
                        <p style={{ margin: 0, fontSize: isMobile ? 18 : 20, fontWeight: 600 }}>{profesorData.grada || 'N/A'}</p>
                    </div>

                    <div style={{
                        background: 'rgba(23, 199, 122, 0.05)',
                        padding: isMobile ? '1rem' : '1.25rem',
                        borderRadius: 10,
                        border: '1px solid rgba(23, 199, 122, 0.2)'
                    }}>
                        <p style={{ margin: 0, fontSize: 14, opacity: 0.7, marginBottom: '0.5rem' }}>Telefoni</p>
                        <p style={{ margin: 0, fontSize: isMobile ? 18 : 20, fontWeight: 600 }}>{profesorData.telefoni || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profilep;
