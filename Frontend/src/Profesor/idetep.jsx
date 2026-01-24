import React, { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProfesorIdeas, getStudentSubmissions, getIdeaDeadline, updateIdeaDeadline } from '../services/profesorApi';
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
  const [ideaDeadline, setIdeaDeadline] = useState({ start: '', end: '' });
  const [deadlineStatus, setDeadlineStatus] = useState({ loading: true, saving: false, error: null, message: null });

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
    if (!lendaId) {
      setFilesStatus({ loading: false, error: null });
      setFiles([]);
      return;
    }

    setFilesStatus({ loading: true, error: null });
    try {
      const response = await getStudentSubmissions(PROFESOR_ID, lendaId);
      const filesData = (response.submissions || []).map(file => ({
        id: file.id,
        fileName: file.fileName,
        studentName: file.student?.fullName || 'N/A',
        fileSize: 'N/A', // Backend nuk e kthen madhësinë, mund të shtohet më vonë
        uploadDate: new Date(file.createdAt).toLocaleDateString('sq-AL'),
        fileUrl: file.fileUrl,
        ideaTitle: null, // Mund të lidhet me idetë nëse nevojitet
      }));
      setFiles(filesData);
      setFilesStatus({ loading: false, error: null });
    } catch (error) {
      setFilesStatus({
        loading: false,
        error: error?.message ?? 'Nuk u lexuan file-t aktuale.',
      });
    }
  }, [PROFESOR_ID, lendaId]);

  const loadIdeaDeadline = useCallback(async () => {
    if (!lendaId) {
      setIdeaDeadline({ start: '', end: '' });
      setDeadlineStatus({ loading: false, saving: false, error: null, message: null });
      return;
    }

    setDeadlineStatus({ loading: true, saving: false, error: null, message: null });
    try {
      const response = await getIdeaDeadline(PROFESOR_ID, lendaId);
      const startValue = response.lenda?.ideaStartDate ? response.lenda.ideaStartDate.slice(0, 16) : '';
      const endValue = response.lenda?.ideaDeadline ? response.lenda.ideaDeadline.slice(0, 16) : '';
      setIdeaDeadline({ start: startValue, end: endValue });
      setDeadlineStatus({ loading: false, saving: false, error: null, message: null });
    } catch (error) {
      setDeadlineStatus({ loading: false, saving: false, error: error?.message ?? 'Nuk u lexuan afatet.', message: null });
    }
  }, [PROFESOR_ID, lendaId]);

  useEffect(() => {
    loadIdeas();
    loadFiles();
    loadIdeaDeadline();
  }, [loadIdeas, loadFiles, loadIdeaDeadline]);

  const handleFeedback = () => {
    navigate('/profesor/feedback', {
      state: {
        lendaId: lendaId,
        subject: subjectName,
        feedbackType: 'ideas' // Dallojmë feedback-un e përgjithshëm për IDE
      }
    });
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

  const handleDownloadFile = (file) => {
    const API_BASE_URL = (import.meta.env?.VITE_API_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');
    const baseUrl = API_BASE_URL.replace('/api', '');
    const downloadUrl = `${baseUrl}${file.fileUrl}`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.fileName;
    link.setAttribute('download', file.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllFiles = async () => {
    if (!files.length) return;

    setFilesStatus((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const API_BASE_URL = (import.meta.env?.VITE_API_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');
      const baseUrl = API_BASE_URL.replace('/api', '');
      const zip = new JSZip();

      // Download all files and add to zip
      for (const file of files) {
        try {
          const downloadUrl = `${baseUrl}${file.fileUrl}`;
          const response = await fetch(downloadUrl);
          const blob = await response.blob();
          const safeName = file.fileName.replace(/\s+/g, '_');
          zip.file(safeName, blob);
        } catch (err) {
          console.error('Error downloading file:', file.fileName, err);
        }
      }

      const archiveBlob = await zip.generateAsync({ type: 'blob' });
      const archiveName = `${subjectName.replace(/\s+/g, '_')}_idet_student.zip`;
      triggerDownload(archiveBlob, archiveName);
      setFilesStatus((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      setFilesStatus({ loading: false, error: error?.message ?? 'Nuk u krijua arkivi.' });
    }
  };

  const setDatePart = (field, dateStr) => {
    if (!dateStr) {
      setIdeaDeadline((prev) => ({ ...prev, [field]: '' }));
      return;
    }
    const defaultTime = field === 'end' ? '23:59' : '00:00';
    setIdeaDeadline((prev) => ({ ...prev, [field]: `${dateStr}T${defaultTime}` }));
  };

  const pad2 = (n) => String(n).padStart(2, '0');

  const get24hParts = (value) => {
    if (!value) return { hour: '00', minute: '00' };
    const parts = value.split('T')[1];
    if (!parts) return { hour: '00', minute: '00' };
    const [h, m] = parts.split(':');
    return { hour: pad2(Number(h) || 0), minute: pad2(Number(m) || 0) };
  };

  const setTime24 = (field, hourStr, minuteStr) => {
    const h = pad2(Math.min(Math.max(Number(hourStr) || 0, 0), 23));
    const m = pad2(Math.min(Math.max(Number(minuteStr) || 0, 0), 59));
    setIdeaDeadline((prev) => {
      const current = prev[field];
      const datePart = current?.split('T')[0] || new Date().toISOString().slice(0, 10);
      return { ...prev, [field]: `${datePart}T${h}:${m}` };
    });
  };

  const normalizeDateInput = (value) => {
    if (!value) return null;
    // Ensure seconds are present for backend format
    if (value.length === 16) return `${value}:00`;
    if (value.length === 19) return value;
    return value;
  };

  const formatDateDisplay = (value) => {
    if (!value) return 'Nuk është caktuar';
    const [datePart, timePart] = value.split('T');
    const timeClean = (timePart ?? '').slice(0, 5);
    return timeClean ? `${datePart} ${timeClean}`.trim() : datePart;
  };

  const handleSaveDeadline = async () => {
    if (!lendaId) {
      setDeadlineStatus({ loading: false, saving: false, error: 'Zgjidh lëndën përpara se të caktosh afatin.', message: null });
      return;
    }

    const payload = {
      ideaStartDate: normalizeDateInput(ideaDeadline.start),
      ideaDeadline: normalizeDateInput(ideaDeadline.end),
    };

    if (payload.ideaStartDate && payload.ideaDeadline && payload.ideaStartDate > payload.ideaDeadline) {
      setDeadlineStatus({ loading: false, saving: false, error: 'Data e fillimit duhet të jetë para afatit.', message: null });
      return;
    }

    setDeadlineStatus({ loading: false, saving: true, error: null, message: null });
    try {
      const response = await updateIdeaDeadline(PROFESOR_ID, lendaId, payload);
      const startValue = response.lenda?.ideaStartDate ? response.lenda.ideaStartDate.slice(0, 16) : '';
      const endValue = response.lenda?.ideaDeadline ? response.lenda.ideaDeadline.slice(0, 16) : '';
      setIdeaDeadline({ start: startValue, end: endValue });
      setDeadlineStatus({ loading: false, saving: false, error: null, message: 'Afati u ruajt me sukses.' });
    } catch (error) {
      setDeadlineStatus({ loading: false, saving: false, error: error?.message ?? 'Nuk u ruajt afati.', message: null });
    }
  };

  const handleClearDeadline = async () => {
    if (!lendaId) return;
    setDeadlineStatus({ loading: false, saving: true, error: null, message: null });
    try {
      const response = await updateIdeaDeadline(PROFESOR_ID, lendaId, { ideaStartDate: null, ideaDeadline: null });
      const startValue = response.lenda?.ideaStartDate ? response.lenda.ideaStartDate.slice(0, 16) : '';
      const endValue = response.lenda?.ideaDeadline ? response.lenda.ideaDeadline.slice(0, 16) : '';
      setIdeaDeadline({ start: startValue, end: endValue });
      setDeadlineStatus({ loading: false, saving: false, error: null, message: 'Afati u fshi.' });
    } catch (error) {
      setDeadlineStatus({ loading: false, saving: false, error: error?.message ?? 'Nuk u fshi afati.', message: null });
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

  const deadlineBar = {
    marginTop: '1.25rem',
    display: 'grid',
    gridTemplateColumns: 'minmax(360px, 1fr) minmax(260px, 0.8fr)',
    gap: '1rem',
    alignItems: 'stretch'
  };

  const deadlineCard = {
    background: 'rgba(8,16,12,0.9)',
    borderRadius: 18,
    border: '1px solid rgba(23,199,122,0.3)',
    padding: '1rem 1.1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem'
  };

  const deadlineLabel = {
    fontSize: 14,
    fontWeight: 700,
    color: '#1fdc8c',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    letterSpacing: '0.2px'
  };

  const deadlineInput = {
    width: '100%',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(6,12,9,0.7)',
    color: '#fff',
    padding: '0.65rem 0.75rem'
  };

  const compactRow = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '0.5rem',
    alignItems: 'center'
  };

  const timeSegments = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(90px, 1fr))',
    gap: '0.5rem',
    marginTop: 8
  };

  const timeSelect = {
    width: '100%',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(6,12,9,0.75)',
    color: '#fff',
    padding: '0.55rem 0.6rem'
  };

  const deadlineActions = {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap'
  };

  const deadlineSummary = {
    ...deadlineCard,
    borderColor: 'rgba(100,149,237,0.35)',
    background: 'rgba(6,12,9,0.8)'
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

        <div style={deadlineBar}>
          <div style={deadlineCard}>
            <div style={deadlineLabel}>
              <span role="img" aria-label="calendar">🗓️</span>
              Afati i dorëzimit të idesë
              {deadlineStatus.loading && <span style={{ fontSize: 12, color: '#cfeee0' }}>Duke u lexuar...</span>}
              {deadlineStatus.error && <span style={{ fontSize: 12, color: '#f8b4b4' }}>{deadlineStatus.error}</span>}
              {deadlineStatus.message && <span style={{ fontSize: 12, color: '#7be7b2' }}>{deadlineStatus.message}</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Fillimi</div>
                <div style={compactRow}>
                  <input
                    type="date"
                    style={deadlineInput}
                    value={ideaDeadline.start ? ideaDeadline.start.split('T')[0] : ''}
                    onChange={(e) => setDatePart('start', e.target.value)}
                    disabled={deadlineStatus.loading || deadlineStatus.saving}
                  />
                  <div style={timeSegments}>
                    <select
                      style={timeSelect}
                      value={get24hParts(ideaDeadline.start).hour}
                      onChange={(e) => setTime24('start', e.target.value, get24hParts(ideaDeadline.start).minute)}
                      disabled={deadlineStatus.loading || deadlineStatus.saving}
                    >
                      {Array.from({ length: 24 }, (_, i) => pad2(i)).map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <select
                      style={timeSelect}
                      value={get24hParts(ideaDeadline.start).minute}
                      onChange={(e) => setTime24('start', get24hParts(ideaDeadline.start).hour, e.target.value)}
                      disabled={deadlineStatus.loading || deadlineStatus.saving}
                    >
                      {Array.from({ length: 60 }, (_, i) => pad2(i)).map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Mbarimi</div>
                <div style={compactRow}>
                  <input
                    type="date"
                    style={deadlineInput}
                    value={ideaDeadline.end ? ideaDeadline.end.split('T')[0] : ''}
                    onChange={(e) => setDatePart('end', e.target.value)}
                    disabled={deadlineStatus.loading || deadlineStatus.saving}
                  />
                  <div style={timeSegments}>
                    <select
                      style={timeSelect}
                      value={get24hParts(ideaDeadline.end).hour}
                      onChange={(e) => setTime24('end', e.target.value, get24hParts(ideaDeadline.end).minute)}
                      disabled={deadlineStatus.loading || deadlineStatus.saving}
                    >
                      {Array.from({ length: 24 }, (_, i) => pad2(i)).map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <select
                      style={timeSelect}
                      value={get24hParts(ideaDeadline.end).minute}
                      onChange={(e) => setTime24('end', get24hParts(ideaDeadline.end).hour, e.target.value)}
                      disabled={deadlineStatus.loading || deadlineStatus.saving}
                    >
                      {Array.from({ length: 60 }, (_, i) => pad2(i)).map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div style={deadlineActions}>
              <button
                style={{ ...primaryButton, padding: '0.65rem 1.2rem' }}
                onClick={handleSaveDeadline}
                disabled={deadlineStatus.loading || deadlineStatus.saving}
              >
                {deadlineStatus.saving ? 'Duke ruajtur...' : 'Ruaj afatin'}
              </button>
              <button
                style={{ ...secondaryButton, padding: '0.65rem 1.2rem' }}
                onClick={handleClearDeadline}
                disabled={deadlineStatus.loading || deadlineStatus.saving || (!ideaDeadline.start && !ideaDeadline.end)}
              >
                Hiq afatin
              </button>
              <button
                style={{ ...secondaryButton, padding: '0.65rem 1.2rem' }}
                onClick={loadIdeaDeadline}
                disabled={deadlineStatus.loading}
              >
                Rifresko afatin
              </button>
            </div>
          </div>

          <div style={deadlineSummary}>
                <div style={{ ...deadlineLabel, color: '#6495ed' }}>
              <span role="img" aria-label="pin">📌</span>
              Datat e caktuara
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
              <div style={{ fontSize: 14 }}>
                <div style={{ opacity: 0.75, fontSize: 12 }}>Fillimi</div>
                <strong>{formatDateDisplay(normalizeDateInput(ideaDeadline.start) ?? '')}</strong>
              </div>
              <div style={{ fontSize: 14 }}>
                <div style={{ opacity: 0.75, fontSize: 12 }}>Mbarimi</div>
                <strong>{formatDateDisplay(normalizeDateInput(ideaDeadline.end) ?? '')}</strong>
              </div>
            </div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Këto data shfaqen si udhëzim për dorëzimin e ideve.
            </div>
          </div>
        </div>

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
                  idea.shorthand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (idea.studentName && idea.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .sort((a, b) => {
                  // Rendit studentët para, pastaj profesorin
                  if (a.type === 'student' && b.type === 'profesor') return -1;
                  if (a.type === 'profesor' && b.type === 'student') return 1;
                  // Nëse të dy janë të njëjtit tip, rendit alfabetikisht
                  if (a.type === 'student' && b.type === 'student') {
                    return (a.studentName || '').localeCompare(b.studentName || '', 'sq');
                  }
                  return 0;
                })
                .length === 0 && (
                  <div style={{ textAlign: 'center', opacity: 0.8 }}>
                    {searchTerm ? 'Nuk u gjet asnjë ide me këtë kriter.' : 'Ende nuk ka ide për këtë lëndë.'}
                  </div>
                )}
              {!listStatus.loading && !listStatus.error && ideas
                .filter(idea =>
                  idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  idea.shorthand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (idea.studentName && idea.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .sort((a, b) => {
                  // Rendit studentët para, pastaj profesorin
                  if (a.type === 'student' && b.type === 'profesor') return -1;
                  if (a.type === 'profesor' && b.type === 'student') return 1;
                  // Nëse të dy janë të njëjtit tip, rendit alfabetikisht
                  if (a.type === 'student' && b.type === 'student') {
                    return (a.studentName || '').localeCompare(b.studentName || '', 'sq');
                  }
                  return 0;
                })
                .map((idea) => (
                  <div key={`${idea.type}-${idea.id}`} style={ideaItem}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>
                        {idea.title}
                        {idea.type === 'student' && (
                          <span style={{
                            marginLeft: 8,
                            fontSize: 11,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: 'rgba(100, 200, 255, 0.15)',
                            color: '#64c8ff',
                            border: '1px solid rgba(100, 200, 255, 0.3)'
                          }}>
                            Student
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                        {idea.subject?.name && <span>{idea.subject.name}</span>}
                        {idea.studentName && (
                          <span>
                            {idea.subject?.name ? ' • ' : ''}
                            {idea.studentName}
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
                    Student: i.studentName ?? 'Profesor',
                    Tipi: i.type === 'student' ? 'Student' : 'Profesor'
                  }));
                  const header = ['Titulli', 'Shkurtesa', 'Lenda', 'Student', 'Tipi'];
                  const csv = [header.join(','), ...rows.map(r => header.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `idet_${subjectName.replace(/\s+/g, '_')}.csv`;
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
                📦 Shkarko të gjitha (.zip)
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Idetep;
