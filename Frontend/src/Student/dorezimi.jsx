import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { uploadStudentDorezim, getStudentTemplate, getStudentIdeaDeadline } from '../services/studentApi';

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
    skedaret: [],
  });
  const [formFeedback, setFormFeedback] = useState({ type: null, message: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [template, setTemplate] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(true);
  const [ideaDeadline, setIdeaDeadline] = useState({ start: null, end: null });
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
        setIdeaDeadline({ start: data.ideaStartDate ?? null, end: data.ideaDeadline ?? null });
      } catch (error) {
        setIdeaDeadline({ start: null, end: null });
      } finally {
        setDeadlineLoading(false);
      }
    };
    fetchIdeaDeadline();
  }, [lendaId]);

  const handleDownloadTemplate = () => {
    if (!template) return;

    const API_BASE_URL = (import.meta.env?.VITE_API_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');
    const baseUrl = API_BASE_URL.replace('/api', '');

    // Remove 'uploads/' prefix if it exists in filePath (to avoid double /uploads/)
    const filePath = template.filePath.startsWith('uploads/')
      ? template.filePath
      : `uploads/${template.filePath}`;

    const downloadUrl = `${baseUrl}/${filePath}`;

    console.log('Downloading:', downloadUrl);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = template.fileName || 'template.docx';
    link.setAttribute('download', template.fileName || 'template.docx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Kontrollo madhësinë e secilit file
      const oversizedFiles = files.filter(f => f.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setFormFeedback({ type: 'error', message: `${oversizedFiles.length} file(s) kalojnë 10MB.` });
        return;
      }
      setFormData((prev) => ({ ...prev, skedaret: files }));
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

    if (formData.skedaret.length === 0) {
      setFormFeedback({ type: 'error', message: 'Duhet të ngarkosh të paktën një fajll.' });
      return;
    }

    setIsSubmitting(true);
    setFormFeedback({ type: null, message: null });

    try {
      console.log('Uploading files:', { lendaId, fileCount: formData.skedaret.length });

      // Dërgo çdo file veç e veç
      for (let i = 0; i < formData.skedaret.length; i++) {
        const file = formData.skedaret[i];
        console.log(`Uploading file ${i + 1}/${formData.skedaret.length}:`, file.name);
        await uploadStudentDorezim(STUDENT_ID, { lendaId, file });
      }

      setFormFeedback({ type: 'success', message: `${formData.skedaret.length} detyra(t) u dorëzua me sukses!` });
      setTimeout(() => {
        setFormData({ skedaret: [] });
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
    padding: isMobile ? '1.5rem' : '2rem',
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
    background: 'rgba(9,18,12,0.9)',
    borderRadius: 20,
    border: '1px solid rgba(23,199,122,0.25)',
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
    background: '#19c776',
    color: '#041407',
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
    color: '#d0f5e5'
  };

  const inputStyle = {
    width: '100%',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.12)',
    padding: '0.7rem 0.9rem',
    background: 'rgba(4,10,6,0.6)',
    color: '#fff',
    fontFamily: 'Inter, system-ui, sans-serif'
  };

  const infoBoxStyle = {
    background: 'rgba(23,199,122,0.08)',
    borderRadius: 12,
    border: '1px solid rgba(23,199,122,0.25)',
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
    background: '#19c776',
    color: '#041407',
    fontWeight: 700,
    padding: '0.8rem 1.6rem',
    cursor: 'pointer',
    width: 'min(560px, 100%)'
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

  const deadlineBoxStyle = {
    background: 'rgba(23,199,122,0.08)',
    borderRadius: 12,
    border: '1px solid rgba(23,199,122,0.25)',
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
    <div style={pageStyle}>
      <div style={modalStyle}>
        <button
          style={closeButtonStyle}
          onClick={() => navigate(-1)}
          aria-label="Mbyll"
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ marginTop: 0, marginBottom: '0.35rem' }}>Dorëzo Detyren</h2>
          <p style={{ margin: 0, opacity: 0.8 }}>Shkarko shabllonin, plotëso dhe dorëzo</p>
        </div>

        {/* Idea Deadline Banner - positioned under header and above columns */}
        <div style={deadlineBoxStyle}>
          {deadlineLoading ? (
            <span>Duke u ngarkuar afatet...</span>
          ) : (ideaDeadline.start || ideaDeadline.end) ? (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Afati i dorëzimit të idesë</div>
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
            ) : template ? (
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
              disabled={!template || templateLoading}
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
                <label style={labelStyle}>Ngarko Detyrat (mund të zgjedhësh më shumë se një) *</label>
                <input
                  style={inputStyle}
                  type="file"
                  accept=".doc,.docx,.pdf,.ppt,.pptx,.xls,.xlsx,.txt"
                  onChange={handleFileChange}
                  multiple
                  required
                  disabled={!isSubmissionAllowed}
                />
                {formData.skedaret.length > 0 && (
                  <div style={{ margin: '0.5rem 0 0 0', fontSize: 12, opacity: 0.8 }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                      📎 {formData.skedaret.length} file(s) të zgjedhur:
                    </div>
                    {formData.skedaret.map((file, idx) => (
                      <div key={idx} style={{ paddingLeft: '1rem', marginBottom: '0.15rem' }}>
                        • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    ))}
                  </div>
                )}
                <p style={{ margin: '0.5rem 0 0 0', fontSize: 12, opacity: 0.7 }}>
                  (Maksimumi për file: 10MB - Word, PDF, PowerPoint, Excel)
                </p>
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
                  ? `Duke u dorëzuar... (${formData.skedaret.length} file)`
                  : `Dorëzo ${formData.skedaret.length > 0 ? `(${formData.skedaret.length} file)` : ''}`
                }
              </button>
            </form>
          </div>
        </div>

        <div style={footerStyle}>
          <button
            style={secondaryButton}
            type="button"
            onClick={() => navigate(-1)}
          >
            Anulo
          </button>
        </div>
      </div>
    </div>
  );
};

export default DorezimPage;
