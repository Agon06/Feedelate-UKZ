import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { uploadStudentDorezim, getStudentTemplate } from '../services/studentApi';

const DorezimPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lendaId = location.state?.lendaId ?? null;
  const subjectName = location.state?.subject ?? 'Lëndë e pa specifikuar';

  const [formData, setFormData] = useState({
    skedari: null,
    skedarName: '',
  });
  const [formFeedback, setFormFeedback] = useState({ type: null, message: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [template, setTemplate] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(true);

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
        const STUDENT_ID = 1;
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
    link.download = template.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setFormFeedback({ type: 'error', message: 'Skedari nuk duhet të kalojë 10MB.' });
        return;
      }
      setFormData((prev) => ({ ...prev, skedari: file, skedarName: file.name }));
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

    if (!formData.skedarName) {
      setFormFeedback({ type: 'error', message: 'Duhet të ngarkosh fajllin e detyres.' });
      return;
    }

    setIsSubmitting(true);
    setFormFeedback({ type: null, message: null });
    
    try {
      const STUDENT_ID = 1;
      console.log('Uploading file:', { lendaId, fileName: formData.skedarName, fileSize: formData.skedari?.size });
      
      const result = await uploadStudentDorezim(STUDENT_ID, { lendaId, file: formData.skedari });
      
      console.log('Upload success response:', result);
      setFormFeedback({ type: 'success', message: 'Detyra u dorëzua me sukses!' });
      setTimeout(() => {
        setFormData({ skedari: null, skedarName: '' });
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
                <label style={labelStyle}>Ngarko Detyren (Word) *</label>
                <input
                  style={inputStyle}
                  type="file"
                  accept=".doc,.docx"
                  onChange={handleFileChange}
                  required
                />
                {formData.skedarName && (
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: 12, opacity: 0.8 }}>
                    📎 {formData.skedarName}
                  </p>
                )}
                <p style={{ margin: '0.5rem 0 0 0', fontSize: 12, opacity: 0.7 }}>
                  (Maksimumi: 10MB - DOC, DOCX)
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

              <button 
                style={primaryButton} 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Duke u dorëzuar...' : 'Dorëzo'}
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
