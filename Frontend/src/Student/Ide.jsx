import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getStudentIdeas, createStudentIdea } from '../services/studentApi';

const IdeaPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const subjectName = location.state?.subject ?? 'Lëndë e pa specifikuar';
  const lendaId = location.state?.lendaId ?? null;
  const STUDENT_ID = 1;

  const [ideas, setIdeas] = useState([]);
  const [listStatus, setListStatus] = useState({ loading: true, error: null });
  const [formData, setFormData] = useState({
    titulli: '',
    shkurtesa: subjectName
      .split(' ')
      .map((word) => word?.[0] ?? '')
      .join('')
      .slice(0, 4)
      .toUpperCase(),
  });
  const [formFeedback, setFormFeedback] = useState({ type: null, message: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadIdeas = useCallback(async () => {
    setListStatus({ loading: true, error: null });
    try {
      const response = await getStudentIdeas(STUDENT_ID, lendaId);
      setIdeas(response);
      setListStatus({ loading: false, error: null });
    } catch (error) {
      setListStatus({
        loading: false,
        error: error?.message ?? 'Nuk u lexuan idetë aktuale.',
      });
    }
  }, [STUDENT_ID, lendaId]);

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!lendaId) {
      setFormFeedback({ type: 'error', message: 'Zgjidh lëndën përmes faqes së lëndëve përpara se të dërgosh një ide.' });
      return;
    }

    if (!formData.titulli.trim() || !formData.shkurtesa.trim()) {
      setFormFeedback({ type: 'error', message: 'Titulli dhe shkurtesa janë të detyrueshme.' });
      return;
    }

    setIsSubmitting(true);
    setFormFeedback({ type: null, message: null });
    try {
      const payload = {
        lendaId,
        titulli: formData.titulli.trim(),
        shkurtesa: formData.shkurtesa.trim().toUpperCase(),
      };
      const created = await createStudentIdea(STUDENT_ID, payload);
      setIdeas((prev) => [created, ...prev]);
      setFormData({ titulli: '', shkurtesa: '' });
      setFormFeedback({ type: 'success', message: 'Idea u ruajt me sukses.' });
    } catch (error) {
      setFormFeedback({ type: 'error', message: error?.message ?? 'Nuk u ruajt ideja.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedback = () => {
    //nese ka feedback
    const feedBackId = 1; //kete do e marim nga backendi ne te ardhmen
    if (feedBackId === 1) {
    navigate('/student/feedback', {
      state: {
        context: `Ide për lëndën: ${subjectName} (ID: ${lendaId})`
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
            <input type="text" placeholder="Search" style={searchInput} disabled />
            <div style={ideaList}>
              {listStatus.loading && (
                <div style={{ textAlign: 'center', opacity: 0.8 }}>Duke u ngarkuar...</div>
              )}
              {listStatus.error && (
                <div style={{ textAlign: 'center', color: '#f8b4b4' }}>{listStatus.error}</div>
              )}
              {!listStatus.loading && !listStatus.error && ideas.length === 0 && (
                <div style={{ textAlign: 'center', opacity: 0.8 }}>Ende nuk ka ide për këtë lëndë.</div>
              )}
              {!listStatus.loading && !listStatus.error && ideas.map((idea) => (
                <div key={idea.id} style={ideaItem}>
                  <div>
                    <strong>{idea.title}</strong>
                    {idea.subject?.name && (
                      <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>{idea.subject.name}</p>
                    )}
                  </div>
                  <span style={tagStyle}>{idea.shorthand}</span>
                </div>
              ))}
            </div>
            <button
              style={{ ...secondaryButton, width: '100%', marginTop: '1.5rem' }}
              onClick={loadIdeas}
              disabled={listStatus.loading}
            >
              Rifresko listën
            </button>
          </div>

          <div style={columnCard}>
            <div style={formField}>
              <label>Lënda</label>
              <input style={inputStyle} value={subjectName} disabled />
            </div>
            <form onSubmit={handleSubmit}>
              <div style={formField}>
                <label>Titulli</label>
                <input
                  style={inputStyle}
                  placeholder="P.sh. Ide për projektin praktik"
                  name="titulli"
                  value={formData.titulli}
                  onChange={handleInputChange}
                />
              </div>
              <div style={formField}>
                <label>Shkurtesa</label>
                <input
                  style={inputStyle}
                  placeholder="Shkurtesa e idesë"
                  name="shkurtesa"
                  value={formData.shkurtesa}
                  onChange={handleInputChange}
                />
              </div>
              {formFeedback.message && (
                <div
                  style={{
                    ...bannerStyle,
                    background: formFeedback.type === 'error' ? 'rgba(255,82,82,0.12)' : 'rgba(23,199,122,0.15)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {formFeedback.message}
                </div>
              )}
              <button style={{ ...primaryButton, width: '100%', marginTop: '1rem' }} type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Duke u ruajtur...' : 'Shto idenë'}
              </button>
            </form>
          </div>
        </div>

        <div style={footerStyle}>
          <button 
            style={primaryButton} 
            onClick={() => navigate('/student/dorezimi', {
              state: {
                lendaId: lendaId,
                subject: subjectName
              }
            })}
          >
            Dorëzo
          </button>
          <button style={secondaryButton} onClick={handleFeedback}>Feedback</button>
        </div>
      </div> 
    </div>
  );
};

export default IdeaPage;
