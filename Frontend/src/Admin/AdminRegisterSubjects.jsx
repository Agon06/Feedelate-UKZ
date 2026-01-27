import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import RoleSwitcher from '../components/RoleSwitcher';
import { registerSubject, getAllSubjects } from '../services/adminApi';

const AdminRegisterSubjects = () => {
    const navigate = useNavigate();
    const [adminName, setAdminName] = useState('Admin');
    const [isMobile, setIsMobile] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        subjectName: '',
        year: '',
        type: '',
        semester: ''
    });
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Dynamic semester options based on selected year
    const getSemesterOptions = (year) => {
        if (year === 'viti-1') return [
            { value: 'semestri-1', label: 'Semestri I' },
            { value: 'semestri-2', label: 'Semestri II' }
        ];
        if (year === 'viti-2') return [
            { value: 'semestri-3', label: 'Semestri III' },
            { value: 'semestri-4', label: 'Semestri IV' }
        ];
        if (year === 'viti-3') return [
            { value: 'semestri-5', label: 'Semestri V' },
            { value: 'semestri-6', label: 'Semestri VI' }
        ];
        return [];
    };

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

    // Fetch subjects on component mount
    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const data = await getAllSubjects();
            setSubjects(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch subjects:', err);
            setError('Failed to load subjects');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitSubject = async () => {
        try {
            if (!formData.subjectName || !formData.year || !formData.semester || !formData.type) {
                setError('Please fill in all fields');
                return;
            }
            
            setLoading(true);
            await registerSubject(formData);
            
            // Reset form and modal
            setFormData({
                subjectName: '',
                year: '',
                type: '',
                semester: ''
            });
            setShowModal(false);
            setSuccess('Subject registered successfully!');
            
            // Refresh subjects list
            await fetchSubjects();
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Failed to register subject');
        } finally {
            setLoading(false);
        }
    };

    const pageStyle = {
        color: '#fff',
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(circle at 20% 20%, rgba(27,148,92,0.15), transparent 35%), radial-gradient(circle at 80% 0%, rgba(23,199,122,0.12), transparent 30%), linear-gradient(180deg, rgba(9,16,12,1) 0%, rgba(12,26,18,1) 50%, rgba(8,18,12,1) 100%)',
        margin: 0,
        fontFamily: 'Inter, system-ui, Arial, sans-serif',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    };

    const topBarStyle = {
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '0.85rem 1.5rem' : '1rem 2.5rem',
        minHeight: 64,
        width: '100%',
        boxSizing: 'border-box',
        zIndex: 100,
        flexShrink: 0
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
        padding: '2rem',
        boxSizing: 'border-box',
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
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
                <div style={{
                    width: '100%',
                    maxWidth: '1400px',
                    boxSizing: 'border-box'
                }}>
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

                {/* Error Message */}
                {error && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.15)',
                        borderLeft: '4px solid #ef4444',
                        borderRadius: 8,
                        color: '#fca5a5'
                    }}>
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: 'rgba(34, 197, 94, 0.15)',
                        borderLeft: '4px solid #22c55e',
                        borderRadius: 8,
                        color: '#86efac'
                    }}>
                        {success}
                    </div>
                )}

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize: 16, opacity: 0.7, margin: 0 }}>
                            Total lendet: <strong>{subjects.length}</strong>
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #17c77a 0%, #0ec783 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: 16,
                            cursor: 'pointer',
                            transition: 'all 200ms ease',
                            boxShadow: '0 4px 12px rgba(23, 199, 122, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(23, 199, 122, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(23, 199, 122, 0.3)';
                        }}
                    >
                        + Regjistro Lendin
                    </button>
                </div>

                {/* Subjects grouped by year */}
                {loading ? (
                    <div style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.7 }}>
                        Duke ngarkuar lendet...
                    </div>
                ) : subjects.length === 0 ? (
                    <div style={{
                        marginTop: '3rem',
                        padding: '2rem',
                        background: 'rgba(16, 24, 20, 0.6)',
                        borderRadius: 12,
                        border: '1px solid rgba(23, 199, 122, 0.2)',
                        textAlign: 'center',
                        opacity: 0.7
                    }}>
                        <p style={{ fontSize: 16 }}>Asnjë lëndë e regjistruar akoma</p>
                        <p style={{ fontSize: 14, opacity: 0.6 }}>Kliko "Regjistro Lendin" për të shtuar të parën</p>
                    </div>
                ) : (
                    <div style={{ 
                        marginTop: '2rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '2rem'
                    }}>
                        {[1, 2, 3].map((year) => {
                            const yearSubjects = subjects.filter(s => s.viti === year);
                            if (yearSubjects.length === 0) return null;
                            
                            return (
                                <div key={year}>
                                    <h3 style={{
                                        fontSize: 18,
                                        fontWeight: 700,
                                        color: '#17c77a',
                                        marginBottom: '1rem',
                                        letterSpacing: '-0.3px'
                                    }}>
                                        Viti {year}
                                    </h3>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                                        {yearSubjects.map((subject) => (
                                            <div
                                                key={subject.id}
                                                style={{
                                                    padding: '1rem',
                                                    background: 'rgba(16, 24, 20, 0.6)',
                                                    borderRadius: 8,
                                                    border: '1px solid rgba(23, 199, 122, 0.2)',
                                                    transition: 'all 200ms ease',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(16, 24, 20, 0.8)';
                                                    e.currentTarget.style.borderColor = 'rgba(23, 199, 122, 0.4)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(16, 24, 20, 0.6)';
                                                    e.currentTarget.style.borderColor = 'rgba(23, 199, 122, 0.2)';
                                                }}
                                            >
                                                <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 0.5rem 0', color: '#fff' }}>
                                                    {subject.emriLendes}
                                                </p>
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: 11, opacity: 0.7 }}>
                                                    <span style={{
                                                        padding: '0.3rem 0.6rem',
                                                        background: 'rgba(23, 199, 122, 0.15)',
                                                        borderRadius: 4,
                                                        color: '#17c77a'
                                                    }}>
                                                        Semestri {subject.semestri}
                                                    </span>
                                                    <span style={{
                                                        padding: '0.3rem 0.6rem',
                                                        background: subject.isZgjedhore ? 'rgba(139, 92, 246, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                                                        borderRadius: 4,
                                                        color: subject.isZgjedhore ? '#c4b5fd' : '#fbbf24'
                                                    }}>
                                                        {subject.isZgjedhore ? 'Zgjedhore' : 'Obligative'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                </div>
            </div>

            {/* Modal Backdrop */}
            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        animation: 'fadeIn 200ms ease'
                    }}
                    onClick={() => {
                        setShowModal(false);
                        setError(null);
                    }}
                >
                    {/* Modal Content */}
                    <div
                        style={{
                            background: 'linear-gradient(180deg, rgba(16, 24, 20, 0.95) 0%, rgba(12, 20, 16, 0.95) 100%)',
                            borderRadius: 16,
                            padding: '2.5rem',
                            maxWidth: '500px',
                            width: isMobile ? '90%' : '100%',
                            border: '1px solid rgba(23, 199, 122, 0.3)',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                            animation: 'slideUp 300ms ease'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{
                            fontSize: 24,
                            fontWeight: 800,
                            margin: '0 0 1.5rem 0',
                            color: '#fff',
                            letterSpacing: '-0.5px'
                        }}>
                            Regjistro Lendin
                        </h2>

                        {/* Modal Error Message */}
                        {error && (
                            <div style={{
                                marginBottom: '1rem',
                                padding: '0.75rem',
                                background: 'rgba(239, 68, 68, 0.15)',
                                borderLeft: '3px solid #ef4444',
                                borderRadius: 6,
                                color: '#fca5a5',
                                fontSize: 13
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Form Fields */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            
                            {/* Subject Name */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#17c77a',
                                    marginBottom: '0.5rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Emri i Lendes
                                </label>
                                <input
                                    type="text"
                                    placeholder="P.sh. Matematika Diskrete"
                                    value={formData.subjectName}
                                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem 1rem',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(23, 199, 122, 0.3)',
                                        borderRadius: 8,
                                        color: '#fff',
                                        fontSize: 14,
                                        fontFamily: 'Inter, system-ui, Arial, sans-serif',
                                        boxSizing: 'border-box',
                                        transition: 'all 200ms ease'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                                        e.currentTarget.style.borderColor = 'rgba(23, 199, 122, 0.6)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                        e.currentTarget.style.borderColor = 'rgba(23, 199, 122, 0.3)';
                                    }}
                                />
                            </div>

                            {/* Year Selection */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#17c77a',
                                    marginBottom: '0.5rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Viti Akademik
                                </label>
                                <select
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem 1rem',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(23, 199, 122, 0.3)',
                                        borderRadius: 8,
                                        color: '#fff',
                                        fontSize: 14,
                                        fontFamily: 'Inter, system-ui, Arial, sans-serif',
                                        boxSizing: 'border-box',
                                        cursor: 'pointer',
                                        transition: 'all 200ms ease'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                                        e.currentTarget.style.borderColor = 'rgba(23, 199, 122, 0.6)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                        e.currentTarget.style.borderColor = 'rgba(23, 199, 122, 0.3)';
                                    }}
                                >
                                    <option value="">Zgjidh Vitin</option>
                                    <option value="viti-1">Viti I</option>
                                    <option value="viti-2">Viti II</option>
                                    <option value="viti-3">Viti III</option>
                                </select>
                            </div>

                            {/* Semester Selection */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#17c77a',
                                    marginBottom: '0.5rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Semestri
                                </label>
                                <select
                                    value={formData.semester}
                                    onChange={(e) => {
                                        setFormData({ ...formData, semester: e.target.value });
                                    }}
                                    disabled={!formData.year}
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem 1rem',
                                        background: !formData.year ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(23, 199, 122, 0.3)',
                                        borderRadius: 8,
                                        color: '#fff',
                                        fontSize: 14,
                                        fontFamily: 'Inter, system-ui, Arial, sans-serif',
                                        boxSizing: 'border-box',
                                        cursor: !formData.year ? 'not-allowed' : 'pointer',
                                        opacity: !formData.year ? 0.5 : 1,
                                        transition: 'all 200ms ease'
                                    }}
                                    onFocus={(e) => {
                                        if (formData.year) {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                                            e.currentTarget.style.borderColor = 'rgba(23, 199, 122, 0.6)';
                                        }
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.background = !formData.year ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.08)';
                                        e.currentTarget.style.borderColor = 'rgba(23, 199, 122, 0.3)';
                                    }}
                                >
                                    <option value="">Zgjidh Semestrin</option>
                                    {getSemesterOptions(formData.year).map((sem) => (
                                        <option key={sem.value} value={sem.value}>{sem.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Type Selection */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#17c77a',
                                    marginBottom: '0.5rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Lloji i Lendes
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem 1rem',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(23, 199, 122, 0.3)',
                                        borderRadius: 8,
                                        color: '#fff',
                                        fontSize: 14,
                                        fontFamily: 'Inter, system-ui, Arial, sans-serif',
                                        boxSizing: 'border-box',
                                        cursor: 'pointer',
                                        transition: 'all 200ms ease'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                                        e.currentTarget.style.borderColor = 'rgba(23, 199, 122, 0.6)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                        e.currentTarget.style.borderColor = 'rgba(23, 199, 122, 0.3)';
                                    }}
                                >
                                    <option value="">Zgjidh Llojin</option>
                                    <option value="obligatore">Obligatore</option>
                                    <option value="zgjedhore">Zgjedhore</option>
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginTop: '2.5rem'
                        }}>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setError(null);
                                }}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: '0.85rem 1.5rem',
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    color: '#fff',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 200ms ease',
                                    opacity: loading ? 0.5 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                    }
                                }}
                            >
                                Anulo
                            </button>
                            <button
                                onClick={handleSubmitSubject}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: '0.85rem 1.5rem',
                                    background: loading ? 'rgba(23, 199, 122, 0.5)' : 'linear-gradient(135deg, #17c77a 0%, #0ec783 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 200ms ease',
                                    boxShadow: '0 4px 12px rgba(23, 199, 122, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(23, 199, 122, 0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(23, 199, 122, 0.3)';
                                    }
                                }}
                            >
                                {loading ? 'Duke u ruajtur...' : 'Regjistro'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                    * {
                        margin: 0;
                        padding: 0;
                    }
                    
                    html, body, #root {
                        width: 100%;
                        height: 100%;
                    }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    
                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    select option {
                        background: #0a0e0c;
                        color: #fff;
                    }
                    
                    input::placeholder {
                        color: rgba(255, 255, 255, 0.4);
                    }
                    
                    /* Scrollbar for whole page and containers */
                    ::-webkit-scrollbar {
                        width: 12px;
                    }
                    
                    ::-webkit-scrollbar-track {
                        background: rgba(23, 199, 122, 0.08);
                    }
                    
                    ::-webkit-scrollbar-thumb {
                        background: rgba(23, 199, 122, 0.5);
                        border-radius: 6px;
                    }
                    
                    ::-webkit-scrollbar-thumb:hover {
                        background: rgba(23, 199, 122, 0.7);
                    }
                `}
            </style>
        </div>
    );
};

export default AdminRegisterSubjects;
