// merr dhe shfaq te dhenat e studentit nga API
import React, { useState, useEffect } from 'react';
import { getStudentProfile } from '../services/studentApi';
import { useNavigate } from 'react-router-dom';
import './StudentTheme.css';

const StudentProfile = () => {
    const navigate = useNavigate();
    const student = JSON.parse(localStorage.getItem('student') || '{}');
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const STUDENT_ID = student.id || 1;

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const data = await getStudentProfile(STUDENT_ID);
                setStudentData(data);
            } catch (err) {
                setError(err?.message ?? 'Nuk u lexuan të dhënat e studentit.');
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [STUDENT_ID]);

    if (!student.id) {
        return null;
    }

    if (loading) {
        return (
            <div className="student-theme" style={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, var(--st-2) 0%, var(--st-3) 70%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--st-1)',
                fontSize: isMobile ? 16 : 18
            }}>
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-theme" style={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, var(--st-2) 0%, var(--st-3) 70%)',
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
        <div className="student-theme" style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, var(--st-2) 0%, var(--st-3) 70%)',
            color: 'var(--st-text)',
            padding: isMobile ? '1.5rem' : '2.5rem',
            fontFamily: 'Inter, system-ui, Arial, sans-serif'
        }}>
            <div style={{
                maxWidth: 800,
                margin: '0 auto',
                background: 'rgba(79, 99, 103, 0.6)',
                border: '1px solid var(--st-border)',
                borderRadius: isMobile ? 12 : 16,
                padding: isMobile ? '1.5rem' : '2rem'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '2rem',
                    paddingBottom: '1.5rem',
                    borderBottom: '1px solid var(--st-border)'
                }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--st-border)',
                            color: 'var(--st-1)',
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
                        color: 'var(--st-1)'
                    }}>Profili i Studentit</h1>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{
                        background: 'rgba(122, 158, 159, 0.15)',
                        padding: isMobile ? '1rem' : '1.25rem',
                        borderRadius: 10,
                        border: '1px solid var(--st-border)'
                    }}>
                        <p style={{ margin: 0, fontSize: 14, opacity: 0.7, marginBottom: '0.5rem' }}>Emri</p>
                        <p style={{ margin: 0, fontSize: isMobile ? 18 : 20, fontWeight: 600 }}>{studentData.emri}</p>
                    </div>

                    <div style={{
                        background: 'rgba(122, 158, 159, 0.15)',
                        padding: isMobile ? '1rem' : '1.25rem',
                        borderRadius: 10,
                        border: '1px solid var(--st-border)'
                    }}>
                        <p style={{ margin: 0, fontSize: 14, opacity: 0.7, marginBottom: '0.5rem' }}>Mbiemri</p>
                        <p style={{ margin: 0, fontSize: isMobile ? 18 : 20, fontWeight: 600 }}>{studentData.mbiemri}</p>
                    </div>

                    <div style={{
                        background: 'rgba(122, 158, 159, 0.15)',
                        padding: isMobile ? '1rem' : '1.25rem',
                        borderRadius: 10,
                        border: '1px solid var(--st-border)'
                    }}>
                        <p style={{ margin: 0, fontSize: 14, opacity: 0.7, marginBottom: '0.5rem' }}>Email</p>
                        <p style={{ margin: 0, fontSize: isMobile ? 16 : 18, fontWeight: 600, wordBreak: 'break-all' }}>{studentData.email}</p>
                    </div>

                    <div style={{
                        background: 'rgba(122, 158, 159, 0.15)',
                        padding: isMobile ? '1rem' : '1.25rem',
                        borderRadius: 10,
                        border: '1px solid var(--st-border)'
                    }}>
                        <p style={{ margin: 0, fontSize: 14, opacity: 0.7, marginBottom: '0.5rem' }}>Nr ID Card</p>
                        <p style={{ margin: 0, fontSize: isMobile ? 18 : 20, fontWeight: 600 }}>{studentData.nrIdCard || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;