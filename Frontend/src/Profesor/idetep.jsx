import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProfesorIdeas } from '../services/profesorApi';
import './idetep.css';

const Idetep = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const subjectName = location.state?.subject ?? 'Lëndë e pa specifikuar';
  const lendaId = location.state?.lendaId ?? null;
  const PROFESOR_ID = 1;

  const [ideas, setIdeas] = useState([]);
  const [listStatus, setListStatus] = useState({ loading: true, error: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState([]);
  const [filesStatus, setFilesStatus] = useState({ loading: true, error: null });
  const [fileSearchTerm, setFileSearchTerm] = useState('');

  const loadIdeas = useCallback(async () => {
    setListStatus({ loading: true, error: null });
    try {
      const response = await getProfesorIdeas(PROFESOR_ID, lendaId);
      setIdeas(response);
      setListStatus({ loading: false, error: null });
    } catch (error) {
      setListStatus({
        loading: false,
        error: error?.message ?? 'Nuk u lexuan idetë aktuale.',
      });
    }
  }, [PROFESOR_ID, lendaId]);

  const loadFiles = useCallback(async () => {
    setFilesStatus({ loading: true, error: null });
    try {
      // Mock data për tani - në të ardhmen do të vijnë nga API
      const mockFiles = [
        { id: 1, fileName: 'Projekti_Final.docx', studentName: 'Agon Berisha', uploadDate: '2024-01-10', fileSize: '2.3 MB', ideaTitle: 'Sistema e Menaxhimit' },
        { id: 2, fileName: 'Detyra_Semestri.docx', studentName: 'Arta Krasniqi', uploadDate: '2024-01-12', fileSize: '1.8 MB', ideaTitle: 'Aplikacioni Mobil' },
        { id: 3, fileName: 'Raporti_Hulumtimi.docx', studentName: 'Blend Morina', uploadDate: '2024-01-09', fileSize: '3.1 MB', ideaTitle: 'Web Platform' },
      ].sort((a, b) => a.studentName.localeCompare(b.studentName, 'sq'));
      
      setFiles(mockFiles);
      setFilesStatus({ loading: false, error: null });
    } catch (error) {
      setFilesStatus({
        loading: false,
        error: error?.message ?? 'Nuk u lexuan file-t aktuale.',
      });
    }
  }, []);

  useEffect(() => {
    loadIdeas();
    loadFiles();
  }, [loadIdeas, loadFiles]);

  const handleFeedback = () => {
    navigate('/profesor/feedback', {
      state: {
        lendaId: lendaId,
        subject: subjectName,
        feedbackType: 'ideas' // Dallojmë feedback-un e përgjithshëm për IDE
      }
    });
  };

  const handleDownloadFile = (file) => {
    alert(`Duke shkarkuar: ${file.fileName}`);
  };

  const handleDownloadAllFiles = () => {
    alert('Duke shkarkuar të gjitha file-t në format .rar...');
  };

  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, rgba(10,18,12,1) 0%, rgba(14,28,20,1) 60%, rgba(10,18,12,1) 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, system-ui, sans-serif',
    padding: '2rem',
    overflow: 'hidden'
  };

  const modalStyle = {
    width: 'min(1400px, 100%)',
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
    cursor: 'pointer',
    transition: 'all 200ms ease'
  };

  const columnsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
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
    gap: '0.8rem',
    maxHeight: '320px',
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingRight: '0.5rem'
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

  const tinyButton = {
    borderRadius: 10,
    border: '1px solid rgba(23,199,122,0.35)',
    background: 'transparent',
    color: '#c8f5e8',
    fontSize: 12,
    padding: '0.35rem 0.6rem',
    cursor: 'pointer',
    marginLeft: 8,
    transition: 'all 200ms ease'
  };

  const downloadButton = {
    borderRadius: 10,
    border: '1px solid rgba(100,149,237,0.35)',
    background: 'transparent',
    color: '#6495ed',
    fontSize: 12,
    padding: '0.35rem 0.6rem',
    cursor: 'pointer',
    marginLeft: 8,
    transition: 'all 200ms ease'
  };

  const tagStyle = {
    fontSize: 12,
    borderRadius: 999,
    padding: '0.25rem 0.7rem',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#d0f5e5'
  };

  const primaryButton = {
    borderRadius: 12,
    border: 'none',
    background: '#19c776',
    color: '#041407',
    fontWeight: 700,
    padding: '0.8rem 1.6rem',
    cursor: 'pointer',
    transition: 'all 200ms ease'
  };

  const secondaryButton = {
    borderRadius: 12,
    border: '1px solid rgba(23,199,122,0.35)',
    background: 'transparent',
    color: '#c8f5e8',
    fontWeight: 600,
    padding: '0.8rem 1.6rem',
    cursor: 'pointer',
    transition: 'all 200ms ease'
  };

  const footerStyle = {
    marginTop: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between'
  };

  return (
    <div style={pageStyle}>
      <div style={modalStyle}>
        <button 
          style={closeButtonStyle} 
          onClick={() => navigate(-1)} 
          aria-label="Mbyll"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          ✕
        </button>
        
        <h2 style={{ margin: '0 0 0.5rem', fontSize: 26, fontWeight: 800 }}>
          {subjectName}
        </h2>
        <p style={{ margin: 0, opacity: 0.75, fontSize: 15 }}>
          Idetë dhe file-t e dërguara nga studentët për këtë lëndë.
        </p>

        <div style={columnsStyle}>
          {/* Box për Ide */}
          <div style={columnCard}>
            <h3 style={{ margin: '0 0 1rem', fontSize: 18, color: '#1fdc8c' }}>📋 Lista e Ideve</h3>
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
              {!listStatus.loading && !listStatus.error && ideas
                .filter(idea => 
                  idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  idea.shorthand.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .sort((a, b) => (a.student?.fullName || '').localeCompare(b.student?.fullName || '', 'sq'))
                .length === 0 && (
                <div style={{ textAlign: 'center', opacity: 0.8 }}>
                  {searchTerm ? 'Nuk u gjet asnjë ide me këtë kriter.' : 'Ende nuk ka ide për këtë lëndë.'}
                </div>
              )}
              {!listStatus.loading && !listStatus.error && ideas
                .filter(idea => 
                  idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  idea.shorthand.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .sort((a, b) => (a.student?.fullName || '').localeCompare(b.student?.fullName || '', 'sq'))
                .map((idea) => (
                <div key={idea.id} style={ideaItem}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{idea.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                      {idea.subject?.name && <span>{idea.subject.name}</span>}
                      {idea.student?.fullName && (
                        <span>
                          {idea.subject?.name ? ' • ' : ''}
                          {idea.student.fullName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={tagStyle}>{idea.shorthand}</span>
                    <button
                      style={tinyButton}
                      onClick={() => navigate('/profesor/feedback', { state: { lendaId, subject: subjectName, ideaId: idea.id } })}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(23, 199, 122, 0.15)';
                        e.currentTarget.style.borderColor = '#17c77a';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(23,199,122,0.35)';
                      }}
                    >
                      Feedback
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: '1.5rem' }}>
              <button
                style={{ ...secondaryButton, flex: 1 }}
                onClick={loadIdeas}
                disabled={listStatus.loading}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(23, 199, 122, 0.1)';
                  e.currentTarget.style.borderColor = '#17c77a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(23,199,122,0.35)';
                }}
              >
                Rifresko listën
              </button>
              <button
                style={{ ...primaryButton, flex: 1 }}
                onClick={() => {
                  const rows = ideas.map(i => ({
                    Titulli: i.title,
                    Shkurtesa: i.shorthand,
                    Lenda: i.subject?.name ?? '',
                    Student: i.student?.fullName ?? ''
                  }));
                  const header = ['Titulli','Shkurtesa','Lenda','Student'];
                  const csv = [header.join(','), ...rows.map(r => header.map(h => `"${String(r[h] ?? '').replace(/"/g,'""')}"`).join(','))].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `idet_${subjectName.replace(/\s+/g,'_')}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(25, 199, 118, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                ⬇ Shkarko të gjitha
              </button>
            </div>
          </div>

          {/* Box për File-t Word */}
          <div style={columnCard}>
            <h3 style={{ margin: '0 0 1rem', fontSize: 18, color: '#6495ed' }}>📄 File-t e Dërguara</h3>
            <input 
              type="text" 
              placeholder="Kërko file..." 
              style={searchInput}
              value={fileSearchTerm}
              onChange={(e) => setFileSearchTerm(e.target.value)}
            />
            <div style={ideaList} className="idea-list-scroll">
              {filesStatus.loading && (
                <div style={{ textAlign: 'center', opacity: 0.8 }}>Duke u ngarkuar...</div>
              )}
              {filesStatus.error && (
                <div style={{ textAlign: 'center', color: '#f8b4b4' }}>{filesStatus.error}</div>
              )}
              {!filesStatus.loading && !filesStatus.error && files
                .filter(file => 
                  file.fileName.toLowerCase().includes(fileSearchTerm.toLowerCase()) ||
                  file.studentName.toLowerCase().includes(fileSearchTerm.toLowerCase())
                )
                .length === 0 && (
                <div style={{ textAlign: 'center', opacity: 0.8 }}>
                  {fileSearchTerm ? 'Nuk u gjet asnjë file me këtë kriter.' : 'Ende nuk ka file të dërguar.'}
                </div>
              )}
              {!filesStatus.loading && !filesStatus.error && files
                .filter(file => 
                  file.fileName.toLowerCase().includes(fileSearchTerm.toLowerCase()) ||
                  file.studentName.toLowerCase().includes(fileSearchTerm.toLowerCase())
                )
                .map((file) => (
                <div key={file.id} style={ideaItem}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>📝 {file.fileName}</div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                      <span>{file.studentName}</span>
                      <span style={{ margin: '0 0.5rem' }}>•</span>
                      <span>{file.fileSize}</span>
                      <span style={{ margin: '0 0.5rem' }}>•</span>
                      <span>{file.uploadDate}</span>
                    </div>
                    {file.ideaTitle && (
                      <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                        Ideja: {file.ideaTitle}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      style={downloadButton}
                      onClick={() => handleDownloadFile(file)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(100, 149, 237, 0.15)';
                        e.currentTarget.style.borderColor = '#6495ed';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(100,149,237,0.35)';
                      }}
                    >
                      ⬇ Shkarko
                    </button>
                    <button
                      style={tinyButton}
                      onClick={() => navigate('/profesor/feedback', { 
                        state: { 
                          lendaId, 
                          subject: subjectName, 
                          fileId: file.id,
                          studentName: file.studentName,
                          fileName: file.fileName,
                          uploadDate: file.uploadDate,
                          ideaTitle: file.ideaTitle,
                          feedbackType: 'idea-file'
                        } 
                      })}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(23, 199, 122, 0.15)';
                        e.currentTarget.style.borderColor = '#17c77a';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(23,199,122,0.35)';
                      }}
                    >
                      Feedback
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: '1.5rem' }}>
              <button
                style={{ ...secondaryButton, flex: 1 }}
                onClick={loadFiles}
                disabled={filesStatus.loading}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(23, 199, 122, 0.1)';
                  e.currentTarget.style.borderColor = '#17c77a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(23,199,122,0.35)';
                }}
              >
                Rifresko listën
              </button>
              <button
                style={{ ...primaryButton, flex: 1 }}
                onClick={handleDownloadAllFiles}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(25, 199, 118, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                📦 Shkarko të gjitha (.rar)
              </button>
            </div>
          </div>

        </div>

        <div style={footerStyle}>
          <button 
            style={secondaryButton} 
            onClick={handleFeedback}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(23, 199, 122, 0.1)';
              e.currentTarget.style.borderColor = '#17c77a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(23,199,122,0.35)';
            }}
          >
            Feedback
          </button>
        </div>
      </div> 
    </div>
  );
};

export default Idetep;
