import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserMenu from '../components/UserMenu';

const AdminProfessorManagement = () => {
    const navigate = useNavigate();
    const [adminName, setAdminName] = useState('Admin');
    const [isMobile, setIsMobile] = useState(false);
    const [professors, setProfessors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProfessor, setSelectedProfessor] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const [notification, setNotification] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLendaModalOpen, setIsLendaModalOpen] = useState(false);
    const [lendaFilter, setLendaFilter] = useState('all');
    const [subjectsData] = useState({
        1: [
            { id: 1, name: 'Matematika Diskrete', semester: 1, type: 'obligative' },
            { id: 2, name: 'Algoritmet', semester: 1, type: 'obligative' },
            { id: 3, name: 'Programim I', semester: 2, type: 'obligative' },
            { id: 4, name: 'Strukturat e të Dhënave', semester: 2, type: 'zgjedhore' }
        ],
        2: [
            { id: 5, name: 'Baza të Të Dhënave', semester: 3, type: 'obligative' },
            { id: 6, name: 'Arkitektura e Kompjuterit', semester: 3, type: 'zgjedhore' },
            { id: 7, name: 'Rrjetet Kompjuterike', semester: 4, type: 'obligative' },
            { id: 8, name: 'Sigurimi i Sistemeve', semester: 4, type: 'zgjedhore' }
        ],
        3: [
            { id: 9, name: 'Inteligjenca Artificiale', semester: 5, type: 'obligative' },
            { id: 10, name: 'Machine Learning', semester: 5, type: 'zgjedhore' },
            { id: 11, name: 'Sisteme Operative Avancuar', semester: 6, type: 'obligative' },
            { id: 12, name: 'Cloud Computing', semester: 6, type: 'zgjedhore' }
        ]
    });

    useEffect(() => {
        // Load user data from localStorage
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

    // Fetch professors from backend
    useEffect(() => {
        const fetchProfessors = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/api/admin/profesors/all', {
                    method: 'GET',
                    credentials: 'include'
                });
                console.log('Fetch response status:', response.status);
                const data = await response.json();
                console.log('Fetched professors data:', data);
                if (response.ok) {
                    setProfessors(Array.isArray(data) ? data : []);
                    setError(null);
                } else {
                    console.error('API returned error:', data);
                    setError(data.message || 'Failed to load professors');
                    setProfessors([]);
                }
            } catch (err) {
                console.error('Error fetching professors:', err);
                setError('Failed to load professors: ' + err.message);
                setProfessors([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProfessors();
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '0.85rem 1.5rem' : '1rem 2.5rem',
        minHeight: 64,
        width: '100%',
        boxSizing: 'border-box',
        marginLeft: '-2rem',
        marginRight: '-2rem',
        marginTop: '-2rem',
        paddingLeft: isMobile ? '1.5rem' : '2.5rem',
        paddingRight: isMobile ? '1.5rem' : '2.5rem'
    };

    const brandStyle = {
        color: '#17c77a',
        fontWeight: 800,
        fontSize: isMobile ? 18 : 22,
        letterSpacing: 0.6
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
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        marginTop: '2rem'
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem'
    };

    const backButtonStyle = {
        background: 'rgba(23, 199, 122, 0.1)',
        border: '1px solid rgba(23, 199, 122, 0.3)',
        color: '#17c77a',
        padding: '0.75rem 1.5rem',
        borderRadius: 8,
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '14px',
        transition: 'all 200ms ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const titleStyle = {
        fontSize: isMobile ? '24px' : '28px',
        fontWeight: 800,
        margin: 0,
        letterSpacing: '-0.5px'
    };

    const tableContainerStyle = {
        background: 'rgba(16, 24, 20, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0,0,0,0.55)'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: isMobile ? '13px' : '14px'
    };

    const theadStyle = {
        background: 'rgba(23, 199, 122, 0.1)',
        borderBottom: '2px solid rgba(23, 199, 122, 0.3)'
    };

    const thStyle = {
        padding: isMobile ? '1rem 0.75rem' : '1.25rem 1.5rem',
        textAlign: 'left',
        fontWeight: 700,
        color: '#17c77a',
        letterSpacing: '0.5px'
    };

    const tdStyle = {
        padding: isMobile ? '1rem 0.75rem' : '1.25rem 1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        color: '#e0e0e0'
    };

    const tbodyRowStyle = {
        transition: 'background-color 200ms ease'
    };

    const modifyButtonStyle = {
        background: 'linear-gradient(135deg, rgba(23, 199, 122, 0.2) 0%, rgba(23, 199, 122, 0.1) 100%)',
        border: '1px solid rgba(23, 199, 122, 0.3)',
        color: '#17c77a',
        padding: '0.5rem 1.25rem',
        borderRadius: 6,
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '12px',
        transition: 'all 200ms ease',
        whiteSpace: 'nowrap'
    };

    const handleModify = (professor) => {
        setSelectedProfessor(professor);
        let professorRoles = [];
        if (professor.roles) {
            try {
                professorRoles = typeof professor.roles === 'string' ? JSON.parse(professor.roles) : professor.roles;
            } catch (err) {
                professorRoles = [];
            }
        }
        setEditData({
            emri: professor.emri,
            mbiemri: professor.mbiemri,
            email: professor.email,
            departamenti: professor.departamenti || '',
            grada: professor.grada || '',
            telefoni: professor.telefoni || '',
            roles: {
                student: professorRoles.includes('student'),
                profesor: professorRoles.includes('profesor'),
                admin: professorRoles.includes('admin')
            }
        });
        setIsEditModalOpen(true);
    };

    const handleSaveChanges = async () => {
        try {
            // Convert roles object to array
            const selectedRoles = [];
            if (editData.roles?.student) selectedRoles.push('student');
            if (editData.roles?.profesor) selectedRoles.push('profesor');
            if (editData.roles?.admin) selectedRoles.push('admin');

            const dataToSave = {
                emri: editData.emri,
                mbiemri: editData.mbiemri,
                email: editData.email,
                departamenti: editData.departamenti,
                grada: editData.grada,
                telefoni: editData.telefoni,
                roles: JSON.stringify(selectedRoles)
            };

            const response = await fetch(`http://localhost:5000/api/admin/profesors/${selectedProfessor.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(dataToSave)
            });

            if (response.ok) {
                // Update professor in local state
                setProfessors(professors.map(p => p.id === selectedProfessor.id ? { ...p, ...dataToSave } : p));
                setIsEditModalOpen(false);
                setSelectedProfessor(null);
                setEditData({});
                
                // Show success notification
                setNotification({
                    type: 'success',
                    message: 'Ndryshimet u ruajtën me sukses!'
                });
                
                // Auto-hide notification after 3 seconds
                setTimeout(() => {
                    setNotification(null);
                }, 3000);
            } else {
                alert('Gabim gjatë ruajtjes. Provo përsëri.');
            }
        } catch (err) {
            console.error('Error saving professor:', err);
            alert('Gabim: ' + err.message);
        }
    };

    const handleCancel = () => {
        setIsEditModalOpen(false);
        setSelectedProfessor(null);
        setEditData({});
    };

    const handleBack = () => {
        navigate('/admin');
    };

    return (
        <div style={pageStyle}>
            <div style={topBarStyle}>
                <div style={brandStyle}>Feedelate</div>
                <div style={{ flex: 1 }} />
                <div style={actionsStyle}>
                    <div style={bellStyle} aria-label="notifications" role="img">
                        🔔
                    </div>
                    <UserMenu userName={adminName} userType="admin" />
                </div>
            </div>

            <div style={containerStyle}>
                <div style={headerStyle}>
                    <button
                        style={backButtonStyle}
                        onClick={handleBack}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(23, 199, 122, 0.15)';
                            e.target.style.borderColor = 'rgba(23, 199, 122, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(23, 199, 122, 0.1)';
                            e.target.style.borderColor = 'rgba(23, 199, 122, 0.3)';
                        }}
                    >
                        ← Kthehu
                    </button>
                    <h1 style={titleStyle}>Menaxho Profesorët</h1>
                </div>

                {/* Search Bar */}
                {professors.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <input
                            type="text"
                            placeholder="Kërko sipas emrit, email-it ose nr ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.85rem 1.25rem',
                                borderRadius: 10,
                                border: '1px solid rgba(23, 199, 122, 0.3)',
                                background: 'rgba(16, 24, 20, 0.9)',
                                color: '#fff',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                transition: 'all 200ms ease',
                                fontFamily: 'Inter, system-ui, Arial, sans-serif'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgba(23, 199, 122, 0.6)';
                                e.target.style.background = 'rgba(16, 24, 20, 0.95)';
                                e.target.style.boxShadow = '0 0 20px rgba(23, 199, 122, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(23, 199, 122, 0.3)';
                                e.target.style.background = 'rgba(16, 24, 20, 0.9)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                )}

                <div style={tableContainerStyle}>
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#17c77a' }}>
                            <p>Ngarkim i profesorëve...</p>
                        </div>
                    ) : error ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#ff6b6b' }}>
                            <p>{error}</p>
                        </div>
                    ) : professors.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#e0e0e0' }}>
                            <p>Nuk ka profesorë në sistem</p>
                        </div>
                    ) : (() => {
                        const filteredProfessors = professors.filter((professor) => {
                            const query = searchQuery.toLowerCase();
                            const fullName = `${professor.emri} ${professor.mbiemri}`.toLowerCase();
                            const email = (professor.email || '').toLowerCase();
                            
                            return fullName.includes(query) || email.includes(query);
                        });

                        return filteredProfessors.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#e0e0e0' }}>
                                <p>Asnjë profesor nuk përputhet me kërkimin</p>
                            </div>
                        ) : (
                        <table style={tableStyle}>
                            <thead style={theadStyle}>
                                <tr>
                                    <th style={thStyle}>Emri</th>
                                    <th style={thStyle}>Email</th>
                                    <th style={thStyle}>Departamenti</th>
                                    <th style={thStyle}>Grada</th>
                                    <th style={thStyle}>Telefoni</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Veprime</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProfessors.map((professor) => (
                                    <tr
                                        key={professor.id}
                                        style={tbodyRowStyle}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(23, 199, 122, 0.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <td style={tdStyle}>
                                            <strong>{professor.emri} {professor.mbiemri}</strong>
                                        </td>
                                        <td style={tdStyle}>{professor.email}</td>
                                        <td style={tdStyle}>{professor.departamenti || '-'}</td>
                                        <td style={tdStyle}>{professor.grada || '-'}</td>
                                        <td style={tdStyle}>{professor.telefoni || '-'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                                            <button
                                                style={modifyButtonStyle}
                                                onClick={() => handleModify(professor)}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = 'linear-gradient(135deg, rgba(23, 199, 122, 0.3) 0%, rgba(23, 199, 122, 0.2) 100%)';
                                                    e.target.style.borderColor = 'rgba(23, 199, 122, 0.5)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = 'linear-gradient(135deg, rgba(23, 199, 122, 0.2) 0%, rgba(23, 199, 122, 0.1) 100%)';
                                                    e.target.style.borderColor = 'rgba(23, 199, 122, 0.3)';
                                                }}
                                            >
                                                Modifiko
                                            </button>
                                            <button
                                                style={{
                                                    ...modifyButtonStyle,
                                                    marginLeft: '0.5rem',
                                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
                                                    borderColor: 'rgba(139, 92, 246, 0.3)'
                                                }}
                                                onClick={() => setIsLendaModalOpen(true)}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)';
                                                    e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)';
                                                    e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                                                }}
                                            >
                                                Lendet
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        );
                    })()}
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'rgba(16, 24, 20, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 12,
                        padding: '2rem',
                        maxWidth: 500,
                        width: '90%',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
                        color: '#fff'
                    }}>
                        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '24px', fontWeight: 800 }}>
                            Ndrysho Të Dhënat e Profesorit
                        </h2>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '14px', color: '#17c77a' }}>
                                Emri
                            </label>
                            <input
                                type="text"
                                value={editData.emri || ''}
                                onChange={(e) => setEditData({ ...editData, emri: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 8,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '14px', color: '#17c77a' }}>
                                Mbiemri
                            </label>
                            <input
                                type="text"
                                value={editData.mbiemri || ''}
                                onChange={(e) => setEditData({ ...editData, mbiemri: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 8,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '14px', color: '#17c77a' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={editData.email || ''}
                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 8,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '14px', color: '#17c77a' }}>
                                Departamenti
                            </label>
                            <input
                                type="text"
                                value={editData.departamenti || ''}
                                onChange={(e) => setEditData({ ...editData, departamenti: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 8,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '14px', color: '#17c77a' }}>
                                Grada
                            </label>
                            <input
                                type="text"
                                value={editData.grada || ''}
                                onChange={(e) => setEditData({ ...editData, grada: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 8,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '14px', color: '#17c77a' }}>
                                Telefoni
                            </label>
                            <input
                                type="text"
                                value={editData.telefoni || ''}
                                onChange={(e) => setEditData({ ...editData, telefoni: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 8,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, fontSize: '14px', color: '#17c77a' }}>
                                Rolet
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={editData.roles?.student || false}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setEditData({
                                                    ...editData,
                                                    roles: { student: true, profesor: false, admin: editData.roles?.admin || false }
                                                });
                                            } else {
                                                if (!editData.roles?.admin) {
                                                    return;
                                                }
                                                setEditData({
                                                    ...editData,
                                                    roles: { ...editData.roles, student: false }
                                                });
                                            }
                                        }}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            cursor: 'pointer',
                                            accentColor: '#17c77a'
                                        }}
                                    />
                                    <span style={{ fontSize: '14px', color: '#e0e0e0' }}>Student</span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={editData.roles?.profesor || false}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setEditData({
                                                    ...editData,
                                                    roles: { student: false, profesor: true, admin: editData.roles?.admin || false }
                                                });
                                            } else {
                                                if (!editData.roles?.admin) {
                                                    return;
                                                }
                                                setEditData({
                                                    ...editData,
                                                    roles: { ...editData.roles, profesor: false }
                                                });
                                            }
                                        }}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            cursor: 'pointer',
                                            accentColor: '#17c77a'
                                        }}
                                    />
                                    <span style={{ fontSize: '14px', color: '#e0e0e0' }}>Profesor</span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={editData.roles?.admin || false}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setEditData({
                                                    ...editData,
                                                    roles: { ...editData.roles, admin: true }
                                                });
                                            } else {
                                                if (!editData.roles?.student && !editData.roles?.profesor) {
                                                    return;
                                                }
                                                setEditData({
                                                    ...editData,
                                                    roles: { ...editData.roles, admin: false }
                                                });
                                            }
                                        }}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            cursor: 'pointer',
                                            accentColor: '#17c77a'
                                        }}
                                    />
                                    <span style={{ fontSize: '14px', color: '#e0e0e0' }}>Admin</span>
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleCancel}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: 8,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'transparent',
                                    color: '#fff',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 200ms ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(255,255,255,0.05)';
                                    e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                                }}
                            >
                                Anulo
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: 8,
                                    border: '1px solid rgba(23, 199, 122, 0.3)',
                                    background: 'rgba(23, 199, 122, 0.2)',
                                    color: '#17c77a',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 200ms ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(23, 199, 122, 0.3)';
                                    e.target.style.borderColor = 'rgba(23, 199, 122, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(23, 199, 122, 0.2)';
                                    e.target.style.borderColor = 'rgba(23, 199, 122, 0.3)';
                                }}
                            >
                                Ruaj Ndryshimet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '2rem',
                    right: '2rem',
                    background: notification.type === 'success' ? 'rgba(23, 199, 122, 0.2)' : 'rgba(255, 107, 107, 0.2)',
                    border: `1px solid ${notification.type === 'success' ? 'rgba(23, 199, 122, 0.4)' : 'rgba(255, 107, 107, 0.4)'}`,
                    borderRadius: 12,
                    padding: '1.25rem 1.75rem',
                    color: notification.type === 'success' ? '#17c77a' : '#ff6b6b',
                    fontSize: '14px',
                    fontWeight: 600,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    animation: 'slideIn 0.3s ease, slideOut 0.3s ease 2.7s'
                }}>
                    <style>{`
                        @keyframes slideIn {
                            from {
                                transform: translateX(400px);
                                opacity: 0;
                            }
                            to {
                                transform: translateX(0);
                                opacity: 1;
                            }
                        }
                        @keyframes slideOut {
                            from {
                                transform: translateX(0);
                                opacity: 1;
                            }
                            to {
                                transform: translateX(400px);
                                opacity: 0;
                            }
                        }
                    `}</style>
                    <span style={{ fontSize: '18px' }}>
                        {notification.type === 'success' ? '✓' : '✕'}
                    </span>
                    {notification.message}
                </div>
            )}

            {/* Lenda Modal */}
            {isLendaModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'linear-gradient(180deg, rgba(16, 24, 20, 0.95) 0%, rgba(12, 20, 16, 0.95) 100%)',
                        border: '1px solid rgba(23, 199, 122, 0.3)',
                        borderRadius: 16,
                        padding: '2rem',
                        maxWidth: 600,
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
                        color: '#fff'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '2rem'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>
                                Zgjedh Lendet
                            </h2>
                            <button
                                onClick={() => setIsLendaModalOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '28px',
                                    color: '#17c77a',
                                    cursor: 'pointer',
                                    padding: 0,
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Filter buttons */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            {[
                                { key: 'all', label: 'Të gjitha' },
                                { key: 'viti-1', label: 'Viti 1' },
                                { key: 'viti-2', label: 'Viti 2' },
                                { key: 'viti-3', label: 'Viti 3' },
                                { key: 'zgjedhore', label: 'Zgjedhore' }
                            ].map((btn) => (
                                <button
                                    key={btn.key}
                                    onClick={() => setLendaFilter(btn.key)}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        background: lendaFilter === btn.key ? 'linear-gradient(135deg, rgba(23,199,122,0.2) 0%, rgba(23,199,122,0.12) 100%)' : 'rgba(255,255,255,0.03)',
                                        color: lendaFilter === btn.key ? '#17c77a' : '#fff',
                                        border: lendaFilter === btn.key ? '1px solid rgba(23,199,122,0.4)' : '1px solid rgba(255,255,255,0.04)',
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        fontSize: 13
                                    }}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>

                        {/* Subjects grouped by year (filtered) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {(() => {
                                const years = [1, 2, 3];
                                const visibleYears = lendaFilter && lendaFilter.startsWith('viti') ? [parseInt(lendaFilter.split('-')[1])] : years;

                                return visibleYears.map((year) => {
                                    const raw = subjectsData[year] || [];
                                    const filtered = lendaFilter === 'zgjedhore' ? raw.filter(s => s.type === 'zgjedhore') : raw;
                                    if (filtered.length === 0) return null;

                                    return (
                                        <div key={year}>
                                            <h3 style={{
                                                fontSize: 15,
                                                fontWeight: 700,
                                                color: '#17c77a',
                                                marginBottom: '0.75rem',
                                                letterSpacing: '-0.3px'
                                            }}>Viti {year}</h3>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1rem' }}>
                                                {filtered.map((subject) => (
                                                    <label key={subject.id} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.6rem',
                                                        cursor: 'pointer',
                                                        padding: '0.6rem',
                                                        borderRadius: 8,
                                                        background: 'rgba(255, 255, 255, 0.02)',
                                                        transition: 'all 200ms ease'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                                                        <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#17c77a' }} />
                                                        <span style={{ flex: 1, fontSize: 14, color: '#fff' }}>{subject.name}</span>
                                                        <span style={{ fontSize: 12, padding: '0.25rem 0.5rem', background: 'rgba(23,199,122,0.12)', borderRadius: 4, color: '#17c77a' }}>Semestri {subject.semester}</span>
                                                        <span style={{ fontSize: 12, padding: '0.25rem 0.5rem', background: subject.type === 'zgjedhore' ? 'rgba(139,92,246,0.12)' : 'rgba(251,191,36,0.12)', borderRadius: 4, color: subject.type === 'zgjedhore' ? '#c4b5fd' : '#fbbf24' }}>{subject.type === 'zgjedhore' ? 'Zgjedhore' : 'Obligative'}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginTop: '2.5rem',
                            paddingTop: '1.5rem',
                            borderTop: '1px solid rgba(23, 199, 122, 0.15)'
                        }}>
                            <button
                                onClick={() => setIsLendaModalOpen(false)}
                                style={{
                                    flex: 1,
                                    padding: '0.85rem 1.5rem',
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    color: '#fff',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    cursor: 'pointer',
                                    transition: 'all 200ms ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                }}
                            >
                                Mbyll
                            </button>
                            <button
                                style={{
                                    flex: 1,
                                    padding: '0.85rem 1.5rem',
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(139, 92, 246, 0.4) 100%)',
                                    color: '#fff',
                                    border: '1px solid rgba(139, 92, 246, 0.5)',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    cursor: 'pointer',
                                    transition: 'all 200ms ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0.5) 100%)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(139, 92, 246, 0.4) 100%)';
                                }}
                            >
                                Ruaj
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProfessorManagement;
