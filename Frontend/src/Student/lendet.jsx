import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStudentYearData } from '../services/studentApi';

const Lendet = () => {
  const { yearId } = useParams();
  const navigate = useNavigate();

  const student = JSON.parse(localStorage.getItem('student') || '{}');
  const STUDENT_ID = student.id;

  useEffect(() => {
    if (!student.id) {
      navigate('/');
    }
  }, [navigate, student.id]);

  if (!student.id) {
    return null;
  }

  const electiveStorageKey = useMemo(() => `selectedElectives:${STUDENT_ID}:${yearId}`, [STUDENT_ID, yearId]);
  const [isMobile, setIsMobile] = useState(false);
  const [showElectivePicker, setShowElectivePicker] = useState(false);
  const [selectedElectives, setSelectedElectives] = useState([]);
  const [activeModal, setActiveModal] = useState({ open: false, subject: null });
  const [yearData, setYearData] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: null });

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
        const data = await getStudentYearData(STUDENT_ID, yearId);
        if (!isMounted) return;
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
  }, [STUDENT_ID, yearId, electiveStorageKey]);

  // Save to localStorage whenever selectedElectives change
  useEffect(() => {
    localStorage.setItem(electiveStorageKey, JSON.stringify(selectedElectives));
  }, [electiveStorageKey, selectedElectives]);

  const studentName = yearData?.student?.fullName ?? 'Student';
  const avatarLetter = yearData?.student?.emri?.[0]?.toUpperCase() ?? 'S';

  const pageStyle = {
    color: '#fff',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, rgba(10,18,12,1) 0%, rgba(14,28,20,1) 50%, rgba(12,30,18,1) 100%)',
    fontFamily: 'Inter, system-ui, Arial, sans-serif'
  };

  const topBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? '0.85rem 1.5rem' : '1rem 2.5rem'
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
    gap: isMobile ? 10 : 18
  };

  const bannerStyle = {
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: '0.85rem 1rem',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: 600,
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

  const avatarStyle = {
    width: 42,
    height: 42,
    borderRadius: 21,
    background: '#0e6b3d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
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
    border: '1px solid rgba(23, 199, 122, 0.5)',
    color: '#17c77a',
    background: 'transparent',
    padding: '0.4rem 0.9rem',
    borderRadius: 999,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6
  };

  const semesterGrid = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '1rem' : '1.5rem',
    marginTop: 24
  };

  const semesterCard = {
    background: 'rgba(13, 30, 19, 0.85)',
    border: '1px solid rgba(23, 199, 122, 0.35)',
    borderRadius: 18,
    padding: isMobile ? '1rem' : '1.25rem',
    position: 'relative',
    boxShadow: '0 20px 40px rgba(0,0,0,0.45)'
  };

  const semesterTitle = {
    color: '#1fdc8c',
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
    border: '1px dashed rgba(255,255,255,0.25)',
    borderRadius: 12,
    padding: '1rem',
    color: '#c4f0da',
    fontStyle: 'italic'
  };

  const subjectItem = {
    background: 'rgba(9,18,12,0.85)',
    borderRadius: 12,
    padding: '0.9rem 1rem',
    border: '1px solid rgba(255,255,255,0.05)',
    textAlign: 'center',
    fontWeight: 600,
    fontSize: 15,
    color: '#e1f8ed'
  };

  const electiveButton = {
    border: '1px solid rgba(23, 199, 122, 0.5)',
    color: '#17c77a',
    background: 'rgba(9,18,12,0.9)',
    padding: '0.35rem 1rem',
    borderRadius: 999,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
    position: isMobile ? 'static' : 'absolute',
    right: isMobile ? 'auto' : 24,
    top: isMobile ? 'auto' : 24
  };

  const electivePanel = {
    position: 'absolute',
    zIndex: 5,
    top: '110%',
    left: 0,
    background: 'rgba(5,10,7,0.95)',
    borderRadius: 14,
    padding: '0.85rem',
    border: '1px solid rgba(255,255,255,0.12)',
    width: 240,
    boxShadow: '0 16px 38px rgba(0,0,0,0.55)'
  };

  const electiveTriggerRow = {
    position: 'relative',
    display: 'inline-block',
    marginTop: 18
  };

  const smallHint = {
    fontSize: 12,
    color: '#9bf3c8',
    marginTop: 6
  };

  const electiveItem = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontWeight: 600,
    marginBottom: 10
  };

  const selectedContainer = {
    marginTop: 32,
    background: 'rgba(5, 12, 8, 0.92)',
    borderRadius: 20,
    padding: isMobile ? '1rem' : '1.5rem',
    border: '1px solid rgba(23, 199, 122, 0.35)',
    boxShadow: '0 18px 36px rgba(0,0,0,0.4)'
  };

  const selectedList = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12
  };

  const selectedPill = {
    padding: '0.45rem 0.9rem',
    borderRadius: 999,
    background: 'rgba(23,199,122,0.12)',
    border: '1px solid rgba(23,199,122,0.35)',
    fontWeight: 600,
    fontSize: 14
  };

  const modalOverlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999
  };

  const modalCardStyle = {
    width: isMobile ? '90%' : 420,
    background: 'rgba(7,16,11,0.95)',
    borderRadius: 20,
    border: '1px solid rgba(23,199,122,0.4)',
    padding: '1.5rem',
    boxShadow: '0 25px 60px rgba(0,0,0,0.55)'
  };

  const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  };

  const closeButtonStyle = {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    cursor: 'pointer'
  };

  const optionGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 12
  };

  const modalOptionStyle = {
    borderRadius: 12,
    border: '1px solid rgba(23,199,122,0.35)',
    background: 'rgba(9,18,12,0.85)',
    color: '#e1f8ed',
    fontWeight: 600,
    padding: '0.9rem 0',
    cursor: 'pointer'
  };

  const handleElectiveToggle = useCallback((course) => {
    setSelectedElectives((prev) => {
      const exists = prev.some((item) => item.id === course.id);
      return exists ? prev.filter((item) => item.id !== course.id) : [...prev, course];
    });
    // Mbyll popover-in pasi u zgjodh/hoq një lëndë zgjedhore
    setShowElectivePicker(false);
  }, []);

  const openSubjectModal = useCallback((subject) => {
    setActiveModal({ open: true, subject });
  }, []);

  const closeSubjectModal = useCallback(() => {
    setActiveModal({ open: false, subject: null });
  }, []);

  const handleModalChoice = useCallback((choice) => {
    if (choice === 'idea') {
      navigate('/student/ide', {
        state: {
          subject: activeModal.subject?.name,
          lendaId: activeModal.subject?.id,
          yearId,
        },
      });
      setActiveModal({ open: false, subject: null });
    } else if (choice === 'project') {
      navigate('/student/dorzimiProjektit', {
        state: {
          subject: activeModal.subject?.name,
          lendaId: activeModal.subject?.id,
          yearId,
        },
      });
      setActiveModal({ open: false, subject: null });
    } else {
      // Placeholder for deadlines route
      setActiveModal({ open: false, subject: null });
    }
  }, [activeModal.subject, navigate, yearId]);

  const handleBack = useCallback(() => navigate('/student'), [navigate]);

  const renderStateBanner = () => {
    if (status.loading) {
      return (
        <div style={{ ...bannerStyle, background: 'rgba(23,199,122,0.15)', borderColor: 'rgba(23,199,122,0.45)' }}>
          Po ngarkohen të dhënat...
        </div>
      );
    }

    if (status.error) {
      return (
        <div style={{ ...bannerStyle, background: 'rgba(255,82,82,0.1)', borderColor: 'rgba(255,82,82,0.4)' }}>
          {status.error}
        </div>
      );
    }

    if (!yearData) {
      return (
        <div style={{ ...bannerStyle, background: 'rgba(255,255,255,0.05)' }}>
          Nuk ekzistojnë të dhëna për këtë vit.
        </div>
      );
    }

    return null;
  };

  return (
    <div style={pageStyle}>
      <div style={topBarStyle}>
        <div style={brandStyle}>Feedelate</div>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, letterSpacing: 0.6 }}>Universiteti Publik Kadri Zeka</div>
        <div style={actionsStyle}>
          <div style={bellStyle} aria-label="notifications" role="img">🔔</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
            <div style={avatarStyle}>{avatarLetter}</div>
            <span>{studentName}</span>
          </div>
        </div>
      </div>

      <div style={layoutStyle}>
        <div style={headerRow}>
          <h1 style={{ margin: 0 }}>{yearData?.year?.title ?? 'Viti Akademik'}</h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button style={backButton} onClick={handleBack}>
              &#8592; Back to Dashboard
            </button>
          </div>
        </div>

        {yearData?.electives?.length > 0 && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <div style={{ ...electiveTriggerRow }}>
              <button
                style={{ ...electiveButton, position: 'static' }}
                onClick={() => setShowElectivePicker((prev) => !prev)}
                aria-expanded={showElectivePicker}
              >
                {showElectivePicker ? 'Mbyll zgjedhjet zgjedhore' : 'Lëndët zgjedhore'}
              </button>
              {showElectivePicker && (
                <div style={electivePanel}>
                  {yearData.electives.map((elective) => {
                    const picked = selectedElectives.some((item) => item.id === elective.id);
                    return (
                      <div
                        key={elective.id}
                        style={{
                          ...subjectItem,
                          marginBottom: 8,
                          border: picked ? '1px solid rgba(23,199,122,0.7)' : '1px solid rgba(23,199,122,0.25)',
                          color: picked ? '#1fdc8c' : '#c5f5df',
                          cursor: 'pointer'
                        }}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleElectiveToggle(elective)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleElectiveToggle(elective);
                          }
                        }}
                      >
                        {elective.name}
                        {picked && <span style={{ display: 'block', fontSize: 12, marginTop: 4, color: '#9bf3c8' }}>E zgjedhur</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {renderStateBanner()}

        {yearData && semestersToRender.length > 0 && (
          <div style={semesterGrid}>
            {semestersToRender.map((semester) => (
              <div key={semester.id ?? semester.name} style={semesterCard}>
                <div style={semesterTitle}>{semester.name}</div>
                <div style={subjectGrid}>
                  {semester.subjects.filter((s) => !s.isElective).length === 0 && (
                    <div style={emptySubjectsStyle}>Ende nuk ka lëndë për këtë semestër.</div>
                  )}
                  {semester.subjects.filter((s) => !s.isElective).map((subject) => {
                    const isSelected = selectedElectives.some((item) => item.id === subject.id);
                    return (
                      <div
                        key={`${semester.id}-${subject.id}`}
                        style={{
                          ...subjectItem,
                          border: isSelected ? '1px solid rgba(23,199,122,0.65)' : subjectItem.border,
                          color: isSelected ? '#1fdc8c' : subjectItem.color,
                          cursor: 'pointer'
                        }}
                        role="button"
                        tabIndex={0}
                        onClick={() => openSubjectModal(subject)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openSubjectModal(subject);
                          }
                        }}
                      >
                        {subject.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedElectives.length > 0 && (
          <div style={selectedContainer}>
            <div style={subjectGrid}>
              {selectedElectives.map((course) => (
                <div
                  key={course.id}
                  style={{
                    ...subjectItem,
                    border: '1px solid rgba(23,199,122,0.65)',
                    color: '#1fdc8c',
                    cursor: 'pointer'
                  }}
                  role="button"
                  tabIndex={0}
                  onClick={() => openSubjectModal({ ...course, isElective: true })}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openSubjectModal({ ...course, isElective: true });
                    }
                  }}
                >
                  {course.name}
                  <span style={{ fontSize: 12, display: 'block', marginTop: 4, color: '#9bf3c8' }}>Zgjedhore</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {activeModal.open && (
        <div style={modalOverlayStyle}>
          <div style={modalCardStyle}>
            <header style={modalHeaderStyle}>
              <div>
                <p style={{ margin: 0, color: '#8bf0c1', fontSize: 12 }}>Lënda</p>
                <h3 style={{ margin: 0 }}>{activeModal.subject?.name}</h3>
              </div>
              <button style={closeButtonStyle} onClick={closeSubjectModal} aria-label="Mbyll">
                ✕
              </button>
            </header>
            <p style={{ opacity: 0.8, fontSize: 14 }}>Zgjidh veprimin që dëshiron të ndjekësh.</p>
            <div style={optionGridStyle}>
              <button style={modalOptionStyle} onClick={() => handleModalChoice('idea')}>
                Ideja
              </button>
              <button style={modalOptionStyle} onClick={() => handleModalChoice('project')}>
                Projekti
              </button>
              <button style={modalOptionStyle} onClick={() => handleModalChoice('deadline')}>
                Afatet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lendet;
