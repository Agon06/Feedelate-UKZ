import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserMenu from '../components/UserMenu';

const AdminStudentManagement = () => {
    const navigate = useNavigate();
    const [adminName, setAdminName] = useState('Admin');
    const [isMobile, setIsMobile] = useState(false);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const [notification, setNotification] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

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

    // Fetch students from backend
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/api/admin/students/all', {
                    method: 'GET',
                    credentials: 'include'
                });
                console.log('Fetch response status:', response.status);
                const data = await response.json();
                console.log('Fetched students data:', data);
                if (response.ok) {
                    setStudents(Array.isArray(data) ? data : []);
                    setError(null);
                } else {
                    console.error('API returned error:', data);
                    setError(data.message || 'Failed to load students');
                    setStudents([]);
                }
            } catch (err) {
                console.error('Error fetching students:', err);
                setError('Failed to load students: ' + err.message);
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);



    const pageStyle = {
        color: '#B8E3E9',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #6B7280 0%, #0B2E33 60%, #0B2E33 100%)',
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
        color: '#B8E3E9',
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
        background: 'rgba(184,227,233,0.12)',
        border: '1px solid rgba(184,227,233,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        color: '#B8E3E9'
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
        marginBottom: '1rem',
        width: '100%'
    };

    const backButtonStyle = {
        background: 'rgba(11,46,51,0.6)',
        border: '1px solid rgba(184,227,233,0.35)',
        color: '#B8E3E9',
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
        letterSpacing: '-0.5px',
        textAlign: 'center',
        flex: 1
    };

    const tableContainerStyle = {
        background: 'rgba(11,46,51,0.75)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(184,227,233,0.25)',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0,0,0,0.45)'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: isMobile ? '13px' : '14px'
    };

    const theadStyle = {
        background: 'rgba(184,227,233,0.12)',
        borderBottom: '2px solid rgba(184,227,233,0.35)'
    };

    const thStyle = {
        padding: isMobile ? '1rem 0.75rem' : '1.25rem 1.5rem',
        textAlign: 'left',
        fontWeight: 700,
        color: '#B8E3E9',
        letterSpacing: '0.5px'
    };

    const tdStyle = {
        padding: isMobile ? '1rem 0.75rem' : '1.25rem 1.5rem',
        borderBottom: '1px solid rgba(184,227,233,0.15)',
        color: 'rgba(184,227,233,0.9)'
    };

    const tbodyRowStyle = {
        transition: 'background-color 200ms ease'
    };

    const modifyButtonStyle = {
        background: 'rgba(11,46,51,0.6)',
        border: '1px solid rgba(184,227,233,0.35)',
        color: '#B8E3E9',
        padding: '0.5rem 1.25rem',
        borderRadius: 6,
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '12px',
        transition: 'all 200ms ease',
        whiteSpace: 'nowrap'
    };

    const statusStyle = (status) => ({
        padding: '0.35rem 0.75rem',
        borderRadius: 4,
        fontSize: '12px',
        fontWeight: 600,
        display: 'inline-block',
        background: status === 'Aktiv' ? 'rgba(184,227,233,0.15)' : 'rgba(255, 107, 107, 0.15)',
        color: status === 'Aktiv' ? '#B8E3E9' : '#ff6b6b'
    });

    const handleModify = (student) => {
        setSelectedStudent(student);
        let studentRoles = [];
        if (student.roles) {
            try {
                studentRoles = typeof student.roles === 'string' ? JSON.parse(student.roles) : student.roles;
            } catch (err) {
                studentRoles = [];
            }
        }
        setEditData({
            emri: student.emri,
            mbiemri: student.mbiemri,
            email: student.email,
            nrIdCard: student.nrIdCard || '',
            roles: {
                student: studentRoles.includes('student'),
                profesor: studentRoles.includes('profesor'),
                admin: studentRoles.includes('admin')
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
                nrIdCard: editData.nrIdCard,
                roles: JSON.stringify(selectedRoles)
            };

            const response = await fetch(`http://localhost:5000/api/admin/students/${selectedStudent.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(dataToSave)
            });

            if (response.ok) {
                // Update student in local state
                setStudents(students.map(s => s.id === selectedStudent.id ? { ...s, ...dataToSave } : s));
                setIsEditModalOpen(false);
                setSelectedStudent(null);
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
            console.error('Error saving student:', err);
            alert('Gabim: ' + err.message);
        }
    };

    const handleCancel = () => {
        setIsEditModalOpen(false);
        setSelectedStudent(null);
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
                            e.target.style.background = 'rgba(184,227,233,0.12)';
                            e.target.style.borderColor = 'rgba(184,227,233,0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(11,46,51,0.6)';
                            e.target.style.borderColor = 'rgba(184,227,233,0.35)';
                        }}
                    >
                        ← Kthehu
                    </button>
                    <h1 style={titleStyle}>Menaxho Studentët</h1>
                </div>

                {/* Search Bar */}
                {students.length > 0 && (
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
                                border: '1px solid rgba(184,227,233,0.35)',
                                background: 'rgba(11,46,51,0.6)',
                                color: '#B8E3E9',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                transition: 'all 200ms ease',
                                fontFamily: 'Inter, system-ui, Arial, sans-serif'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgba(184,227,233,0.6)';
                                e.target.style.background = 'rgba(11,46,51,0.7)';
                                e.target.style.boxShadow = '0 0 20px rgba(184,227,233,0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(184,227,233,0.35)';
                                e.target.style.background = 'rgba(11,46,51,0.6)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                )}

                <div style={tableContainerStyle}>
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#B8E3E9' }}>
                            <p>Ngarkim i studentëve...</p>
                        </div>
                    ) : error ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#ff6b6b' }}>
                            <p>{error}</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(184,227,233,0.9)' }}>
                            <p>Nuk ka studentë në sistem</p>
                        </div>
                    ) : (() => {
                        const filteredStudents = students.filter((student) => {
                            const query = searchQuery.toLowerCase();
                            const fullName = `${student.emri} ${student.mbiemri}`.toLowerCase();
                            const email = (student.email || '').toLowerCase();
                            const idCard = (student.nrIdCard || '').toLowerCase();
                            
                            return fullName.includes(query) || email.includes(query) || idCard.includes(query);
                        });

                        return filteredStudents.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(184,227,233,0.9)' }}>
                                <p>Asnjë student nuk përputhet me kërkimin</p>
                            </div>
                        ) : (
                        <table style={tableStyle}>
                            <thead style={theadStyle}>
                                <tr>
                                    <th style={thStyle}>Emri</th>
                                    <th style={thStyle}>Email</th>
                                    <th style={thStyle}>Nr ID</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Veprime</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students
                                    .filter((student) => {
                                        const query = searchQuery.toLowerCase();
                                        const fullName = `${student.emri} ${student.mbiemri}`.toLowerCase();
                                        const email = (student.email || '').toLowerCase();
                                        const idCard = (student.nrIdCard || '').toLowerCase();
                                        
                                        return fullName.includes(query) || email.includes(query) || idCard.includes(query);
                                    })
                                    .map((student) => (
                                    <tr
                                        key={student.id}
                                        style={tbodyRowStyle}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(184,227,233,0.08)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <td style={tdStyle}>
                                            <strong>{student.emri} {student.mbiemri}</strong>
                                        </td>
                                        <td style={tdStyle}>{student.email}</td>
                                        <td style={tdStyle}>{student.nrIdCard || '-'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                                            <button
                                                style={modifyButtonStyle}
                                                onClick={() => handleModify(student)}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = 'rgba(184,227,233,0.12)';
                                                    e.target.style.borderColor = 'rgba(184,227,233,0.6)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = 'rgba(11,46,51,0.6)';
                                                    e.target.style.borderColor = 'rgba(184,227,233,0.35)';
                                                }}
                                            >
                                                Modifiko
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
                        background: 'rgba(11,46,51,0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(184,227,233,0.35)',
                        borderRadius: 12,
                        padding: '2rem',
                        maxWidth: 500,
                        width: '90%',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
                        color: '#B8E3E9'
                    }}>
                        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '24px', fontWeight: 800 }}>
                            Ndrysho Të Dhënat e Studentit
                        </h2>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '14px', color: '#B8E3E9' }}>
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
                                    border: '1px solid rgba(184,227,233,0.35)',
                                    background: 'rgba(11,46,51,0.6)',
                                    color: '#B8E3E9',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '14px', color: '#B8E3E9' }}>
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
                                    border: '1px solid rgba(184,227,233,0.35)',
                                    background: 'rgba(11,46,51,0.6)',
                                    color: '#B8E3E9',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '14px', color: '#B8E3E9' }}>
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
                                    border: '1px solid rgba(184,227,233,0.35)',
                                    background: 'rgba(11,46,51,0.6)',
                                    color: '#B8E3E9',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '14px', color: '#B8E3E9' }}>
                                Nr ID Card
                            </label>
                            <input
                                type="text"
                                value={editData.nrIdCard || ''}
                                onChange={(e) => setEditData({ ...editData, nrIdCard: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 8,
                                    border: '1px solid rgba(184,227,233,0.35)',
                                    background: 'rgba(11,46,51,0.6)',
                                    color: '#B8E3E9',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, fontSize: '14px', color: '#B8E3E9' }}>
                                Rolet
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={editData.roles?.student || false}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                // If checking student, uncheck profesor
                                                setEditData({
                                                    ...editData,
                                                    roles: { student: true, profesor: false, admin: editData.roles?.admin || false }
                                                });
                                            } else {
                                                // If unchecking student, make sure at least admin is checked
                                                if (!editData.roles?.admin) {
                                                    // Can't uncheck if it would leave no roles
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
                                    <span style={{ fontSize: '14px', color: 'rgba(184,227,233,0.9)' }}>Student</span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={editData.roles?.profesor || false}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                // If checking profesor, uncheck student
                                                setEditData({
                                                    ...editData,
                                                    roles: { student: false, profesor: true, admin: editData.roles?.admin || false }
                                                });
                                            } else {
                                                // If unchecking profesor, make sure at least admin is checked
                                                if (!editData.roles?.admin) {
                                                    // Can't uncheck if it would leave no roles
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
                                    <span style={{ fontSize: '14px', color: 'rgba(184,227,233,0.9)' }}>Profesor</span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={editData.roles?.admin || false}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                // Can always check admin
                                                setEditData({
                                                    ...editData,
                                                    roles: { ...editData.roles, admin: true }
                                                });
                                            } else {
                                                // If unchecking admin, make sure student or profesor is checked
                                                if (!editData.roles?.student && !editData.roles?.profesor) {
                                                    // Can't uncheck if it would leave no roles
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
                                    <span style={{ fontSize: '14px', color: 'rgba(184,227,233,0.9)' }}>Admin</span>
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleCancel}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: 8,
                                    border: '1px solid rgba(184,227,233,0.35)',
                                    background: 'rgba(11,46,51,0.6)',
                                    color: '#B8E3E9',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 200ms ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(184,227,233,0.12)';
                                    e.target.style.borderColor = 'rgba(184,227,233,0.6)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(11,46,51,0.6)';
                                    e.target.style.borderColor = 'rgba(184,227,233,0.35)';
                                }}
                            >
                                Anulo
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: 8,
                                    border: '1px solid rgba(184,227,233,0.35)',
                                    background: '#0B2E33',
                                    color: '#B8E3E9',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 200ms ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(184,227,233,0.12)';
                                    e.target.style.borderColor = 'rgba(184,227,233,0.6)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = '#0B2E33';
                                    e.target.style.borderColor = 'rgba(184,227,233,0.35)';
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
                    background: notification.type === 'success' ? 'rgba(184,227,233,0.2)' : 'rgba(255, 107, 107, 0.2)',
                    border: `1px solid ${notification.type === 'success' ? 'rgba(184,227,233,0.4)' : 'rgba(255, 107, 107, 0.4)'}`,
                    borderRadius: 12,
                    padding: '1.25rem 1.75rem',
                    color: notification.type === 'success' ? '#B8E3E9' : '#ff6b6b',
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
        </div>
    );
};

export default AdminStudentManagement;
