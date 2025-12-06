import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const curriculum = {
  '1': {
    title: 'Viti I',
    semesters: [
      {
        name: 'Semestri 1',
        subjects: ['Programim 1', 'Shkrim Akademik', 'Qarqe Digitale', 'Matematika 1', 'Anglisht 1', 'Arkitektura']
      },
      {
        name: 'Semestri 2',
        subjects: ['Anglisht 2', 'Rrjeta Kompjuterike', 'Programim 2', 'Algoritme', 'Bazat e te Dhenave', 'Logjike Matematike']
      }
    ],
    electives: ['Mikrokontrolleret', 'Analiza e kerkesave per web aplikacione', 'Senzoret dhe nderfaqet', 'Zhvillimet per internet']
  },
  '2': {
    title: 'Viti II',
    semesters: [
      {
        name: 'Semestri 3',
        subjects: ['Inxhinieri Softuerike', 'Siguria e te Dhenave', 'Sistemet Operative', 'Programim i Avancuar']
      },
      {
        name: 'Semestri 4',
        subjects: ['Projektim i Sistemeve', 'Inteligjence Artificiale', 'Menaxhim Projektesh', 'Rrjeta te Avancuara']
      }
    ],
    electives: ['Softuer i Integruar', 'Analize Biznesi', 'Robotike Baze']
  },
  '3': {
    title: 'Viti III',
    semesters: [
      {
        name: 'Semestri 5',
        subjects: ['Cloud Computing', 'Analize e Dhenave', 'Programim per Pajisje Mobile']
      },
      {
        name: 'Semestri 6',
        subjects: ['Praktike Profesionale', 'Projekt Diplome', 'Zhvillim i Shperndare']
      }
    ],
    electives: ['Shkenca e te Dhenave', 'DevOps', 'Realitet Virtual']
  }
};

const Lendet = () => {
  const { yearId } = useParams();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [showElectives, setShowElectives] = useState(false);
  const [selectedElectives, setSelectedElectives] = useState([]);
  const [activeModal, setActiveModal] = useState({ open: false, subject: null });

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const yearData = useMemo(() => curriculum[yearId], [yearId]);

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
    position: isMobile ? 'static' : 'absolute',
    right: isMobile ? 0 : 24,
    top: isMobile ? 'auto' : 60,
    marginTop: isMobile ? 16 : 0,
    background: 'rgba(5,10,7,0.95)',
    borderRadius: 18,
    padding: '1rem',
    border: '1px solid rgba(255,255,255,0.08)',
    width: isMobile ? '100%' : 260,
    boxShadow: '0 14px 35px rgba(0,0,0,0.55)'
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
    setSelectedElectives((prev) =>
      prev.includes(course)
        ? prev.filter((item) => item !== course)
        : [...prev, course]
    );
  }, []);

  const openSubjectModal = useCallback((subject) => {
    setActiveModal({ open: true, subject });
  }, []);

  const closeSubjectModal = useCallback(() => {
    setActiveModal({ open: false, subject: null });
  }, []);

  const handleModalChoice = useCallback((choice) => {
    if (choice === 'idea') {
      navigate('/student/ide', { state: { subject: activeModal.subject, yearId } });
      setActiveModal({ open: false, subject: null });
    } else {
      // Placeholder for future routes (projects/deadlines)
      setActiveModal({ open: false, subject: null });
    }
  }, [activeModal.subject, navigate, yearId]);

  const handleBack = useCallback(() => navigate('/student'), [navigate]);

  if (!yearData) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 22, marginBottom: 16 }}>Nuk ekzistojne te dhena per kete vit.</p>
          <button style={backButton} onClick={handleBack}>
            &#8592; Kthehu te paneli
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={topBarStyle}>
        <div style={brandStyle}>Feedelate</div>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, letterSpacing: 0.6 }}>Universiteti Publik Kadri Zeka</div>
        <div style={actionsStyle}>
          <div style={bellStyle} aria-label="notifications" role="img">🔔</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
            <div style={avatarStyle}>S</div>
            <span>Student</span>
          </div>
        </div>
      </div>

      <div style={layoutStyle}>
        <div style={headerRow}>
          <h1 style={{ margin: 0 }}>{yearData.title}</h1>
          <button style={backButton} onClick={handleBack}>
            &#8592; Back to Dashboard
          </button>
        </div>

        <div style={semesterGrid}>
          {yearData.semesters.map((semester, index) => {
            const extendedSubjects = index === 1
              ? [...semester.subjects, ...selectedElectives]
              : semester.subjects;

            return (
              <div key={semester.name} style={semesterCard}>
                <div style={semesterTitle}>{semester.name}</div>
                <div style={subjectGrid}>
                  {extendedSubjects.map((subject) => {
                    const isElective = index === 1 && selectedElectives.includes(subject);
                    return (
                      <div
                        key={`${semester.name}-${subject}`}
                        style={{
                          ...subjectItem,
                          border: isElective ? '1px solid rgba(23,199,122,0.65)' : subjectItem.border,
                          color: isElective ? '#1fdc8c' : subjectItem.color,
                          opacity: isElective ? 1 : 0.92,
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
                        {subject}
                        {isElective && <span style={{ fontSize: 12, display: 'block', marginTop: 4, color: '#9bf3c8' }}>Lendë zgjedhore</span>}
                      </div>
                    );
                  })}
                </div>

                {index === 1 && yearData.electives?.length > 0 && (
                  <>
                    <button
                      style={electiveButton}
                      onClick={() => setShowElectives((prev) => !prev)}
                      aria-expanded={showElectives}
                    >
                      {showElectives ? '−' : '+'} Lendet zgjedhore
                    </button>
                    {showElectives && (
                      <div style={electivePanel}>
                        {yearData.electives.map((elective) => (
                          <label key={elective} style={electiveItem}>
                            <input
                              type="checkbox"
                              style={{ accentColor: '#18c776' }}
                              checked={selectedElectives.includes(elective)}
                              onChange={() => handleElectiveToggle(elective)}
                            />
                            {elective}
                          </label>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {selectedElectives.length > 0 && (
          <div style={selectedContainer}>
            <div style={{ fontWeight: 700, color: '#1fdc8c' }}>Lendet e zgjedhura</div>
            <div style={selectedList}>
              {selectedElectives.map((course) => (
                <span key={course} style={selectedPill}>{course}</span>
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
                <h3 style={{ margin: 0 }}>{activeModal.subject}</h3>
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
