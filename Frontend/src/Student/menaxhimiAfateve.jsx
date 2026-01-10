import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MenaxhimiAfateve = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const lendaId = location.state?.lendaId ?? null;
    const subjectName = location.state?.subject ?? 'Lëndë e pa specifikuar';

    const student = JSON.parse(localStorage.getItem('student') || '{}');
    if (!student.id) {
        navigate('/');
        return null;
    }
    const STUDENT_ID = student.id;

    const [afatet, setAfatet] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAfatet = async () => {
            if (!lendaId) return;
            
            try {
                setLoading(true);
                const API_BASE_URL = (import.meta.env?.VITE_API_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');
                const response = await fetch(`${API_BASE_URL}/studentet/${STUDENT_ID}/afatet/${lendaId}`);
                
                if (!response.ok) {
                    throw new Error('Nuk u gjeten afatet');
                }
                
                const data = await response.json();
                setAfatet(data.afatet || []);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching afatet:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAfatet();
    }, [lendaId, STUDENT_ID]);

    const pageStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(10,18,12,1) 0%, rgba(14,28,20,1) 60%, rgba(10,18,12,1) 100%)',
        color: '#fff',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '2rem'
    };

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto'
    };

    const headerStyle = {
        textAlign: 'center',
        marginBottom: '2rem'
    };

    const cardContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
    };

    const cardStyle = (isActive) => ({
        background: isActive ? 'rgba(23,199,122,0.15)' : 'rgba(9,18,12,0.9)',
        borderRadius: 20,
        border: `1px solid ${isActive ? 'rgba(23,199,122,0.5)' : 'rgba(23,199,122,0.25)'}`,
        padding: '1.5rem',
        position: 'relative'
    });

    const badgeStyle = (isActive) => ({
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        padding: '0.4rem 1rem',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: isActive ? 'rgba(23,199,122,0.3)' : 'rgba(255,255,255,0.1)',
        color: isActive ? '#1fdc8c' : '#c4f0da',
        border: `1px solid ${isActive ? '#1fdc8c' : 'rgba(255,255,255,0.2)'}`
    });

    const typeIconStyle = {
        fontSize: 48,
        marginBottom: '0.5rem'
    };

    const infoRowStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.75rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        fontSize: 14
    };

    const labelStyle = {
        opacity: 0.7,
        fontWeight: 600
    };

    const valueStyle = {
        fontWeight: 600,
        color: '#1fdc8c'
    };

    const buttonStyle = {
        marginTop: '2rem',
        padding: '0.8rem 1.5rem',
        borderRadius: 12,
        border: '1px solid rgba(23,199,122,0.35)',
        background: 'transparent',
        color: '#c8f5e8',
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 14
    };

    if (loading) {
        return (
            <div style={pageStyle}>
                <div style={containerStyle}>
                    <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.8 }}>
                        Duke u ngarkuar...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                <div style={headerStyle}>
                    <h1 style={{ margin: '0 0 0.5rem 0', fontSize: 32, color: '#1fdc8c' }}>
                        Afatet e Dorëzimit
                    </h1>
                    <p style={{ margin: 0, opacity: 0.8, fontSize: 16 }}>
                        {subjectName}
                    </p>
                </div>

                {error && (
                    <div style={{ 
                        padding: '1rem', 
                        borderRadius: 12, 
                        background: 'rgba(255,82,82,0.15)', 
                        border: '1px solid rgba(255,82,82,0.5)', 
                        color: '#ff5252',
                        marginBottom: '2rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {afatet.length === 0 && !error ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '3rem', 
                        opacity: 0.7,
                        background: 'rgba(9,18,12,0.9)',
                        borderRadius: 20,
                        border: '1px solid rgba(23,199,122,0.25)'
                    }}>
                        <p style={{ fontSize: 18 }}>Nuk ka afate të vendosura për këtë lëndë</p>
                    </div>
                ) : (
                    <div style={cardContainerStyle}>
                        {afatet.map((afati) => (
                            <div key={afati.id} style={cardStyle(afati.isActive)}>
                                <div style={badgeStyle(afati.isActive)}>
                                    {afati.isActive ? '🟢 AKTIV' : '🔴 MBYLLUR'}
                                </div>
                                
                                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                    <div style={typeIconStyle}>
                                        {afati.tipi === 'ide' ? '💡' : '📦'}
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: 22, color: '#1fdc8c' }}>
                                        Dorëzimi i {afati.tipi === 'ide' ? 'Idesë' : 'Projektit'}
                                    </h3>
                                </div>

                                <div style={infoRowStyle}>
                                    <span style={labelStyle}>Hapet:</span>
                                    <span style={valueStyle}>
                                        {new Date(afati.dataFillimit).toLocaleDateString('sq-AL')}
                                    </span>
                                </div>

                                <div style={infoRowStyle}>
                                    <span style={labelStyle}>Mbyllet:</span>
                                    <span style={valueStyle}>
                                        {new Date(afati.dataMbarimit).toLocaleDateString('sq-AL')}
                                    </span>
                                </div>

                                {afati.formati && (
                                    <div style={infoRowStyle}>
                                        <span style={labelStyle}>Formati:</span>
                                        <span style={valueStyle}>{afati.formati}</span>
                                    </div>
                                )}

                                {afati.tema && (
                                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                                        <div style={{ ...labelStyle, marginBottom: '0.5rem' }}>Tema/Detyra:</div>
                                        <div style={{ fontSize: 14, lineHeight: 1.6 }}>{afati.tema}</div>
                                    </div>
                                )}

                                {afati.komente && (
                                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                                        <div style={{ ...labelStyle, marginBottom: '0.5rem' }}>Komente:</div>
                                        <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>{afati.komente}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <button 
                    style={buttonStyle}
                    onClick={() => navigate(-1)}
                >
                    ← Kthehu mbrapa
                </button>
            </div>
        </div>
    );
};

export default MenaxhimiAfateve;