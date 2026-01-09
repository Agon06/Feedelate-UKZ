import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./feedback.css";
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

  // Data coming from backend
  const [feedbackData, setFeedbackData] = useState({
    lenda: selectedLenda,
    profesor: "Prof. Xhavit Rama",
    status: "Në Pritje",
    vleresimi: null, // Will be populated from backend
    dorezime: [], // Lista e dorëzimeve
    feedback: "Shpjegime shumë të mira dhe të qarta",
  });

  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle Office embed for exact layout
  const [showOfficeView, setShowOfficeView] = useState(false);

  const handleBack = () => {
    navigate(-1); // Go back in browser history instead of hardcoding route
  };

  const handleDelete = async (dorezimId) => {
    if (!dorezimId) {
      alert("Dorezim ID nuk u gjet");
      return;
    }

    if (!window.confirm("A jeni të sigurt që doni të fshini këtë dorëzim?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteStudentDorezim(STUDENT_ID, dorezimId);
      alert("Dorezimi u fshi me sukses!");
      // Rifreskon listën
      setFeedbackData(prev => ({
        ...prev,
        dorezime: prev.dorezime.filter(d => d.id !== dorezimId)
      }));
    } catch (error) {
      console.error("Error deleting dorezim:", error);
      alert(error?.message || "Dështoi fshirja e dorezimit");
    } finally {
      setIsDeleting(false);
    }
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
          feedback: dorezime[0]?.feedbackText || prev.feedback,
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

  return (
    <div className="feedback-container">
      <header className="feedback-header">
        <div className="logo">Feedelate</div>
        <nav className="feedback-nav">
          <span className="nav-text"><strong>Lenda:</strong> {feedbackData.lenda}</span>
          <span className="nav-text"><strong>Proti:</strong> {feedbackData.profesor}</span>
        </nav>
      </header>

      <div className="feedback-content">
        <div className="status-bar">
          <div className="status-info">
            <span className="status-label"><strong>Statusi:</strong> {feedbackData.status}</span>
            {feedbackData.vleresimi && (
              <span className="vleresimi-label"><strong>Vleresimi:</strong> {feedbackData.vleresimi}/10</span>
            )}
          </div>
        </div>

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
                      <div className="file-icon">📄</div>
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
                            ⬇ Shkarko
                          </a>
                          <button
                            onClick={() => handleDelete(dorezim.id)}
                            disabled={isDeleting}
                            className="delete-btn delete-btn--small"
                            aria-label="Fshi dorëzimin"
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '8px',
                              border: '1px solid rgba(255,82,82,0.5)',
                              background: 'rgba(255,82,82,0.15)',
                              color: '#ff5252',
                              cursor: isDeleting ? 'not-allowed' : 'pointer',
                              fontSize: '13px',
                              fontWeight: 600,
                              opacity: isDeleting ? 0.5 : 1
                            }}
                          >
                            {isDeleting ? '🗑️ Duke fshirë...' : '🗑️ Fshi'}
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
              <div className="display-box">{feedbackData.feedback}</div>
            </div>
          </div>

          <button type="button" onClick={handleBack} className="back-btn">← Kthehu mbrapa</button>
        </div>
      </div>

      <footer className="feedback-footer">
        <p>&copy; 2025/2026 Feedelate - Universiteti Publik Kadri Zeka</p>
      </footer>
    </div>
  );
}

export default Feedback;