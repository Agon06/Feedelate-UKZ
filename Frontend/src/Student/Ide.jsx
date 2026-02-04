import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getStudentIdeas, createStudentIdea, updateStudentIdea, deleteStudentIdea } from '../services/studentApi';
import './Ide.css';
import './StudentTheme.css';

const IdeaPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const subjectName = location.state?.subject ?? 'Lëndë e pa specifikuar';
  const lendaId = location.state?.lendaId ?? null;
  const baseShkurtesa = subjectName
    .split(' ')
    .map((word) => word?.[0] ?? '')
    .join('')
    .slice(0, 4)
    .toUpperCase();

  const student = JSON.parse(localStorage.getItem('student') || '{}');
  if (!student.id) {
    navigate('/');
    return null;
  }
  const STUDENT_ID = student.id;

  const [ideas, setIdeas] = useState([]);
  const [listStatus, setListStatus] = useState({ loading: true, error: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    titulli: '',
    shkurtesa: baseShkurtesa,
  });
  const [formFeedback, setFormFeedback] = useState({ type: null, message: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingIdeaId, setEditingIdeaId] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, message: '', onConfirm: null });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hasReachedIdeaLimit = ideas.length >= 1;

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

      if (editingIdeaId) {
        const updated = await updateStudentIdea(STUDENT_ID, editingIdeaId, payload);
        setIdeas((prev) => prev.map((idea) => (idea.id === editingIdeaId ? updated : idea)));
        setFormFeedback({ type: 'success', message: 'Idea u përditësua.' });
        setEditingIdeaId(null);
      } else {
        const created = await createStudentIdea(STUDENT_ID, payload);
        setIdeas((prev) => [created, ...prev]);
        setFormFeedback({ type: 'success', message: 'Idea u ruajt me sukses.' });
      }

      setFormData({ titulli: '', shkurtesa: baseShkurtesa });
    } catch (error) {
      setFormFeedback({ type: 'error', message: error?.message ?? 'Nuk u ruajt ideja.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (idea) => {
    setEditingIdeaId(idea.id);
    setFormData({
      titulli: idea.title ?? '',
      shkurtesa: idea.shorthand ?? '',
    });
    setFormFeedback({ type: null, message: null });
  };

  const handleCancelEdit = () => {
    setEditingIdeaId(null);
    setFormData({ titulli: '', shkurtesa: baseShkurtesa });
    setFormFeedback({ type: null, message: null });
  };

  const handleDelete = async (ideaId) => {
    setConfirmDialog({
      open: true,
      message: 'A je i sigurt që do ta fshish këtë ide?',
      onConfirm: async () => {
        setIsDeletingId(ideaId);
        try {
          await deleteStudentIdea(STUDENT_ID, ideaId);
          setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
          if (editingIdeaId === ideaId) {
            handleCancelEdit();
          }
          setFormFeedback({ type: 'success', message: 'Ideja u fshi me sukses.' });
        } catch (error) {
          setFormFeedback({ type: 'error', message: error?.message ?? 'Fshirja dështoi.' });
        } finally {
          setIsDeletingId(null);
          setConfirmDialog({ open: false, message: '', onConfirm: null });
        }
      }
    });
  };

  const handleFeedback = () => {
    //nese ka feedback
    const feedBackId = 1; //kete do e marim nga backendi ne te ardhmen
    if (feedBackId === 1) {
      navigate('/student/feedback', {
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
    background: 'linear-gradient(180deg, #4F7C82 0%, #0B2E33 60%, #0B2E33 100%)',
    color: '#B8E3E9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, system-ui, sans-serif',
    padding: '2rem',
    overflow: 'hidden'
  };

  const modalStyle = {
    width: 'min(1050px, 100%)',
    background: 'linear-gradient(180deg, #4F7C82 0%, #0B2E33 50%, #0B2E33 30%)',
    borderRadius: 28,
    border: '1px solid rgba(184,227,233,0.2)',
    boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
    padding: '2rem',
    position: 'relative'
  };

  const closeButtonStyle = {
    position: 'absolute',
    right: 24,
    top: 20,
    background: 'transparent',
    border: '1px solid rgba(184,227,233,0.25)',
    borderRadius: 20,
    width: 38,
    height: 38,
    color: '#B8E3E9',
    cursor: 'pointer'
  };

  const columnsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
    marginTop: '1rem',
    overflow: 'hidden'
  };

  const columnCard = {
    background: '#0B2E33',
    borderRadius: 20,
    border: '1px solid rgba(184,227,233,0.2)',
    padding: '1.25rem',
    minHeight: 360,
    minWidth: 0,
    overflow: 'hidden'
  };

  const searchInput = {
    width: '100%',
    padding: '0.75rem 0.9rem',
    borderRadius: 14,
    border: '1px solid rgba(184,227,233,0.2)',
    background: 'rgba(11,46,51,0.8)',
    color: '#B8E3E9',
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
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.75rem 0.9rem',
    borderRadius: 14,
    background: 'rgba(11,46,51,0.85)',
    border: '1px solid rgba(184,227,233,0.12)'
  };

  const tagStyle = {
    fontSize: 12,
    borderRadius: 999,
    padding: '0.25rem 0.7rem',
    border: '1px solid rgba(184,227,233,0.25)',
    color: '#B8E3E9'
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
    border: '1px solid rgba(184,227,233,0.2)',
    padding: '0.7rem 0.9rem',
    background: 'rgba(11,46,51,0.8)',
    color: '#B8E3E9'
  };

  const footerStyle = {
    marginTop: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between'
  };

  const actionButton = {
    borderRadius: 8,
    border: '1px solid rgba(184,227,233,0.2)',
    background: 'rgba(79,124,130,0.3)',
    color: '#B8E3E9',
    fontSize: 12,
    padding: '0.35rem 0.65rem',
    cursor: 'pointer'
  };

  const deleteButton = {
    borderRadius: 8,
    border: '1px solid rgba(255,82,82,0.4)',
    background: 'rgba(255,82,82,0.1)',
    color: '#ffc6c6',
    fontSize: 12,
    padding: '0.5rem 0.9rem',
    cursor: 'pointer',
    fontWeight: 600
  };

  const bannerStyle = {
    borderRadius: 12,
    padding: '0.75rem 1rem',
    marginTop: '0.5rem',
    textAlign: 'center',
    fontSize: 13,
  };

  const primaryButton = {
    borderRadius: 12,
    border: 'none',
    background: '#4F7C82',
    color: '#B8E3E9',
    padding: '0.7rem 1.2rem',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.3s ease'
  };

  const secondaryButton = {
    borderRadius: 12,
    border: '1px solid rgba(184,227,233,0.25)',
    background: 'transparent',
    color: '#B8E3E9',
    padding: '0.7rem 1.2rem',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={pageStyle} className="student-theme">
      <div style={modalStyle}>
        <button style={closeButtonStyle} onClick={() => navigate(-1)} aria-label="Mbyll">✕</button>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ marginTop: 0, marginBottom: '0.35rem' }}>Ide për {subjectName}</h2>
          <p style={{ margin: 0, opacity: 0.8 }}>Këtu mund të dorëzosh ide ose të shikosh ato ekzistuese.</p>
        </div>

        <div style={columnsStyle}>
          {/* Left column - lista e ideve */}
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
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, opacity: 0.6, marginBottom: '0.25rem' }}>Titulli:</div>
                    <strong>{idea.title}</strong>
                    {idea.subject?.name && (
                      <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>{idea.subject.name}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                    <div style={{ fontSize: 11, opacity: 0.6 }}>Shkurtesa:</div>
                    <span style={tagStyle}>{idea.shorthand}</span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        style={actionButton}
                        onClick={() => handleEdit(idea)}
                        disabled={isSubmitting && editingIdeaId === idea.id}
                      >
                        Modifiko
                      </button>
                      <button
                        type="button"
                        style={deleteButton}
                        onClick={() => handleDelete(idea.id)}
                        disabled={isDeletingId === idea.id}
                      >
                        {isDeletingId === idea.id ? 'Duke fshirë...' : 'Fshi'}
                      </button>
                    </div>
                  </div>
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

          {/* Right column - forma */}
          <div style={columnCard}>
            <div style={formField}>
              <label></label>
             
            </div>

            {/* Info mesazh për limitin */}
            {hasReachedIdeaLimit && !editingIdeaId && (
              <div
                style={{
                  ...bannerStyle,
                  background: 'rgba(79,124,130,0.35)',
                  border: '1px solid rgba(184,227,233,0.25)',
                  color: '#B8E3E9',
                  marginBottom: '1rem',
                  marginTop: 0
                }}
              >
                Mund të kesh vetëm 1 ide. Modifiko ose fshi idenë ekzistuese.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={formField}>
                <label>Titulli</label>
                <input
                  style={inputStyle}
                  placeholder="P.sh. Ide për projektin praktik"
                  name="titulli"
                  value={formData.titulli}
                  onChange={handleInputChange}
                  disabled={hasReachedIdeaLimit && !editingIdeaId}
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
                  disabled={hasReachedIdeaLimit && !editingIdeaId}
                />
              </div>
              {formFeedback.message && (
                <div
                  style={{
                    ...bannerStyle,
                    background: formFeedback.type === 'error' ? 'rgba(255,82,82,0.12)' : 'rgba(79,124,130,0.35)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {formFeedback.message}
                </div>
              )}
              <button
                style={{
                  ...primaryButton,
                  width: '100%',
                  marginTop: '1rem',
                  opacity: hasReachedIdeaLimit && !editingIdeaId ? 0.5 : 1,
                  cursor: hasReachedIdeaLimit && !editingIdeaId ? 'not-allowed' : 'pointer'
                }}
                type="submit"
                disabled={isSubmitting || (hasReachedIdeaLimit && !editingIdeaId)}
              >
                {isSubmitting ? 'Duke u ruajtur...' : (editingIdeaId ? 'Ruaj ndryshimet' : 'Shto idenë')}
              </button>
              {editingIdeaId && (
                <button
                  type="button"
                  style={{ ...secondaryButton, width: '100%', marginTop: '0.75rem' }}
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  Anulo ndryshimet
                </button>
              )}
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
            Dorëzo Iden
          </button>
          <button style={secondaryButton} onClick={handleFeedback}>Feedback</button>
        </div>

      </div>

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
            background: '#0B2E33',
            border: '1px solid rgba(184,227,233,0.2)',
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
                  color: '#B8E3E9',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0B2E33';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#4F7C82';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.35)';
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
                  border: '1px solid rgba(184,227,233,0.2)',
                  background: 'transparent',
                  color: '#B8E3E9',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(184,227,233,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(184,227,233,0.2)';
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

export default IdeaPage;
