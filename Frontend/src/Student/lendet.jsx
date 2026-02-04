import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStudentYearData, getStudentById } from '../services/studentApi';
import './StudentTheme.css';

const Lendet = () => {
  // thisYear: format MM/YYYY
  const now = new Date();
  const thisYear = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;


  // Merr student nga localStorage, ose nga API nëse academicYear mungon
  const [student, setStudent] = useState(() => JSON.parse(localStorage.getItem('student') || '{}'));
  const [loadingStudent, setLoadingStudent] = useState(false);

  useEffect(() => {
    if (student.id && !student.academicYear && !loadingStudent) {
      setLoadingStudent(true);
      getStudentById(student.id)
        .then((freshStudent) => {
          if (freshStudent && freshStudent.academicYear) {
            localStorage.setItem('student', JSON.stringify(freshStudent));
            setStudent(freshStudent);
          }
        })
        .finally(() => setLoadingStudent(false));
    }
  }, [student, loadingStudent]);

  const academicYear = student.academicYear || '';

  // Calculate vitiStudimeve
  let vitiStudimeve = 0;
  if (academicYear) {
    // academicYear format: '2025/2026'
    const [startYearStr, endYearStr] = academicYear.split('/');
    const startYear = parseInt(startYearStr, 10);
    const endYear = parseInt(endYearStr, 10);
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // Periudha: tetor (10) i startYear deri shtator (9) i endYear
    let inCurrentAcademicYear = false;
    if (
      (currentYear === startYear && currentMonth >= 10) ||
      (currentYear === endYear && currentMonth <= 9)
    ) {
      inCurrentAcademicYear = true;
    }

    if (inCurrentAcademicYear) {
      vitiStudimeve = 1;
    } else if (
      (currentYear === startYear + 1 && currentMonth >= 10) ||
      (currentYear === endYear + 1 && currentMonth <= 9) ||
      (currentYear === endYear && currentMonth > 9)
    ) {
      vitiStudimeve = 2;
    } else {
      vitiStudimeve = 3;
    }
  }
  const { yearId } = useParams();
  const navigate = useNavigate();

  const STUDENT_ID = student.id;

  // Move all hooks before any conditional returns
  const electiveStorageKey = useMemo(() => `selectedElectives:${STUDENT_ID}:${yearId}`, [STUDENT_ID, yearId]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showElectivePicker, setShowElectivePicker] = useState(false);
  const [selectedElectives, setSelectedElectives] = useState([]);
  const [activeModal, setActiveModal] = useState({ open: false, subject: null });
  const [yearData, setYearData] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    if (!student.id && !loadingStudent) {
      navigate('/');
    }
  }, [navigate, student.id, loadingStudent]);

  // Early return after all hooks are defined
  if (!student.id || loadingStudent) {
    return null;
  }

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
    color: '#B8E3E9',
    minHeight: '100vh',
    background: 'linear-gradient(180deg,  #4F7C82 0%, #0B2E33 60%, #0B2E33 100%)',
    fontFamily: 'Inter, system-ui, Arial, sans-serif'
  };

  const topBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? '0.85rem 1.5rem' : '1rem 2.5rem',
    position: 'relative',
    background: 'linear-gradient(180deg,  #4F7C82 10%, #0B2E33 90%, #0B2E33 100%)',
  };

  const brandStyle = {
    color: 'var(--st-1)',
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
    background: 'rgba(122, 158, 159, 0.25)',
    border: '1px solid var(--st-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    color: 'var(--st-1)'
  };

  const avatarStyle = {
    width: 42,
    height: 42,
    borderRadius: 21,
    background: 'var(--st-2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--st-text-dark)',
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
    border: '1px solid var(--st-border)',
    color: 'var(--st-1)',
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
    background: '#0B2E33',
    border: '1px solid rgba(184,227,233,0.2)',
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
    border: '1px dashed rgba(184,227,233,0.25)',
    borderRadius: 12,
    padding: '1rem',
    color: '#B8E3E9',
    fontStyle: 'italic'
  };

  const subjectItem = {
    background: '#0B2E33',
    borderRadius: 12,
    padding: '0.9rem 1rem',
    border: '1px solid rgba(184,227,233,0.12)',
    textAlign: 'center',
    fontWeight: 600,
    fontSize: 15,
    color: '#B8E3E9'
  };

  const electiveButton = {
    border: '1px solid rgba(184,227,233,0.25)',
    color: '#B8E3E9',
    background: '#0B2E33',
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
    background: '#0B2E33',
    borderRadius: 14,
    padding: '0.85rem',
    border: '1px solid rgba(184,227,233,0.2)',
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
    color: '#B8E3E9',
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
    background: '#0B2E33',
    borderRadius: 20,
    padding: isMobile ? '1rem' : '1.5rem',
    border: '1px solid rgba(184,227,233,0.2)',
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
    background: 'rgba(79,124,130,0.35)',
    border: '1px solid rgba(184,227,233,0.2)',
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
    background: '#0B2E33',
    borderRadius: 20,
    border: '1px solid rgba(184,227,233,0.2)',
    padding: '1.5rem',
    boxShadow: '0 25px 60px rgba(0,0,0,0.55)'
  };

  const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative'
  };

  const closeButtonStyle = {
    position: 'absolute',
    right: -18,
    top: -18, 
    background: 'transparent',
    border: '1px solid rgba(184,227,233,0.25)',
    color: '#B8E3E9',
    width: 36,
    height: 36,
    borderRadius: 18,
    cursor: 'pointer'
  };

  const optionGridStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: 12
  };

  const modalOptionStyle = {
    borderRadius: 12,
    border: '2px solid rgba(184,227,233,0.25)',
    background: 'linear-gradient(135deg, rgba(79,124,130,0.35) 0%, rgba(11,46,51,0.2) 100%)',
    color: '#B8E3E9',
    fontWeight: 700,
    padding: '1.2rem 2.5rem',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    minWidth: '150px',
    textAlign: 'center'
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
        <div style={{ ...bannerStyle, background: 'rgba(79,124,130,0.35)', borderColor: 'rgba(184,227,233,0.25)' }}>
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
    <div style={pageStyle} className="student-theme">
      {/* TEST: Shfaq vitiStudimeve */}
     
      <div style={topBarStyle}>
        <div style={brandStyle}>Feedelate</div>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', fontWeight: 900, letterSpacing: 0.6, fontSize: 25 }}>Universiteti Publik Kadri Zeka</div>
        <div style={actionsStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
            <div style={avatarStyle}>{avatarLetter}</div>
            <span>{studentName}</span>
          </div>
        </div>
      </div>
 <div style={{ background: '#0B2E33', color: '#B8E3E9', padding: '0.5rem 1rem', borderRadius: 8, margin: '1rem auto', maxWidth: 320, textAlign: 'center', fontWeight: 700 }}>
        Viti i studimeve : {vitiStudimeve}
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
                          border: picked ? '1px solid rgba(184,227,233,0.6)' : '1px solid rgba(184,227,233,0.25)',
                          color: '#B8E3E9',
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
                        {picked && <span style={{ display: 'block', fontSize: 12, marginTop: 4, color: '#B8E3E9' }}>E zgjedhur</span>}
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
            {semestersToRender.map((semester, idx) => {
              // idx: 0 = first year, 1 = second year, 2 = third year, etc.
              // vitiStudimeve: 1, 2, 3
              // Allowed: vitiStudimeve >= idx+1
              // const canInteract = vitiStudimeve >= idx + 1;
              const semesterYear = Math.ceil((semester.id || 1) / 2);
              const canInteract = vitiStudimeve >= semesterYear;
              return (
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
                            border: isSelected ? '1px solid rgba(184,227,233,0.6)' : subjectItem.border,
                            color: isSelected ? '#B8E3E9' : subjectItem.color,
                            cursor: canInteract ? 'pointer' : 'not-allowed',
                            opacity: canInteract ? 1 : 0.6
                          }}
                          role="button"
                          tabIndex={canInteract ? 0 : -1}
                          onClick={canInteract ? () => openSubjectModal(subject) : undefined}
                          onKeyDown={canInteract ? (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              openSubjectModal(subject);
                            }
                          } : undefined}
                          aria-disabled={!canInteract}
                        >
                          {subject.name}
                          {!canInteract && (
                            <span style={{ display: 'block', fontSize: 12, marginTop: 4, color: '#fbd38d' }}>
                              Vetëm shikim
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
                    border: '1px solid rgba(184,227,233,0.6)',
                    color: '#B8E3E9',
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
                  <span style={{ fontSize: 12, display: 'block', marginTop: 4, color: '#B8E3E9' }}>Zgjedhore</span>
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
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#B8E3E9', fontSize: 12 }}>Lënda</p>
                <h3 style={{ margin: 0 }}>{activeModal.subject?.name}</h3>
              </div>
              <button style={closeButtonStyle} onClick={closeSubjectModal} aria-label="Mbyll">
                ✕
              </button>
            </header>
            <div style={optionGridStyle}>
              <button style={modalOptionStyle} onClick={() => handleModalChoice('idea')}>
                Ideja
              </button>
              <button style={modalOptionStyle} onClick={() => handleModalChoice('project')}>
                Projekti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lendet;
