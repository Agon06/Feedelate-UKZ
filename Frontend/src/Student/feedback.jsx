import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./feedback.css";
import "./StudentTheme.css";
import { getStudentIdeaSubmission, deleteStudentDorezim } from "../services/studentApi";

// Backend origin used for static file access (uploads)
const API_ORIGIN = ((import.meta.env?.VITE_API_URL) || "http://localhost:5000/api").replace(/\/$/, "").replace(/\/api$/, "");

const Feedback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lendaId = location.state?.lendaId || null;
  const selectedLenda = location.state?.subject || "Matematika";

  const student = JSON.parse(localStorage.getItem('student') || '{}');
  if (!student.id) {
    navigate('/');
    return null;
  }
  const STUDENT_ID = student.id;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Data coming from backend
  const [feedbackData, setFeedbackData] = useState({
    lenda: selectedLenda,
 
    vleresimi: null, // Will be populated from backend
    dorezime: [], // Lista e dorëzimeve
    feedback: "Nuk ka feedback akoma",
  });

  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle Office embed for exact layout
  const [showOfficeView, setShowOfficeView] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, message: '', onConfirm: null });

  const handleBack = () => {
    navigate(-1); // Go back in browser history instead of hardcoding route
  };

  const handleDelete = async (dorezimId) => {
    if (!dorezimId) {
      alert("Dorezim ID nuk u gjet");
      return;
    }

    setConfirmDialog({
      open: true,
      message: "A jeni të sigurt që doni të fshini këtë dorëzim?",
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await deleteStudentDorezim(STUDENT_ID, dorezimId);
          setFeedbackData(prev => ({
            ...prev,
            dorezime: prev.dorezime.filter(d => d.id !== dorezimId)
          }));
          setConfirmDialog({ open: false, message: '', onConfirm: null });
        } catch (error) {
          console.error("Error deleting dorezim:", error);
          alert("Error: " + error.message);
          setConfirmDialog({ open: false, message: '', onConfirm: null });
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };


  // Fetch Word file from dorezimiides table using lendaId
  useEffect(() => {
    const fetchIdejaFiles = async () => {
      if (!lendaId) {
        console.log("lendaId not provided");
        return;
      }
      try {
        const data = await getStudentIdeaSubmission(STUDENT_ID, lendaId);

        // data tani është array
        const dorezime = Array.isArray(data) ? data : [data];

        // Update feedbackData with fetched files
        setFeedbackData((prev) => ({
          ...prev,
          dorezime: dorezime.map(item => ({
            id: item.id,
            fileName: item.fileName || "Idea_Submission.docx",
            fileUrl: item.fileUrl
              ? (/^https?:\/\//i.test(item.fileUrl) ? item.fileUrl : `${API_ORIGIN}${item.fileUrl}`)
              : (item.fileDorezimi ? `${API_ORIGIN}/uploads/dorezime/${item.fileDorezimi}` : null),
            status: item.status || "Në Pritje",
            vleresimi: item.vleresimi ?? null,
            createdAt: item.createdAt,
          })),
          status: dorezime[0]?.status || "Në Pritje",
          vleresimi: dorezime[0]?.vleresimi ?? null,
          feedback: dorezime[0]?.feedbackText || "Nuk ka feedback akoma",
        }));
      } catch (error) {
        console.error("Error fetching idea files:", error);
        setFeedbackData((prev) => ({
          ...prev,
          dorezime: [],
        }));
      }
    };

    fetchIdejaFiles();
  }, [lendaId]);

  // Render DOCX preview inline when fileUrl is available
  const fileUrl = feedbackData.idejaFile?.fileUrl;
  // Office embed removed for local-only usage
  const officeHostNote = "";
  const officeViewUrl = null;

  // Shto stile të reja para return statement
  const backButtonStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(184,227,233,0.25)",
    borderRadius: 10,
    padding: "0.6rem 1.2rem",
    color: "#B8E3E9",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    marginTop: "1.5rem"
  };

  return (
    <div className="feedback-container student-theme">
      <header className="feedback-header">
        <div className="logo">Feedelate</div>
        <nav className="feedback-nav">
          <span className="nav-text"><strong>Lenda:</strong> {feedbackData.lenda}</span>
         
        </nav>
      </header>

      <div className="feedback-content">
        <div className="feedback-display">
          <div className="display-row">
            <div className="display-group ideja-group">
              <label>Idetë e Dorëzuara ({feedbackData.dorezime.length})</label>
              <div className="display-box file-box" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {feedbackData.dorezime.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>
                    Nuk ka dorëzime për këtë lëndë
                  </div>
                ) : (
                  feedbackData.dorezime.map((dorezim) => (
                    <div key={dorezim.id} className="file-item" style={{ marginBottom: '1rem', padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="file-icon" aria-hidden="true"></div>
                      <div className="file-info">
                        <p className="file-name">{dorezim.fileName}</p>
                        <p className="file-type">Word Document</p>
                        <p style={{ fontSize: '11px', opacity: 0.7, marginTop: '0.25rem' }}>
                          Dorëzuar: {new Date(dorezim.createdAt).toLocaleString('sq-AL')}
                        </p>
                      </div>
                      {dorezim.fileUrl && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <a
                            href={dorezim.fileUrl}
                            download={dorezim.fileName}
                            className="download-btn download-btn--small"
                            aria-label="Shkarko dokumentin"
                          >
                            Shkarko
                          </a>
                          <button
                            onClick={() => handleDelete(dorezim.id)}
                            disabled={isDeleting}
                            className="delete-btn delete-btn--small"
                            aria-label="Fshi dorëzimin"
                            style={{
                              padding: '0.6rem 1.1rem',
                              borderRadius: '8px',
                              border: '1px solid rgba(184,227,233,0.25)',
                              background: 'rgba(79,124,130,0.35)',
                              color: '#B8E3E9',
                              cursor: isDeleting ? 'not-allowed' : 'pointer',
                              fontSize: '13px',
                              fontWeight: 600,
                              opacity: isDeleting ? 0.5 : 1
                            }}
                          >
                            {isDeleting ? 'Duke fshirë...' : 'Fshi'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="display-group feedback-group">
              <label>Feedback</label>
              <div className="display-box feedback-box">
                <span className="feedback-empty">{feedbackData.feedback}</span>
              </div>
            </div>
          </div>

          <button type="button" onClick={handleBack} style={backButtonStyle}>
            ← Kthehu mbrapa
          </button>
        </div>
      </div>

      <footer className="feedback-footer">
        <p>&copy; 2025/2026 Feedelate - Universiteti Publik Kadri Zeka</p>
      </footer>

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
}

export default Feedback;