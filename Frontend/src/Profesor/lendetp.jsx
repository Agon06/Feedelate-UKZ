import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProfesorYearData, uploadLendaTemplate, getLendaTemplateInfo, deleteLendaTemplate } from '../services/profesorApi';
import '../Student/StudentTheme.css';

const Lendetp = () => { 
  const { yearId } = useParams();
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem('student') || '{}');
  const PROFESOR_ID = student.id || 1;
  const electiveStorageKey = useMemo(() => `selectedElectives:${PROFESOR_ID}:${yearId}`, [PROFESOR_ID, yearId]);
  const [isMobile, setIsMobile] = useState(false);
  const [showElectivePicker, setShowElectivePicker] = useState(false);
  const [selectedElectives, setSelectedElectives] = useState([]);
  const [activeModal, setActiveModal] = useState({ open: false, subject: null });
  const [yearData, setYearData] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: null });
  const [templateInfo, setTemplateInfo] = useState({ hasTemplate: false, fileName: '' });
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, message: '', onConfirm: null });

  const baseSemesters = useMemo(() => {
    const parsed = Number(yearId);
    if (Number.isNaN(parsed) || parsed < 1) {
      return [];
    }
    return [parsed * 2 - 1, parsed * 2];
  }, [yearId]);

  const semestersToRender = useMemo(() => {
    const actualSemesters = yearData?.semesters ?? [];
    if (!baseSemesters.length) {
      return actualSemesters;
    }

    const fallback = baseSemesters.map((semNumber) => {
      const existing = actualSemesters.find((semester) => semester.id === semNumber);
      return existing ?? {
        id: semNumber,
        name: `Semestri ${semNumber}`,
        subjects: [],
      };
    });

    const extras = actualSemesters.filter((semester) => !baseSemesters.includes(semester.id));
    return [...fallback, ...extras];
  }, [baseSemesters, yearData]);

  const electiveAnchorSemesterId = useMemo(() => {
    if (yearData?.semesters?.length) {
      return yearData.semesters[yearData.semesters.length - 1].id;
    }
    return baseSemesters[baseSemesters.length - 1];
  }, [baseSemesters, yearData]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setStatus({ loading: true, error: null });

    const fetchYearData = async () => {
      try {
        console.log('Fetching data for year:', yearId);
        
        const data = await getProfesorYearData(PROFESOR_ID, yearId);
        if (!isMounted) return;
        
        // Debug: Log response
        console.log('API Response:', data);
        setDebugInfo({
          success: true,
          profesorId: PROFESOR_ID,
          yearId: yearId,
          semesterCount: data?.semesters?.length || 0,
          subjectCount: data?.semesters?.reduce((sum, s) => sum + (s.subjects?.length || 0), 0) || 0,
          rawData: data
        });
        
        setYearData(data);
        const stored = localStorage.getItem(electiveStorageKey);
        let initialElectives = Array.isArray(data?.selectedElectives) ? data.selectedElectives : [];
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              initialElectives = parsed;
            }
          } catch (e) {
            console.warn('Could not parse stored electives', e);
          }
        }
        setSelectedElectives(initialElectives);
        setStatus({ loading: false, error: null });
      } catch (error) {
        if (!isMounted) return;
        console.error('API Error:', error);
        setDebugInfo({
          success: false,
          profesorId: PROFESOR_ID,
          yearId: yearId,
          error: error?.message || error?.toString(),
          errorDetails: error
        });
        setStatus({
          loading: false,
          error: error?.message ?? 'Nuk u lexuan lendet per kete vit.',
        });
      }
    };

    fetchYearData();

    return () => {
      isMounted = false;
    };
  }, [PROFESOR_ID, yearId, electiveStorageKey]);

  // Save to localStorage whenever selectedElectives change
  useEffect(() => {
    localStorage.setItem(electiveStorageKey, JSON.stringify(selectedElectives));
  }, [electiveStorageKey, selectedElectives]);

  const profesorName = yearData?.profesor?.fullName ?? 'Profesor';
  const avatarLetter = yearData?.profesor?.emri?.[0]?.toUpperCase() ?? 'P';

  const pageStyle = {
    color: '#B8E3E9',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #0B2E33 100%, #0B2E33 0%)',
    fontFamily: 'Inter, system-ui, Arial, sans-serif'
  };

  const topBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? '0.85rem 1.5rem' : '1rem 2.5rem',
    background: 'linear-gradient(180deg,  #4F7C82 10%, #0B2E33 90%, #0B2E33 100%)'
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
    gap: isMobile ? 10 : 18
  };

  const bannerStyle = {
    border: '1px solid rgba(184,227,233,0.25)',
    borderRadius: 14,
    padding: '0.85rem 1rem',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: 600,
  };

  const avatarStyle = {
    width: 42,
    height: 42,
    borderRadius: 21,
    background: '#525252',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#f2f2f2',
    fontWeight: 700
  };

  const layoutStyle = {
    padding: isMobile ? '1rem' : '0 3.5rem 3rem'
  };

  const headerRow = {
    display: isMobile ? 'block' : 'flex',
    alignItems: isMobile ? 'flex-start' : 'center',
    justifyContent: 'space-between',
    marginTop: isMobile ? 12 : 24
  };

  const backButton = {
    border: '1px solid #0B2E33',
    color: '#0B2E33',
    background: '#FFFFFF ',
    padding: '0.4rem 0.9rem',
    borderRadius: 999,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 200ms ease'
  };

  const backButtonHover = {
    ...backButton,
    background: '#0F3A40',
    borderColor: '#0F3A40',
    boxShadow: '0 6px 16px rgba(11,46,51,0.35)'
  };

  const semesterGrid = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '1rem' : '1.5rem',
    marginTop: 24
  };

  const semesterCard = {
    background: 'rgba(11, 46, 51, 0.75)',
    border: '1px solid rgba(184,227,233,0.25)',
    borderRadius: 18,
    padding: isMobile ? '1rem' : '1.25rem',
    position: 'relative',
    boxShadow: '0 20px 40px rgba(0,0,0,0.45)'
  };

  const semesterTitle = {
    color: '#B8E3E9',
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 16
  };

  const subjectGrid = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
    gap: 12
  };

  const emptySubjectsStyle = {
    gridColumn: '1 / -1',
    textAlign: 'center',
    border: '1px dashed rgba(184,227,233,0.35)',
    borderRadius: 12,
    padding: '1rem',
    color: '#B8E3E9',
    fontStyle: 'italic'
  };

  const subjectItem = {
    background: '#0B2E33',
    borderRadius: 12,
    padding: '0.9rem 1rem',
    border: '1px solid rgba(184,227,233,0.2)',
    textAlign: 'center',
    fontWeight: 600,
    fontSize: 15,
    color: '#B8E3E9',
    transition: 'all 200ms ease',
    cursor: 'pointer'
  };

  const subjectItemHover = {
    ...subjectItem,
    background: 'rgba(184, 227, 233, 0.12)',
    border: '1px solid rgba(184, 227, 233, 0.6)',
    boxShadow: '0 10px 25px rgba(184, 227, 233, 0.2)',
    transform: 'translateY(-2px)'
  };

  const handleSubjectHover = (e, isHovering) => {
    if (isHovering) {
      e.currentTarget.style.background = subjectItemHover.background;
      e.currentTarget.style.border = subjectItemHover.border;
      e.currentTarget.style.boxShadow = subjectItemHover.boxShadow;
      e.currentTarget.style.transform = subjectItemHover.transform;
    } else {
      e.currentTarget.style.background = subjectItem.background;
      e.currentTarget.style.border = subjectItem.border;
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'translateY(0)';
    }
  };

  const primaryButtonStyle = {
    padding: '0.75rem',
    background: '#0B2E33',
    border: '1px solid rgba(184,227,233,0.4)',
    borderRadius: 12,
    color: '#B8E3E9',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 200ms ease'
  };

  const secondaryButtonStyle = {
    padding: '0.75rem',
    background: 'rgba(11,46,51,0.6)',
    border: '1px solid rgba(184,227,233,0.4)',
    borderRadius: 12,
    color: '#B8E3E9',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 200ms ease'
  };

  const closeButtonStyle = {
    padding: '0.75rem',
    background: 'rgba(11,46,51,0.6)',
    border: '1px solid rgba(184,227,233,0.4)',
    borderRadius: 12,
    color: '#B8E3E9',
    cursor: 'pointer',
    transition: 'all 200ms ease'
  };

  const handleButtonHover = (e, style, hoverStyle, isHovering) => {
    if (isHovering) {
      Object.assign(e.currentTarget.style, hoverStyle);
    } else {
      Object.assign(e.currentTarget.style, style);
    }
  };

  const handleSubjectClick = (subject) => {
    setActiveModal({ open: true, subject });
    loadTemplateInfo(subject.id);
  };

  const loadTemplateInfo = async (lendaId) => {
    try {
      const data = await getLendaTemplateInfo(PROFESOR_ID, lendaId);
      setTemplateInfo(data.hasTemplate ? { hasTemplate: true, fileName: data.fileName } : { hasTemplate: false, fileName: '' });
    } catch (error) {
      console.error('Error loading template info:', error);
      setTemplateInfo({ hasTemplate: false, fileName: '' });
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !activeModal.subject) return;

    try {
      setUploadingTemplate(true);
      await uploadLendaTemplate(PROFESOR_ID, activeModal.subject.id, file);
      await loadTemplateInfo(activeModal.subject.id);
      alert('Template u ngarkua me sukses!');
    } catch (error) {
      alert('Error: ' + (error.message || 'Ngarkimi dështoi'));
    } finally {
      setUploadingTemplate(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!activeModal.subject) return;
    
    setConfirmDialog({
      open: true,
      message: 'A jeni të sigurt që dëshironi të fshini template-in?',
      onConfirm: async () => {
        try {
          setUploadingTemplate(true);
          await deleteLendaTemplate(PROFESOR_ID, activeModal.subject.id);
          setTemplateInfo({ hasTemplate: false, fileName: '' });
          setConfirmDialog({ open: false, message: '', onConfirm: null });
        } catch (error) {
          alert('Error: ' + (error.message || 'Fshirja dështoi'));
          setConfirmDialog({ open: false, message: '', onConfirm: null });
        } finally {
          setUploadingTemplate(false);
        }
      }
    });
  };

  const handleCloseModal = () => {
    setActiveModal({ open: false, subject: null });
    setTemplateInfo({ hasTemplate: false, fileName: '' });
  };

  const handleNavigateToIdea = () => {
    if (!activeModal.subject) return;
    navigate('/profesor/idete', {
      state: {
        subject: activeModal.subject.name,
        lendaId: activeModal.subject.id,
      },
    });
  };

  const handleNavigateToDorezim = () => {
    if (!activeModal.subject) return;
    navigate('/profesor/dorezimet-studentesh', {
      state: {
        subject: activeModal.subject.name,
        lendaId: activeModal.subject.id,
      },
    });
  };

  return (
    <div className="student-theme" style={pageStyle}>
      <div style={topBarStyle}>
        <div style={brandStyle}>Feedelate</div>
        <div style={{ flex: 1 }} />
        <div style={actionsStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
            <div style={avatarStyle}>{avatarLetter}</div>
            <span>{profesorName}</span>
          </div>
        </div>
      </div>

      <div style={layoutStyle}>
        <div style={headerRow}>
          <button 
            style={backButton} 
            onClick={() => navigate('/profesor')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = backButtonHover.background;
              e.currentTarget.style.borderColor = backButtonHover.borderColor;
              e.currentTarget.style.boxShadow = backButtonHover.boxShadow; 
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = backButton.background;
              e.currentTarget.style.borderColor = 'rgba(184,227,233,0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ← Kthehu
          </button>
          <h2 style={{ margin: isMobile ? '12px 0 0' : 0, color: '#0B2E33' }}>
            {yearData?.year?.title ?? `Viti ${yearId}`}
          </h2>
        </div>

        {status.loading && <div style={{ marginTop: 32, textAlign: 'center' }}>Duke u ngarkuar...</div>}
        {status.error && (
          <>
            <div style={{ ...bannerStyle, background: 'rgba(255,82,82,0.2)', border: '1px solid rgba(255,82,82,0.5)' }}>
              {status.error}
            </div>
            <button
              onClick={() => setShowDebug(!showDebug)}
              style={{
                marginTop: 12,
                padding: '0.5rem 1rem',
                background: 'rgba(184,227,233,0.2)',
                border: '1px solid rgba(184,227,233,0.5)',
                borderRadius: 8,
                color: '#B8E3E9',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              {showDebug ? '🔽 Fshih Debug Info' : '🔍 Shfaq Debug Info'}
            </button>
            {showDebug && debugInfo && (
              <div style={{
                ...bannerStyle,
                background: 'rgba(184,227,233,0.12)',
                border: '1px solid rgba(184,227,233,0.35)',
                textAlign: 'left',
                fontSize: 12,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                marginTop: 8
              }}>
                <strong>Debug Information:</strong><br/>
                Profesor ID: {debugInfo.profesorId}<br/>
                Year ID: {debugInfo.yearId}<br/>
                Status: {debugInfo.success ? '✅ Success' : '❌ Failed'}<br/>
                {debugInfo.success ? (
                  <>
                    Semesters: {debugInfo.semesterCount}<br/>
                    Total Subjects: {debugInfo.subjectCount}<br/>
                    <br/>
                    <strong>Raw Response:</strong><br/>
                    {JSON.stringify(debugInfo.rawData, null, 2)}
                  </>
                ) : (
                  <>
                    Error: {debugInfo.error}<br/>
                    <br/>
                    <strong>Zgjidhjet e mundshme:</strong><br/>
                    1. Kontrollo që Backend është duke u ekzekutuar (http://localhost:5000)<br/>
                    2. Ekzekuto SQL: Backend/insert_test_lendet_for_profesor.sql<br/>
                    3. Verifikoni që profesorId=1 ekziston në 'profesoret' table<br/>
                    4. Verifikoni që ka lëndë me profesorId=1 në 'lendet' table
                  </>
                )}
              </div>
            )}
          </>
        )}

        {!status.loading && !status.error && (
          <>
            <div style={semesterGrid}>
              {semestersToRender.map((semester) => (
                <div key={semester.id} style={semesterCard}>
                  <div style={semesterTitle}>{semester.name}</div>
                  <div style={subjectGrid}>
                    {semester.subjects.length === 0 ? (
                      <div style={emptySubjectsStyle}>Nuk ka lëndë për këtë semestër</div>
                    ) : (
                      semester.subjects.map((subject) => (
                        <div
                          key={subject.id}
                          style={{ ...subjectItem, cursor: 'pointer' }}
                          onClick={() => handleSubjectClick(subject)}
                          onMouseEnter={(e) => handleSubjectHover(e, true)}
                          onMouseLeave={(e) => handleSubjectHover(e, false)}
                        >
                          {subject.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {activeModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: '#0B2E33',
              borderRadius: 20,
              border: '1px solid rgba(184,227,233,0.4)',
              padding: '2rem',
              maxWidth: 500,
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, color: '#B8E3E9', textAlign: 'center' }}>{activeModal.subject?.name}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
              <button
                style={{
                  ...primaryButtonStyle,
                  boxShadow: '0 4px 12px rgba(184, 227, 233, 0.15)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(184, 227, 233, 0.12)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(184, 227, 233, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = primaryButtonStyle.background;
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(184, 227, 233, 0.15)';
                }}
                onClick={handleNavigateToIdea}
              >
                Shko te Idetë
              </button>
              <button
                style={{
                  ...secondaryButtonStyle,
                  boxShadow: '0 4px 12px rgba(184, 227, 233, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(184, 227, 233, 0.12)';
                  e.currentTarget.style.borderColor = '#B8E3E9';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(184, 227, 233, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = secondaryButtonStyle.background;
                  e.currentTarget.style.borderColor = 'rgba(184,227,233,0.4)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(184, 227, 233, 0.1)';
                }}
                onClick={handleNavigateToDorezim}
              >
                Shko te Projektet
              </button>
              <button
                style={{
                  ...closeButtonStyle,
                  boxShadow: '0 4px 12px rgba(184, 227, 233, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(184, 227, 233, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(184, 227, 233, 0.5)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(184, 227, 233, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = closeButtonStyle.background;
                  e.currentTarget.style.borderColor = 'rgba(184, 227, 233, 0.4)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(184, 227, 233, 0.05)';
                }}
                onClick={handleCloseModal}
              >
                Mbyll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1500,
          padding: '1rem'
        }}>
          <div style={{
            background: 'rgba(11,46,51,0.95)',
            border: '1px solid rgba(184,227,233,0.35)',
            borderRadius: 20,
            padding: '2rem',
            maxWidth: '400px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#B8E3E9',
              marginBottom: '2rem',
              lineHeight: 1.5
            }}>
              {confirmDialog.message}
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                }}
                style={{
                  flex: 1,
                  padding: '0.9rem 1.8rem',
                  borderRadius: 12,
                  border: 'none',
                  background: '#4F7C82',
                  color: '#0B2E33',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  boxShadow: '0 4px 12px rgba(79, 124, 130, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#3f666b';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(79, 124, 130, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#4F7C82';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 124, 130, 0.3)';
                }}
              >
                ✓ Po
              </button>
              <button
                onClick={() => {
                  setConfirmDialog({ open: false, message: '', onConfirm: null });
                }}
                style={{
                  flex: 1,
                  padding: '0.9rem 1.8rem',
                  borderRadius: 12,
                  border: '1px solid rgba(184,227,233,0.3)',
                  background: 'transparent',
                  color: '#B8E3E9',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(184,227,233,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(184,227,233,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(184,227,233,0.3)';
                }}
              >
                ✕ Jo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lendetp;
