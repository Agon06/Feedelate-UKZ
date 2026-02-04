import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { uploadStudentDorezim, getStudentTemplate, getStudentIdeaDeadline } from '../services/studentApi';
import './StudentTheme.css';

const DorezimPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lendaId = location.state?.lendaId ?? null;
  const subjectName = location.state?.subject ?? 'Lëndë e pa specifikuar';

  const student = JSON.parse(localStorage.getItem('student') || '{}');
  if (!student.id) {
    navigate('/');
    return null;
  }
  const STUDENT_ID = student.id;

  const [formData, setFormData] = useState({
    skedar: null,
  });
  const [formFeedback, setFormFeedback] = useState({ type: null, message: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [template, setTemplate] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(true);
  const [ideaDeadline, setIdeaDeadline] = useState({ start: null, end: null, title: null });
  const [deadlineLoading, setDeadlineLoading] = useState(true);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Fetch template on component mount
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!lendaId) return;

      try {
        const data = await getStudentTemplate(STUDENT_ID, lendaId);
        console.log('Template fetched:', data);
        setTemplate(data);
      } catch (error) {
        console.log('No template available:', error.message);
        setTemplate(null);
      } finally {
        setTemplateLoading(false);
      }
    };

    fetchTemplate();
  }, [lendaId]);

  // Fetch idea deadlines for this lenda
  useEffect(() => {
    const fetchIdeaDeadline = async () => {
      if (!lendaId) return;
      try {
        const data = await getStudentIdeaDeadline(STUDENT_ID, lendaId);
        setIdeaDeadline({ 
          start: data.ideaStartDate ?? null, 
          end: data.ideaDeadline ?? null,
          title: data.ideaTitle ?? null 
        });
      } catch (error) {
        setIdeaDeadline({ start: null, end: null, title: null });
      } finally {
        setDeadlineLoading(false);
      }
    };
    fetchIdeaDeadline();
  }, [lendaId]);

  const handleDownloadTemplate = () => {
    try {
      if (!template || !template.hasTemplate || !STUDENT_ID || !lendaId) {
        console.error('Missing required data:', { template, STUDENT_ID, lendaId });
        alert('Template nuk u gjet');
        return;
      }

      // Use simple string concatenation without replace
      let baseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';
      // Remove trailing slash if exists
      if (baseUrl && baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }

      const downloadUrl = `${baseUrl}/studentet/${STUDENT_ID}/dorezime/template-download?lendaId=${lendaId}`;

      console.log('Downloading from:', downloadUrl);
      console.log('Template info:', { hasTemplate: template.hasTemplate, fileName: template.fileName });

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = template.fileName || 'template';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Gabim gjatë shkarkimit të template-it');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      // Kontrollo madhësinë e file-it (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFormFeedback({ type: 'error', message: 'File-i kalon 10MB.' });
        return;
      }
      setFormData((prev) => ({ ...prev, skedar: file }));
      setFormFeedback({ type: null, message: null });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!lendaId) {
      setFormFeedback({ type: 'error', message: 'Lënda nuk u gjet. Kthehu përpiqe përsëri.' });
      return;
    }

    if (!formData.skedar) {
      setFormFeedback({ type: 'error', message: 'Duhet të zgjedhësh një fajll për ta dorëzuar.' });
      return;
    }

    setIsSubmitting(true);
    setFormFeedback({ type: null, message: null });

    try {
      console.log('Uploading file:', { lendaId, fileName: formData.skedar.name });

      await uploadStudentDorezim(STUDENT_ID, { lendaId, file: formData.skedar });

      setFormFeedback({ type: 'success', message: 'Detyra u dorëzua me sukses!' });
      setTimeout(() => {
        setFormData({ skedar: null });
        navigate(-1);
      }, 1200);
    } catch (error) {
      console.error('Upload error:', error);
      setFormFeedback({ type: 'error', message: error?.message ?? 'Nuk u dorëzua detyra.' });
    } finally {
      setIsSubmitting(false);
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
    padding: '2rem'
  };

  const modalStyle = {
    width: 'min(900px, 100%)',
    background: '#0B2E33',
    borderRadius: 28,
    border: '1px solid rgba(184,227,233,0.2)',
    boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
    padding: isMobile ? '1.5rem' : '2rem',
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
    cursor: 'pointer',
    fontSize: 20
  };

  const columnsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '1.5rem',
    marginTop: '1rem'
  };

  const columnCard = {
    background: '#0B2E33',
    borderRadius: 20,
    border: '1px solid rgba(184,227,233,0.2)',
    padding: '1.5rem',
    minHeight: 380,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };

  const templateCardStyle = {
    ...columnCard,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    gap: '1.5rem'
  };

  const fileIconStyle = {
    fontSize: 64,
    marginBottom: '0.5rem'
  };

  const downloadButtonStyle = {
    borderRadius: 12,
    border: 'none',
    background: '#4F7C82',
    color: '#B8E3E9',
    fontWeight: 700,
    padding: '0.8rem 1.6rem',
    cursor: 'pointer',
    fontSize: 14,
    marginTop: '1rem'
  };

  const formField = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: '1.25rem',
    width: 'min(560px, 100%)'
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    opacity: 0.9,
    color: '#B8E3E9'
  };

  const inputStyle = {
    width: '100%',
    borderRadius: 14,
    border: '1px solid rgba(184,227,233,0.2)',
    padding: '0.7rem 0.9rem',
    background: 'rgba(11,46,51,0.8)',
    color: '#B8E3E9',
    fontFamily: 'Inter, system-ui, sans-serif'
  };

  const infoBoxStyle = {
    background: 'rgba(79,124,130,0.35)',
    borderRadius: 12,
    border: '1px solid rgba(184,227,233,0.25)',
    padding: '0.9rem',
    marginBottom: '1.75rem',
    fontSize: 13,
    opacity: 0.9,
    textAlign: 'center',
    width: 'min(560px, 100%)'
  };

  const footerStyle = {
    marginTop: '1.5rem',
    display: 'flex',
    justifyContent: 'flex-start',
    gap: '1rem'
  };

  const primaryButton = {
    borderRadius: 12,
    border: 'none',
    background: '#4F7C82',
    color: '#B8E3E9',
    fontWeight: 700,
    padding: '0.8rem 1.6rem',
    cursor: 'pointer',
    width: 'min(560px, 100%)'
  };

  const secondaryButton = {
    borderRadius: 12,
    border: '1px solid rgba(184,227,233,0.25)',
    background: 'transparent',
    color: '#B8E3E9',
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

  const deadlineBoxStyle = {
    background: 'rgba(79,124,130,0.35)',
    borderRadius: 12,
    border: '1px solid rgba(184,227,233,0.25)',
    padding: '0.9rem',
    marginBottom: '1.5rem',
    fontSize: 13,
    opacity: 0.9,
    textAlign: 'center',
    width: '100%'
  };

  const formatDisplay = (iso) => {
    if (!iso) return null;
    // Expecting YYYY-MM-DDTHH:MM:SS -> display as YYYY-MM-DD HH:MM
    const [datePart, timePart] = String(iso).split('T');
    const hm = (timePart || '').slice(0,5);
    return `${datePart} ${hm}`;
  };

  const parseLocal = (iso) => {
    if (!iso) return null;
    // Parse local ISO without timezone
    return new Date(iso);
  };

  const isSubmissionAllowed = (() => {
    const now = new Date();
    const start = parseLocal(ideaDeadline.start);
    const end = parseLocal(ideaDeadline.end);
    if (deadlineLoading) return true; // while loading, don't block UI hard
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  })();

  return (
    <div style={pageStyle} className="student-theme dorezimi-page">
      <div style={modalStyle}>
        <button
          style={closeButtonStyle}
          onClick={() => navigate(-1)}
          aria-label="Mbyll"
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ marginTop: 0, marginBottom: '0.35rem' }}>Dorëzo Detyren e parë</h2>
        
        </div>

        {/* Idea Deadline Banner - positioned under header and above columns */}
        <div style={deadlineBoxStyle}>
          {deadlineLoading ? (
            <span>Duke u ngarkuar afatet...</span>
          ) : (ideaDeadline.start || ideaDeadline.end) ? (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                {ideaDeadline.title ? `📌 ${ideaDeadline.title}` : 'Afati i dorëzimit të idesë'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div>Fillimi: <span style={{ fontWeight: 600 }}>{formatDisplay(ideaDeadline.start)}</span></div>
                <div>Mbarimi: <span style={{ fontWeight: 600 }}>{formatDisplay(ideaDeadline.end)}</span></div>
              </div>
            </div>
          ) : (
            <span>Nuk është caktuar afati i ideve për këtë lëndë.</span>
          )}
        </div>

        <div style={columnsStyle}>
          {/* KOLONA E MAJTË - TEMPLATE */}
          <div style={templateCardStyle}>
            {templateLoading ? (
              <div style={{ textAlign: 'center', opacity: 0.8 }}>Duke u ngarkuar...</div>
            ) : template?.hasTemplate ? (
              <div>
                <div style={fileIconStyle}>📄</div>
                <h3 style={{ margin: '0.5rem 0', opacity: 0.95 }}>Template e Detyres</h3>
                <p style={{ margin: '0.5rem 0', fontSize: 13, opacity: 0.8 }}>
                  {template.fileName}
                </p>
                <p style={{ margin: '0.5rem 0', fontSize: 12, opacity: 0.7 }}>
                  Disponible për download
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', opacity: 0.8 }}>
                <p>Nuk ka template për këtë lëndë</p>
              </div>
            )}
            <button
              style={downloadButtonStyle}
              onClick={handleDownloadTemplate}
              disabled={!template || !template.hasTemplate || templateLoading}
            >
              ⬇ Shkarko Shabllonin
            </button>
          </div>

          {/* KOLONA E DJATHTË - UPLOAD */}
          <div style={columnCard}>
            <div style={infoBoxStyle}>
              <strong>Lënda:</strong> {subjectName}
            </div>


            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? '16px' : '20px' }}>
              <div style={formField}>
                <input
                  style={inputStyle}
                  type="file"
                  accept=".doc,.docx,.pdf,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                  onChange={handleFileChange}
                  required
                  disabled={!isSubmissionAllowed}
                />
                {formData.skedar && (
                  <div style={{ margin: '0.5rem 0 0 0', fontSize: 12, opacity: 0.8 }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                      📎 File i zgjedhur:
                    </div>
                    <div style={{ paddingLeft: '1rem' }}>
                      • {formData.skedar.name} ({(formData.skedar.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  </div>
                )}
                <p style={{ margin: '0.5rem 0 0 0', fontSize: 12, opacity: 0.7 }}>
                  (Maksimumi: 10MB - ZIP, RAR, Word, PDF, PowerPoint, Excel)
                </p>
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

              {/* Block notice when outside the allowed window */}
              {!isSubmissionAllowed && (
                <div
                  style={{
                    ...bannerStyle,
                    background: 'rgba(255,82,82,0.12)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  Dorëzimi i ideve është i mbyllur.
                  {ideaDeadline.start && parseLocal(ideaDeadline.start) && new Date() < parseLocal(ideaDeadline.start) && (
                    <span> Fillon më: {formatDisplay(ideaDeadline.start)}</span>
                  )}
                  {ideaDeadline.end && parseLocal(ideaDeadline.end) && new Date() > parseLocal(ideaDeadline.end) && (
                    <span> Mbaroi më: {formatDisplay(ideaDeadline.end)}</span>
                  )}
                </div>
              )}

              <button
                style={primaryButton}
                type="submit"
                disabled={isSubmitting || !isSubmissionAllowed}
              >
                {isSubmitting
                  ? 'Duke u dorëzuar...'
                  : 'Dorëzo'
                }
              </button>
            </form>
          </div>
        </div>

        <div style={footerStyle}>
       
        </div>
      </div>
    </div>
  );
};

export default DorezimPage;
