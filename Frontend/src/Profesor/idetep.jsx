import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProfesorIdeas } from '../services/profesorApi';
import './idetep.css';

const Idetep = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const subjectName = location.state?.subject ?? 'Lëndë e pa specifikuar';
  const lendaId = location.state?.lendaId ?? null;
  const PROFESOR_ID = 1;

  const [ideas, setIdeas] = useState([]);
  const [listStatus, setListStatus] = useState({ loading: true, error: null });
  const [searchTerm, setSearchTerm] = useState('');
  // Forma per shtimin e ideve hiqet per profesorin; s'na duhen state-t

  const loadIdeas = useCallback(async () => {
    setListStatus({ loading: true, error: null });
    try {
      const response = await getProfesorIdeas(PROFESOR_ID, lendaId);
      setIdeas(response);
      setListStatus({ loading: false, error: null });
    } catch (error) {
      setListStatus({
        loading: false,
        error: error?.message ?? 'Nuk u lexuan idetë aktuale.',
      });
    }
  }, [PROFESOR_ID, lendaId]);

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  // Nuk ka dorëzim/shtim idesh për profesorin

  const handleFeedback = () => {
    //nese ka feedback
    const feedBackId = 1; //kete do e marim nga backendi ne te ardhmen
    if (feedBackId === 1) {
    navigate('/profesor/feedback', {
      state: {
        lendaId: lendaId,
        subject: subjectName
      }
    });
  }
    else {
      alert('Nuk ka ende feedback të lidhur me këtë ide.');
    }
  };


  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, rgba(10,18,12,1) 0%, rgba(14,28,20,1) 60%, rgba(10,18,12,1) 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, system-ui, sans-serif',
    padding: '2rem',
    overflow: 'hidden'
  };

  const modalStyle = {
    width: 'min(900px, 100%)',
    background: 'rgba(6,13,9,0.95)',
    borderRadius: 28,
    border: '1px solid rgba(23,199,122,0.4)',
    boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
    padding: '2rem',
    position: 'relative'
  };

  const closeButtonStyle = {
    position: 'absolute',
    right: 24,
    top: 20,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 38,
    height: 38,
    color: '#fff',
    cursor: 'pointer'
  };

  const columnsStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem',
    marginTop: '1rem'
  };

  const columnCard = {
    background: 'rgba(9,18,12,0.9)',
    borderRadius: 20,
    border: '1px solid rgba(23,199,122,0.25)',
    padding: '1.25rem',
    minHeight: 360
  };

  const searchInput = {
    width: '100%',
    padding: '0.75rem 0.9rem',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(4,10,6,0.6)',
    color: '#fff',
    marginBottom: '1rem'
  };

  const ideaList = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    maxHeight: '220px',
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingRight: '0.5rem'
  };

  const ideaItem = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0.9rem',
    borderRadius: 14,
    background: 'rgba(5,12,8,0.8)',
    border: '1px solid rgba(255,255,255,0.05)'
  };

  const tinyButton = {
    borderRadius: 10,
    border: '1px solid rgba(23,199,122,0.35)',
    background: 'transparent',
    color: '#c8f5e8',
    fontSize: 12,
    padding: '0.35rem 0.6rem',
    cursor: 'pointer',
    marginLeft: 8
  };

  const tagStyle = {
    fontSize: 12,
    borderRadius: 999,
    padding: '0.25rem 0.7rem',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#d0f5e5'
  };

  const formField = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: '1rem'
  };

  const inputStyle = {
    width: '100%',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.12)',
    padding: '0.7rem 0.9rem',
    background: 'rgba(4,10,6,0.6)',
    color: '#fff'
  };

  const footerStyle = {
    marginTop: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between'
  };

  const primaryButton = {
    borderRadius: 12,
    border: 'none',
    background: '#19c776',
    color: '#041407',
    fontWeight: 700,
    padding: '0.8rem 1.6rem',
    cursor: 'pointer'
  };

  const secondaryButton = {
    borderRadius: 12,
    border: '1px solid rgba(23,199,122,0.35)',
    background: 'transparent',
    color: '#c8f5e8',
    fontWeight: 600,
    padding: '0.8rem 1.6rem',
    cursor: 'pointer'
  };

  const bannerStyle = {
    borderRadius: 12,
    padding: '0.75rem 1rem',
    marginTop: '0.5rem',
    textAlign: 'center',
    fontSize: 13,
  };

  return (
    <div style={pageStyle}>
      <div style={modalStyle}>
        <button style={closeButtonStyle} onClick={() => navigate(-1)} aria-label="Mbyll">✕</button>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ marginTop: 0, marginBottom: '0.35rem' }}>Ide për {subjectName}</h2>
          <p style={{ margin: 0, opacity: 0.8 }}>Këtu mund të dorëzosh ide ose të shikosh ato ekzistuese.</p>
        </div>

        <div style={columnsStyle}>
          <div style={columnCard}>
            <input 
              type="text" 
              placeholder="Kërko idenë..." 
              style={searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div style={ideaList} className="idea-list-scroll">
              {listStatus.loading && (
                <div style={{ textAlign: 'center', opacity: 0.8 }}>Duke u ngarkuar...</div>
              )}
              {listStatus.error && (
                <div style={{ textAlign: 'center', color: '#f8b4b4' }}>{listStatus.error}</div>
              )}
              {!listStatus.loading && !listStatus.error && ideas.filter(idea => 
                idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                idea.shorthand.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                <div style={{ textAlign: 'center', opacity: 0.8 }}>
                  {searchTerm ? 'Nuk u gjet asnjë ide me këtë kriter.' : 'Ende nuk ka ide për këtë lëndë.'}
                </div>
              )}
              {!listStatus.loading && !listStatus.error && ideas.filter(idea => 
                idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                idea.shorthand.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((idea) => (
                <div key={idea.id} style={ideaItem}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{idea.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                      {idea.subject?.name && <span>{idea.subject.name}</span>}
                      {idea.student?.fullName && (
                        <span>
                          {idea.subject?.name ? ' • ' : ''}
                          {idea.student.fullName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={tagStyle}>{idea.shorthand}</span>
                    <button
                      style={tinyButton}
                      onClick={() => navigate('/profesor/feedback', { state: { lendaId, subject: subjectName, ideaId: idea.id } })}
                    >
                      Feedback
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: '1.5rem' }}>
              <button
                style={{ ...secondaryButton, flex: 1 }}
                onClick={loadIdeas}
                disabled={listStatus.loading}
              >
                Rifresko listën
              </button>
              <button
                style={{ ...primaryButton, flex: 1 }}
                onClick={() => {
                  const rows = ideas.map(i => ({
                    Titulli: i.title,
                    Shkurtesa: i.shorthand,
                    Lenda: i.subject?.name ?? '',
                    Student: i.student?.fullName ?? ''
                  }));
                  const header = ['Titulli','Shkurtesa','Lenda','Student'];
                  const csv = [header.join(','), ...rows.map(r => header.map(h => `"${String(r[h] ?? '').replace(/"/g,'""')}"`).join(','))].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `idet_${subjectName.replace(/\s+/g,'_')}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                ⬇ Shkarko të gjitha
              </button>
            </div>
          </div>

        </div>

        <div style={footerStyle}>
          <button style={secondaryButton} onClick={handleFeedback}>Feedback</button>
        </div>
      </div> 
    </div>
  );
};

export default Idetep;
