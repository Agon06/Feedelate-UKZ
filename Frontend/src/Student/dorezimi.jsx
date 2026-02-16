import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { uploadStudentDorezim, getStudentTemplate, getStudentIdeaDeadline, getStudentIdeaSubmission } from '../services/studentApi';
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
  const [ideaDeadline, setIdeaDeadline] = useState({ ideaStartDate: null, ideaEndDate: null, ideaTitle: null });
  const [deadlineLoading, setDeadlineLoading] = useState(true);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(true);

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
        setTemplate(data);
      } catch (error) {
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
          ideaStartDate: data.ideaStartDate ?? null, 
          ideaEndDate: data.ideaDeadline ?? null,
          ideaTitle: data.ideaTitle ?? null 
        });
      } catch (error) {
        setIdeaDeadline({ ideaStartDate: null, ideaEndDate: null, ideaTitle: null });
      } finally {
        setDeadlineLoading(false);
      }
    };
    fetchIdeaDeadline();
  }, [lendaId]);

  // Fetch existing submission
  useEffect(() => {
    const fetchExistingSubmission = async () => {
      if (!lendaId) return;
      try {
        const data = await getStudentIdeaSubmission(STUDENT_ID, lendaId);
        // API returns an array, take the first (most recent) submission
        setExistingSubmission(Array.isArray(data) && data.length > 0 ? data[0] : null);
      } catch (error) {
        setExistingSubmission(null);
      } finally {
        setSubmissionLoading(false);
      }
    };
    fetchExistingSubmission();
  }, [lendaId]);

  const handleDownloadTemplate = () => {
    try {
      if (!template || !template.hasTemplate || !STUDENT_ID || !lendaId) {
        alert('Template nuk u gjet');
        return;
      }

      let baseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';
      if (baseUrl && baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }

      const downloadUrl = `${baseUrl}/studentet/${STUDENT_ID}/dorezime/template-download?lendaId=${lendaId}`;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = template.fileName || 'template';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
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
      await uploadStudentDorezim(STUDENT_ID, { lendaId, file: formData.skedar });

      setFormFeedback({ type: 'success', message: 'Detyra u dorëzua me sukses!' });
      
      // Përditëso listën e dorëzimeve për të shfaqur file-in e ri
      try {
        const updatedData = await getStudentIdeaSubmission(STUDENT_ID, lendaId);
        setExistingSubmission(Array.isArray(updatedData) && updatedData.length > 0 ? updatedData[0] : null);
      } catch (refreshError) {
        console.error('Error refreshing submission:', refreshError);
      }

      setTimeout(() => {
        setFormData({ skedar: null });
        navigate(-1);
      }, 1200);
    } catch (error) {
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
    return new Date(iso);
  };

  const isSubmissionAllowed = useMemo(() => {
    if (deadlineLoading) return false;
    
    // ideaStartDate është e detyrueshme
    if (!ideaDeadline.ideaStartDate) return false;
    if (ideaDeadline.ideaStartDate == null) return false;
    
    const now = Date.now();
    const startTime = new Date(ideaDeadline.ideaStartDate).getTime();
    
    // Nëse është para fillimit
    if (now < startTime) return false;
    
    // Check if deadline is passed or if deadline is not set, treat as blocking
    const isDeadlinePassed = ideaDeadline.ideaEndDate ? new Date(ideaDeadline.ideaEndDate).getTime() < now : false;
    const hasNoDeadline = !ideaDeadline.ideaEndDate;
    
    // Butoni bllokohet nëse afati ka kaluar OSE nëse nuk ka afat fare
    const cannotSubmit = isDeadlinePassed || hasNoDeadline;
    
    return !cannotSubmit;
  }, [ideaDeadline.ideaStartDate, ideaDeadline.ideaEndDate, deadlineLoading]);

  // DEBUG: Log state before rendering
  console.log('DEBUG isSubmissionAllowed:', isSubmissionAllowed, 'ideaDeadline:', ideaDeadline, 'deadlineLoading:', deadlineLoading);

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
          ) : (ideaDeadline.ideaStartDate || ideaDeadline.ideaEndDate) ? (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                {ideaDeadline.ideaTitle ? `📌 ${ideaDeadline.ideaTitle}` : 'Afati i dorëzimit të idesë'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div>Fillimi: <span style={{ fontWeight: 600 }}>{formatDisplay(ideaDeadline.ideaStartDate)}</span></div>
                <div>Mbarimi: <span style={{ fontWeight: 600 }}>{formatDisplay(ideaDeadline.ideaEndDate)}</span></div>
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
                  {!ideaDeadline.ideaStartDate && !ideaDeadline.ideaEndDate ? (
                    <span>Afati i dorëzimit nuk është caktuar akoma nga profesori.</span>
                  ) : (
                    <>
                      Dorëzimi i ideve është i mbyllur.
                      {ideaDeadline.ideaStartDate && parseLocal(ideaDeadline.ideaStartDate) && new Date() < parseLocal(ideaDeadline.ideaStartDate) && (
                        <span> Fillon më: {formatDisplay(ideaDeadline.ideaStartDate)}</span>
                      )}
                      {ideaDeadline.ideaEndDate && parseLocal(ideaDeadline.ideaEndDate) && new Date() > parseLocal(ideaDeadline.ideaEndDate) && (
                        <span> Mbaroi më: {formatDisplay(ideaDeadline.ideaEndDate)}</span>
                      )}
                    </>
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

            {/* Existing Submission Info */}
            {!submissionLoading && existingSubmission && existingSubmission.fileName && (
              <div
                style={{
                  ...infoBoxStyle,
                  background: 'rgba(79,196,130,0.25)',
                  border: '1px solid rgba(79,196,130,0.4)',
                  marginTop: '1.5rem',
                  marginBottom: 0
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#85E3A0' }}>
                  ✓ File i Dorëzuar
                </div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>
                  📎 {existingSubmission.fileName}
                </div>
                {existingSubmission.createdAt && (
                  <div style={{ fontSize: 11, opacity: 0.7, marginTop: '0.4rem' }}>
                    Dorëzuar më: {formatDisplay(existingSubmission.createdAt)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={footerStyle}>
       
        </div>
      </div>
    </div>
  );
};

export default DorezimPage;
