import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const IdeaPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const subjectName = location.state?.subject ?? 'Lëndë e pa specifikuar';

  const ideas = useMemo(() => ([
    { id: 'UKMS', type: 'User' },
    { id: 'SHKU', type: 'User' },
    { id: 'LM', type: 'Link' }
  ]), []);

  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, rgba(10,18,12,1) 0%, rgba(14,28,20,1) 60%, rgba(10,18,12,1) 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, system-ui, sans-serif',
    padding: '2rem'
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
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
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
    gap: '0.8rem'
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
            <input type="text" placeholder="Search" style={searchInput} />
            <div style={ideaList}>
              {ideas.map((idea) => (
                <div key={idea.id} style={ideaItem}>
                  <strong>{idea.id}</strong>
                  <span style={tagStyle}>{idea.type}</span>
                </div>
              ))}
            </div>
            <button style={{ ...secondaryButton, width: '100%', marginTop: '1.5rem' }}>
              Shiko idetë e të tjerëve
            </button>
          </div>

          <div style={columnCard}>
            <div style={formField}>
              <label>Emri Mbiemri</label>
              <input style={inputStyle} placeholder="Enter full name..." />
            </div>
            <div style={formField}>
              <label>Titulli</label>
              <input style={inputStyle} placeholder="Enter title..." />
            </div>
            <div style={formField}>
              <label>Shkurtesa</label>
              <input style={inputStyle} defaultValue="SEW..." />
            </div>
            <button style={{ ...primaryButton, width: '100%' }}>Shto Iden</button>
          </div>
        </div>

        <div style={footerStyle}>
          <button style={primaryButton}>Dorëzo</button>
          <button style={secondaryButton}>Feedback</button>
        </div>
      </div>
    </div>
  );
};

export default IdeaPage;
