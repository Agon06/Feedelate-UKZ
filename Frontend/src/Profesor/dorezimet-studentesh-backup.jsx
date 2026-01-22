import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStudentProjectSubmissions } from '../services/profesorApi';

const DoreziметStudentesh = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subject, lendaId } = location.state || {};
  
  const PROFESOR_ID = 1;
  const [submissions, setSubmissions] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null });
  const [isMobile, setIsMobile] = useState(false);
  const [bulkStatus, setBulkStatus] = useState({ loading: false, error: null });
  const [mockUrls, setMockUrls] = useState([]);

  // Pastrimi i URL-ve të krijuara për mock kur komponenti ç'instalohet
  useEffect(() => {
    return () => {
      mockUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [mockUrls]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!lendaId) {
      setStatus({ loading: false, error: 'Lenda nuk është zgjedhur.' });
      return;
    }

    let isMounted = true;
    setStatus({ loading: true, error: null });

    const fetchSubmissions = async () => {
      try {
        const data = await getStudentProjectSubmissions(PROFESOR_ID, lendaId);
        if (!isMounted) return;

        const fetched = data.submissions || [];

        if (fetched.length === 0) {
          // krijo disa projekte mock për testimin e shkarkimit
          const mockData = [
            { id: 1, student: { id: 101, fullName: 'Arta Krasniqi' }, fileName: 'Projekti_UI.docx' },
            { id: 2, student: { id: 102, fullName: 'Blend Morina' }, fileName: 'Analiza_Sigurise.pdf' },
            { id: 3, student: { id: 103, fullName: 'Diona Shabani' }, fileName: 'Platforma_Web.zip' },
          ];

          // krijojmë blob URL që fetch t’i lexojë për arkivin zip
          const urls = mockData.map((item) => {
            const content = [
              `Ky është një file testues për projektin: ${item.fileName}`,
              `Studenti: ${item.student.fullName}`,
              `Lënda: ${subject || 'Lënda'}`,
              '',
              'Ky përmbajtje është vetëm për testimin e shkarkimit bulk (.zip).'
            ].join('\n');
            const blob = new Blob([content], { type: 'application/octet-stream' });
            return URL.createObjectURL(blob);
          });

          const mockSubmissions = mockData.map((item, idx) => ({
            ...item,
            fileUrl: urls[idx],
            createdAt: new Date(Date.now() - (idx + 1) * 3600_000).toISOString(),
          }));

          setMockUrls(urls);
          setSubmissions(mockSubmissions);
        } else {
          setSubmissions(fetched);
          // nëse kishim mock më parë, i pastrojmë
          mockUrls.forEach((u) => URL.revokeObjectURL(u));
          setMockUrls([]);
        }

        setStatus({ loading: false, error: null });
      } catch (error) {
        if (!isMounted) return;
        setStatus({
          loading: false,
          error: error?.message ?? 'Nuk u lexuan projektet e studentëve.',
        });
      }
    };

    fetchSubmissions();

    return () => {
      isMounted = false;
    };
  }, [lendaId]);

  const profesorName = 'Profesor';
  const avatarLetter = 'P';

  const pageStyle = {
    color: '#fff',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, rgba(10,18,12,1) 0%, rgba(14,28,20,1) 50%, rgba(12,30,18,1) 100%)',
    fontFamily: 'Inter, system-ui, Arial, sans-serif'
  };

  const topBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? '0.85rem 1.5rem' : '1rem 2.5rem'
  };

  const brandStyle = {
    color: '#17c77a',
    fontWeight: 800,
    fontSize: isMobile ? 18 : 22,
    letterSpacing: 0.6
  };

  const actionsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 10 : 18
  };

  const bellStyle = {
    width: 40,
    height: 40,
    borderRadius: 20,
    background: 'rgba(23, 199, 122, 0.12)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    color: '#fbd38d'
  };

  const avatarStyle = {
    width: 42,
    height: 42,
    borderRadius: 21,
    background: '#0e6b3d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700
  };

  const layoutStyle = {
    padding: isMobile ? '1rem' : '0 3.5rem 3rem'
  };

  const headerRow = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: isMobile ? 12 : 24,
    flexWrap: 'wrap',
    gap: 12
  };

  const backButton = {
    border: '1px solid rgba(23, 199, 122, 0.5)',
    color: '#17c77a',
    background: 'transparent',
    padding: '0.4rem 0.9rem',
    borderRadius: 999,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6
  };

  const bannerStyle = {
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: '0.85rem 1rem',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: 600,
  };

  const submissionCard = {
    background: 'rgba(13, 30, 19, 0.85)',
    border: '1px solid rgba(23, 199, 122, 0.35)',
    borderRadius: 14,
    padding: isMobile ? '1rem' : '1.25rem',
    marginTop: 16,
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'flex-start' : 'center',
    justifyContent: 'space-between',
    gap: 12
  };

  const studentInfo = {
    flex: 1
  };

  const downloadButton = {
    padding: '0.5rem 1rem',
    background: '#19c776',
    border: 'none',
    borderRadius: 8,
    color: '#041407',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 14,
    textDecoration: 'none',
    display: 'inline-block'
  };

  const feedbackButton = {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid rgba(23,199,122,0.35)',
    borderRadius: 8,
    color: '#c8f5e8',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 14,
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 200ms ease'
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBulkDownload = async () => {
    if (!submissions.length) return;

    setBulkStatus({ loading: true, error: null });

    try {
      const zip = new JSZip();

      for (const submission of submissions) {
        const response = await fetch(submission.fileUrl);
        if (!response.ok) throw new Error('Nuk u shkarkua një nga file-t e projektit.');

        const blob = await response.blob();
        const safeStudent = (submission.student.fullName || 'student').replace(/\s+/g, '_');
        const safeFile = (submission.fileName || 'projekti').replace(/\s+/g, '_');
        zip.file(`${safeStudent}_${safeFile}`, blob);
      }

      const archiveBlob = await zip.generateAsync({ type: 'blob' });
      const archiveName = `${(subject || 'projekti').replace(/\s+/g, '_')}_projektet_student.zip`;
      triggerDownload(archiveBlob, archiveName);
      setBulkStatus({ loading: false, error: null });
    } catch (error) {
      setBulkStatus({ loading: false, error: error?.message ?? 'Nuk u krijua arkivi i projekteve.' });
    }
  };

  return (
    <div style={pageStyle}>
      <div style={topBarStyle}>
        <div style={brandStyle}>Feedelate</div>
        <div style={{ flex: 1 }} />
        <div style={actionsStyle}>
          <div style={bellStyle}>🔔</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
            <div style={avatarStyle}>{avatarLetter}</div>
            <span>{profesorName}</span>
          </div>
        </div>
      </div>

      <div style={layoutStyle}>
        <div style={headerRow}>
          <button style={backButton} onClick={() => navigate(-1)}>
            ← Kthehu
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>
              Projektet - {subject || 'Lënda'}
            </h2>
            {!status.loading && !status.error && submissions.length > 0 && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  style={feedbackButton} 
                  onClick={() => navigate('/profesor/feedback', { state: { lendaId, subject, feedbackType: 'projects' } })}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(23, 199, 122, 0.15)';
                    e.currentTarget.style.borderColor = '#17c77a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(23,199,122,0.35)';
                  }}
                >
                  Feedback i Përgjithshëm
                </button>
                <button style={downloadButton} onClick={handleBulkDownload} disabled={bulkStatus.loading}>
                  {bulkStatus.loading ? 'Duke paketuar...' : '⬇ Shkarko të gjitha (.zip)'}
                </button>
              </div>
            )}
          </div>
        </div>

        {bulkStatus.error && (
          <div style={{ ...bannerStyle, background: 'rgba(255,82,82,0.2)', border: '1px solid rgba(255,82,82,0.5)' }}>
            {bulkStatus.error}
          </div>
        )}

        {status.loading && (
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            Duke u ngarkuar projektet...
          </div>
        )}

        {status.error && (
          <div style={{ ...bannerStyle, background: 'rgba(255,82,82,0.2)', border: '1px solid rgba(255,82,82,0.5)' }}>
            {status.error}
          </div>
        )}

        {!status.loading && !status.error && submissions.length === 0 && (
          <div style={{ ...bannerStyle, background: 'rgba(23, 199, 122, 0.1)' }}>
            Nuk ka projekte për këtë lëndë ende.
          </div>
        )}

        {!status.loading && !status.error && submissions.length > 0 && (
          <div>
            {submissions.map((submission) => (
              <div key={submission.id} style={submissionCard}>
                <div style={studentInfo}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1fdc8c' }}>
                    {submission.student.fullName}
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
                    Dorëzuar: {new Date(submission.createdAt).toLocaleString('sq-AL')}
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>
                    {submission.fileName}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={downloadButton}
                    onClick={() => handleDownload(submission.fileUrl, submission.fileName)}
                  >
                    ⬇ Shkarko
                  </button>
                  <button
                    style={feedbackButton}
                    onClick={() => navigate('/profesor/feedback', { 
                      state: { 
                        lendaId, 
                        subject, 
                        studentId: submission.student.id,
                        studentName: submission.student.fullName,
                        submissionId: submission.id,
                        fileName: submission.fileName,
                        createdAt: submission.createdAt
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
        )}
      </div>
    </div>
  );
};

export default DoreziметStudentesh;
