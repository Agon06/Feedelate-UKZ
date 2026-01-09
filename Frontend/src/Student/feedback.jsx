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
    idejaFile: {
      fileName: "Duke u ngarku...",
      fileUrl: null, // Will be fetched from backend
    },
    feedback: "Shpjegime shumë të mira dhe të qarta",
  });

  const [dorezimId, setDorezimId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle Office embed for exact layout
  const [showOfficeView, setShowOfficeView] = useState(false);

  const handleBack = () => {
    navigate(-1); // Go back in browser history instead of hardcoding route
  };

  const handleDelete = async () => {
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
      navigate(-1);
    } catch (error) {
      console.error("Error deleting dorezim:", error);
      alert(error?.message || "Dështoi fshirja e dorezimit");
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch Word file from dorezimiides table using lendaId
  useEffect(() => {
    const fetchIdejaFile = async () => {
      if (!lendaId) {
        console.log("lendaId not provided");
        return;
      }
      try {
        const data = await getStudentIdeaSubmission(STUDENT_ID, lendaId);
        
        // Update feedbackData with fetched file (ensure absolute URL to backend uploads)
        setFeedbackData((prev) => ({
          ...prev,
          idejaFile: {
            fileName: data.fileName || "Idea_Submission.docx",
            fileUrl: data.fileUrl
              ? (/^https?:\/\//i.test(data.fileUrl) ? data.fileUrl : `${API_ORIGIN}${data.fileUrl}`)
              : (data.fileDorezimi ? `${API_ORIGIN}/uploads/dorezime/${data.fileDorezimi}` : null),
          },
          status: data.status || "Në Pritje",
          vleresimi: data.vleresimi ?? null,
          feedback: data.feedbackText || prev.feedback,
        }));
        setDorezimId(data.id);
      } catch (error) {
        console.error("Error fetching idea file:", error);
        setFeedbackData((prev) => ({
          ...prev,
          idejaFile: {
            fileName: "Nuk u gjet file",
            fileUrl: null,
          },
        }));
      }
    };

    fetchIdejaFile();
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
              <label>Ideja</label>
              <div className="display-box file-box">
                <div className="file-item">
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <p className="file-name">{feedbackData.idejaFile.fileName}</p>
                    <p className="file-type">Word Document</p>
                  </div>
                  {feedbackData.idejaFile.fileUrl && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <a href={feedbackData.idejaFile.fileUrl} download className="download-btn download-btn--small" aria-label="Shkarko dokumentin">
                        ⬇ Shkarko
                      </a>
                      <button 
                        onClick={handleDelete} 
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
                {/* Office embed hidden in local-only mode */}
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