import React, { useState, useEffect, useCallback, useMemo } from 'react';
import JSZip from 'jszip';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStudentProjectSubmissions, updateProjectGrade, updateProjectMaxPoints, updateProjectDeadline } from '../services/profesorApi';

const DoreziметStudentesh = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subject, lendaId } = location.state || {};

  const student = JSON.parse(localStorage.getItem('student') || '{}');
  const PROFESOR_ID = student.id || 1;
  const [submissions, setSubmissions] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null });
  const [isMobile, setIsMobile] = useState(false);
  const [bulkStatus, setBulkStatus] = useState({ loading: false, error: null });
  const [editingGrade, setEditingGrade] = useState(null);
  const [gradeValues, setGradeValues] = useState({});
  const [showBulkGrade, setShowBulkGrade] = useState(false);
  const [bulkGradeValue, setBulkGradeValue] = useState('');
  const [projectMaxPoints, setProjectMaxPoints] = useState(100);
  const [showDeadline, setShowDeadline] = useState(false);
  const [deadlineStartDate, setDeadlineStartDate] = useState('');
  const [deadlineStartHour, setDeadlineStartHour] = useState('');
  const [deadlineStartMinute, setDeadlineStartMinute] = useState('');
  const [deadlineStartSecond, setDeadlineStartSecond] = useState('');

  const [deadlineEndDate, setDeadlineEndDate] = useState('');
  const [deadlineEndHour, setDeadlineEndHour] = useState('');
  const [deadlineEndMinute, setDeadlineEndMinute] = useState('');
  const [deadlineEndSecond, setDeadlineEndSecond] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  const [deadlineTitle, setDeadlineTitle] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [periods, setPeriods] = useState([]);

  const pad2 = (num) => String(num).padStart(2, '0');
  const formatDateDisplay = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '';
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const splitTimeParts = (isoString) => {
    if (!isoString) return { h: '', m: '', s: '' };
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return { h: '', m: '', s: '' };
    return { h: pad2(d.getHours()), m: pad2(d.getMinutes()), s: pad2(d.getSeconds()) };
  };

  const parseDateParts = (dateStr, hStr, mStr, sStr) => {
    const match = (dateStr || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    const [, dd, mm, yyyy] = match;
    const h = Number(hStr);
    const m = Number(mStr);
    const s = Number(sStr);
    if ([dd, mm, yyyy].some((v) => Number.isNaN(Number(v)))) return null;
    if ([h, m, s].some((v) => Number.isNaN(v))) return null;
    if (h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59) return null;
    const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd), h, m, s);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const toLocalTimestamp = (dateObj) => {
    if (!dateObj || Number.isNaN(dateObj.getTime())) return null;
    return `${dateObj.getFullYear()}-${pad2(dateObj.getMonth() + 1)}-${pad2(dateObj.getDate())}T${pad2(dateObj.getHours())}:${pad2(dateObj.getMinutes())}:${pad2(dateObj.getSeconds())}`;
  };

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
        setSubmissions(fetched);
        setProjectMaxPoints(data?.lenda?.projectMaxPoints ?? 100);
        const startDateIso = data?.lenda?.projectStartDate;
        const endDateIso = data?.lenda?.projectDeadline;

        const startTimeParts = splitTimeParts(startDateIso);
        const endTimeParts = splitTimeParts(endDateIso);

        setDeadlineStartDate(startDateIso ? formatDateDisplay(startDateIso) : '');
        setDeadlineStartHour(startTimeParts.h);
        setDeadlineStartMinute(startTimeParts.m);
        setDeadlineStartSecond(startTimeParts.s);

        setDeadlineEndDate(endDateIso ? formatDateDisplay(endDateIso) : '');
        setDeadlineEndHour(endTimeParts.h);
        setDeadlineEndMinute(endTimeParts.m);
        setDeadlineEndSecond(endTimeParts.s);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleUpdateGrade = async (projectId) => {
    const piket = gradeValues[projectId];
    if (piket === undefined || piket === null || piket === '') {
      alert('Ju lutem vendosni pikët');
      return;
    }

    const numPiket = Number(piket);
    if (isNaN(numPiket) || numPiket < 0 || numPiket > projectMaxPoints) {
      alert(`Pikët duhet të jenë numër ndërmjet 0 dhe ${projectMaxPoints}`);
      return;
    }

    try {
      await updateProjectGrade(PROFESOR_ID, projectId, numPiket);
      setSubmissions(submissions.map(sub =>
        sub.id === projectId ? { ...sub, piket: numPiket } : sub
      ));
      setEditingGrade(null);
      alert('Pikët u ruajtën me sukses!');
    } catch (error) {
      alert('Error: ' + (error.message || 'Nuk u ruajtën pikët'));
    }
  };

  const handleSetProjectMax = async () => {
    const total = Number(bulkGradeValue);
    if (isNaN(total) || total < 0 || total > 100) {
      alert('Pikët totale duhet të jenë numër ndërmjet 0 dhe 100');
      return;
    }

    try {
      await updateProjectMaxPoints(PROFESOR_ID, lendaId, total);
      setProjectMaxPoints(total);
      setShowBulkGrade(false);
      setBulkGradeValue('');
      alert('Pikët totale u përditësuan!');
    } catch (error) {
      alert('Error: ' + (error.message || 'Nuk u ruajtën pikët totale'));
    }
  };

  const calculatePeriods = useCallback(() => {
    if (!lendaId) return [];
    try {
      const stored = localStorage.getItem(`project-periods-${lendaId}`);
      let customPeriods = [];
      if (stored) {
        try {
          customPeriods = JSON.parse(stored);
          if (!Array.isArray(customPeriods)) customPeriods = [];
        } catch { customPeriods = []; }
      }
      const mapped = customPeriods.map(p => {
        if (typeof p === 'string') return { key: p, title: null };
        return p;
      });
      return mapped;
    } catch {
      return [];
    }
  }, [lendaId]);

  useEffect(() => {
    const computed = calculatePeriods();
    setPeriods(computed);
  }, [calculatePeriods, deadlineStartDate, deadlineEndDate, submissions]);

  const filteredSubmissions = useMemo(() => {
    if (!selectedPeriod) return submissions;
    return submissions.filter(sub => {
      const submitDate = new Date(sub.createdAt);
      const submitYear = submitDate.getFullYear();
      const submitMonth = submitDate.getMonth();
      const submitKey = `${submitYear}-${submitMonth}`;
      return submitKey === selectedPeriod;
    });
  }, [submissions, selectedPeriod]);

  const handleSetDeadline = async () => {
    const startDate = parseDateParts(deadlineStartDate, deadlineStartHour, deadlineStartMinute, deadlineStartSecond);
    const endDate = parseDateParts(deadlineEndDate, deadlineEndHour, deadlineEndMinute, deadlineEndSecond);

    if (deadlineStartDate || deadlineStartHour || deadlineStartMinute || deadlineStartSecond) {
      if (!startDate) {
        alert('Format i pavlefshëm për fillimin. Përdor DD/MM/YYYY dhe orën 00-23, minutat 00-59, sekondat 00-59.');
        return;
      }
    }

    if (deadlineEndDate || deadlineEndHour || deadlineEndMinute || deadlineEndSecond) {
      if (!endDate) {
        alert('Format i pavlefshëm për mbarimin. Përdor DD/MM/YYYY dhe orën 00-23, minutat 00-59, sekondat 00-59.');
        return;
      }
    }

    if (startDate && endDate && startDate > endDate) {
      alert('Data e fillimit duhet të jetë para afatit të dorëzimit');
      return;
    }

    const payload = {
      projectStartDate: startDate ? toLocalTimestamp(startDate) : null,
      projectDeadline: endDate ? toLocalTimestamp(endDate) : null,
    };

    try {
      const res = await updateProjectDeadline(PROFESOR_ID, lendaId, payload);
      const startIso = res?.lenda?.projectStartDate;
      const endIso = res?.lenda?.projectDeadline;
      const startParts = splitTimeParts(startIso);
      const endParts = splitTimeParts(endIso);

      setDeadlineStartDate(startIso ? formatDateDisplay(startIso) : '');
      setDeadlineStartHour(startParts.h);
      setDeadlineStartMinute(startParts.m);
      setDeadlineStartSecond(startParts.s);

      setDeadlineEndDate(endIso ? formatDateDisplay(endIso) : '');
      setDeadlineEndHour(endParts.h);
      setDeadlineEndMinute(endParts.m);
      setDeadlineEndSecond(endParts.s);
      setShowDeadline(false);

      if (deadlineTitle && deadlineTitle.trim() && startDate && endDate) {
        const year = endDate.getFullYear();
        const month = endDate.getMonth();
        const periodKey = `${year}-${month}`;
        const newPeriod = { key: periodKey, title: deadlineTitle.trim() };
        try {
          const stored = localStorage.getItem(`project-periods-${lendaId}`);
          let existingPeriods = [];
          if (stored) {
            try {
              existingPeriods = JSON.parse(stored);
              if (!Array.isArray(existingPeriods)) existingPeriods = [];
            } catch { existingPeriods = []; }
          }
          const existingIndex = existingPeriods.findIndex(p => {
            const pKey = typeof p === 'string' ? p : p.key;
            return pKey === periodKey;
          });
          if (existingIndex >= 0) {
            existingPeriods[existingIndex] = newPeriod;
          } else {
            existingPeriods.push(newPeriod);
          }
          localStorage.setItem(`project-periods-${lendaId}`, JSON.stringify(existingPeriods));
          setPeriods(existingPeriods);
          setDeadlineTitle('');
        } catch (err) {
          console.error('Nuk u ruajt titulli i periudhës:', err);
        }
      }

      alert('Afatet u përditësuan!');
    } catch (error) {
      alert('Error: ' + (error.message || 'Nuk u ruajt afati'));
    }
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

  const bannerStartDate = parseDateParts(deadlineStartDate, deadlineStartHour, deadlineStartMinute, deadlineStartSecond);
  const bannerEndDate = parseDateParts(deadlineEndDate, deadlineEndHour, deadlineEndMinute, deadlineEndSecond);

  const containerStyle = {
    display: 'flex',
    gap: '2rem',
    marginTop: '2rem',
    paddingBottom: '2rem',
    marginLeft: '2.5rem',
    marginRight: '2.5rem'
  };

  const leftPanelStyle = {
    flex: '0 0 280px',
    background: 'rgba(9,18,12,0.85)',
    borderRadius: 18,
    padding: '1.5rem',
    border: '1px solid rgba(23,199,122,0.2)',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    position: 'sticky',
    top: '100px'
  };

  const rightPanelStyle = {
    flex: 1,
    background: 'rgba(9,18,12,0.5)',
    borderRadius: 18,
    padding: '2rem',
    border: '1px solid rgba(23,199,122,0.15)',
    minHeight: '500px'
  };

  const tabButtonStyle = (isActive) => ({
    width: '100%',
    padding: '0.75rem 1rem',
    background: isActive ? 'rgba(23,199,122,0.25)' : 'rgba(23,199,122,0.08)',
    border: isActive ? '1px solid rgba(23,199,122,0.6)' : '1px solid rgba(23,199,122,0.2)',
    borderRadius: 10,
    color: isActive ? '#1fdc8c' : '#17c77a',
    fontWeight: isActive ? 700 : 600,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left'
  });

  const sidebarBackButtonStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(139,0,0,0.2)',
    border: '1px solid rgba(139,0,0,0.4)',
    borderRadius: 10,
    color: '#ff6b6b',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    marginTop: 'auto',
    transition: 'all 0.2s'
  };

  return (
    <div style={pageStyle}>
      <style>{`
        /* Hide the calendar icon so users type manually */
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          display: none !important;
          -webkit-appearance: none;
          appearance: none;
        }
        /* Hide AM/PM segment */
        input[type="datetime-local"]::-webkit-datetime-edit-ampm-field {
          display: none !important;
          visibility: hidden !important;
          width: 0 !important;
          height: 0 !important;
          opacity: 0 !important;
        }
      `}</style>
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

      <div style={containerStyle}>
        {/* Left Sidebar */}
        <div style={leftPanelStyle}>
          <button
            style={tabButtonStyle(activeTab === 'projects')}
            onClick={() => setActiveTab('projects')}
          >
            📁 Projektet
          </button>
          <button
            style={tabButtonStyle(activeTab === 'deadline')}
            onClick={() => setActiveTab('deadline')}
          >
            🗓️ Afati i Dorëzimit
          </button>
          <button
            style={tabButtonStyle(activeTab === 'grades')}
            onClick={() => setActiveTab('grades')}
          >
            📊 Pikët
          </button>
          <button
            style={sidebarBackButtonStyle}
            onClick={() => navigate(-1)}
          >
            ← Kthehu Mbrapa
          </button>
        </div>

        {/* Right Content Panel */}
        <div style={rightPanelStyle}>
          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#1fdc8c' }}>📁 Projektet - {subject || 'Lënda'}</h2>
              {status.loading && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#17c77a' }}>
                  Duke u ngarkuar projektet...
                </div>
              )}
              {status.error && (
                <div style={{ ...bannerStyle, background: 'rgba(220, 38, 38, 0.1)', color: '#ff6b6b' }}>
                  {status.error}
                </div>
              )}
              {!status.loading && !status.error && submissions.length === 0 && (
                <div style={{ ...bannerStyle, background: 'rgba(23, 199, 122, 0.1)' }}>
                  Nuk ka projekte për këtë lëndë ende.
                </div>
              )}
              {!status.loading && !status.error && submissions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontWeight: 600, color: '#17c77a', padding: '0.75rem 1rem', background: 'rgba(23,199,122,0.1)', borderRadius: 10 }}>
                    Pikët totale: {projectMaxPoints}
                  </div>
                  {periods.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: 12, color: '#17c77a', fontWeight: 600 }}>Filtro sipas periudhës:</label>
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 10,
                          border: '1px solid rgba(23,199,122,0.4)',
                          background: 'rgba(4,10,6,0.7)',
                          color: '#1fdc8c',
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">🗂️ Të gjitha periudhat</option>
                        {periods.map((p, idx) => {
                          const pKey = typeof p === 'string' ? p : p.key;
                          const pTitle = typeof p === 'string' ? null : p.title;
                          const [year, month] = pKey.split('-');
                          const monthNames = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];
                          const monthName = monthNames[parseInt(month)] || 'N/A';
                          const displayText = pTitle ? `📌 ${pTitle}` : `📅 ${monthName} ${year}`;
                          return (
                            <option key={idx} value={pKey}>{displayText}</option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                  <button
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#19c776',
                      border: 'none',
                      borderRadius: 10,
                      color: '#041407',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: 14,
                      width: '100%'
                    }}
                    onClick={handleBulkDownload}
                    disabled={bulkStatus.loading}
                  >
                    {bulkStatus.loading ? '⬇ Duke shkarkuar...' : '⬇ Shkarko të Gjitha Projektet'}
                  </button>
                  {bulkStatus.error && (
                    <div style={{ color: '#ff6b6b', fontSize: 14 }}>
                      {bulkStatus.error}
                    </div>
                  )}
                  <div>
                    {filteredSubmissions.length === 0 && selectedPeriod && (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                        Nuk ka projekte të dorëzuara në këtë periudhë.
                      </div>
                    )}
                    {filteredSubmissions.map((submission) => (
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
                          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 8, color: '#17c77a' }}>
                            Pikët: {editingGrade === submission.id ? (
                              <input
                                type="number"
                                min="0"
                                max={projectMaxPoints}
                                value={gradeValues[submission.id] ?? submission.piket ?? 0}
                                onChange={(e) => setGradeValues({ ...gradeValues, [submission.id]: e.target.value })}
                                style={{
                                  width: 80,
                                  padding: '0.3rem 0.5rem',
                                  borderRadius: 6,
                                  border: '1px solid rgba(23,199,122,0.5)',
                                  background: 'rgba(9,18,12,0.9)',
                                  color: '#fff',
                                  marginLeft: 8
                                }}
                                autoFocus
                              />
                            ) : (
                              <span>{submission.piket ?? 0} / {projectMaxPoints}</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexDirection: isMobile ? 'column' : 'row' }}>
                          <button
                            style={downloadButton}
                            onClick={() => handleDownload(submission.fileUrl, submission.fileName)}
                          >
                            ⬇ Shkarko
                          </button>
                          {editingGrade === submission.id ? (
                            <>
                              <button
                                style={{ ...downloadButton, background: '#17c77a' }}
                                onClick={() => handleUpdateGrade(submission.id)}
                              >
                                ✓ Ruaj
                              </button>
                              <button
                                style={{ ...downloadButton, background: '#666' }}
                                onClick={() => { setEditingGrade(null); }}
                              >
                                ✕ Mbylle
                              </button>
                            </>
                          ) : (
                            <button
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#19c776',
                                border: 'none',
                                borderRadius: 8,
                                color: '#041407',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: 14
                              }}
                              onClick={() => {
                                setEditingGrade(submission.id);
                                setGradeValues({ ...gradeValues, [submission.id]: submission.piket ?? 0 });
                              }}
                            >
                              📝 Vlerëso
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DEADLINE TAB */}
          {activeTab === 'deadline' && (
            <div>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#1fdc8c' }}>⏰ Afati i Dorëzimit</h2>
              {status.error ? (
                <div style={{ ...bannerStyle, background: 'rgba(220, 38, 38, 0.1)', color: '#ff6b6b' }}>
                  {status.error}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ background: 'rgba(23,199,122,0.08)', padding: '1rem', borderRadius: 10, border: '1px solid rgba(23,199,122,0.2)' }}>
                    <div style={{ fontWeight: 600, color: '#17c77a', marginBottom: '0.75rem' }}>📋 Informacioni Aktual</div>
                    {bannerStartDate && bannerEndDate ? (
                      <div style={{ fontSize: 14, lineHeight: 1.6, color: '#e0e0e0' }}>
                        <div>Fillon: {bannerStartDate.toLocaleString('sq-AL')}</div>
                        <div>Përfundon: {bannerEndDate.toLocaleString('sq-AL')}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, color: '#999' }}>Nuk ka afat të dhënë aktualisht.</div>
                    )}
                  </div>

                  {showDeadline ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(23,199,122,0.1)', padding: '1.5rem', borderRadius: 10, border: '1px solid rgba(23,199,122,0.3)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1rem' }}>
                        <label style={{ fontSize: 12, color: '#17c77a', fontWeight: 600 }}>Emërtimi i Dorëzimit (opsional):</label>
                        <input
                          type="text"
                          placeholder="Vendos titullin e Assignment..."
                          value={deadlineTitle}
                          onChange={(e) => setDeadlineTitle(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            borderRadius: 10,
                            border: '1px solid rgba(23,199,122,0.4)',
                            background: 'rgba(4,10,6,0.7)',
                            color: '#1fdc8c',
                            fontSize: 14,
                            fontWeight: 500,
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 12, color: '#17c77a', fontWeight: 600 }}>Fillon (DD/MM/YYYY & HH:MM:SS):</label>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            value={deadlineStartDate}
                            onChange={(e) => setDeadlineStartDate(e.target.value)}
                            placeholder="DD/MM/YYYY"
                            style={{
                              padding: '0.5rem',
                              borderRadius: 8,
                              border: '1px solid rgba(23,199,122,0.5)',
                              background: 'rgba(9,18,12,0.9)',
                              color: '#fff',
                              fontSize: 14,
                              width: 120
                            }}
                          />
                          <input
                            type="number"
                            min="0"
                            max="23"
                            inputMode="numeric"
                            value={deadlineStartHour}
                            onChange={(e) => setDeadlineStartHour(e.target.value)}
                            placeholder="HH"
                            style={{
                              width: 60,
                              padding: '0.5rem',
                              borderRadius: 8,
                              border: '1px solid rgba(23,199,122,0.5)',
                              background: 'rgba(9,18,12,0.9)',
                              color: '#fff',
                              fontSize: 14
                            }}
                          />
                          <span style={{ color: '#17c77a', fontWeight: 700 }}>:</span>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            inputMode="numeric"
                            value={deadlineStartMinute}
                            onChange={(e) => setDeadlineStartMinute(e.target.value)}
                            placeholder="MM"
                            style={{
                              width: 60,
                              padding: '0.5rem',
                              borderRadius: 8,
                              border: '1px solid rgba(23,199,122,0.5)',
                              background: 'rgba(9,18,12,0.9)',
                              color: '#fff',
                              fontSize: 14
                            }}
                          />
                          <span style={{ color: '#17c77a', fontWeight: 700 }}>:</span>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            inputMode="numeric"
                            value={deadlineStartSecond}
                            onChange={(e) => setDeadlineStartSecond(e.target.value)}
                            placeholder="SS"
                            style={{
                              width: 60,
                              padding: '0.5rem',
                              borderRadius: 8,
                              border: '1px solid rgba(23,199,122,0.5)',
                              background: 'rgba(9,18,12,0.9)',
                              color: '#fff',
                              fontSize: 14
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 10, color: '#17c77a', opacity: 0.7 }}>Orë 00-23, minuta dhe sekonda 00-59</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 12, color: '#17c77a', fontWeight: 600 }}>Përfundon (DD/MM/YYYY & HH:MM:SS):</label>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            value={deadlineEndDate}
                            onChange={(e) => setDeadlineEndDate(e.target.value)}
                            placeholder="DD/MM/YYYY"
                            style={{
                              padding: '0.5rem',
                              borderRadius: 8,
                              border: '1px solid rgba(23,199,122,0.5)',
                              background: 'rgba(9,18,12,0.9)',
                              color: '#fff',
                              fontSize: 14,
                              width: 120
                            }}
                          />
                          <input
                            type="number"
                            min="0"
                            max="23"
                            inputMode="numeric"
                            value={deadlineEndHour}
                            onChange={(e) => setDeadlineEndHour(e.target.value)}
                            placeholder="HH"
                            style={{
                              width: 60,
                              padding: '0.5rem',
                              borderRadius: 8,
                              border: '1px solid rgba(23,199,122,0.5)',
                              background: 'rgba(9,18,12,0.9)',
                              color: '#fff',
                              fontSize: 14
                            }}
                          />
                          <span style={{ color: '#17c77a', fontWeight: 700 }}>:</span>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            inputMode="numeric"
                            value={deadlineEndMinute}
                            onChange={(e) => setDeadlineEndMinute(e.target.value)}
                            placeholder="MM"
                            style={{
                              width: 60,
                              padding: '0.5rem',
                              borderRadius: 8,
                              border: '1px solid rgba(23,199,122,0.5)',
                              background: 'rgba(9,18,12,0.9)',
                              color: '#fff',
                              fontSize: 14
                            }}
                          />
                          <span style={{ color: '#17c77a', fontWeight: 700 }}>:</span>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            inputMode="numeric"
                            value={deadlineEndSecond}
                            onChange={(e) => setDeadlineEndSecond(e.target.value)}
                            placeholder="SS"
                            style={{
                              width: 60,
                              padding: '0.5rem',
                              borderRadius: 8,
                              border: '1px solid rgba(23,199,122,0.5)',
                              background: 'rgba(9,18,12,0.9)',
                              color: '#fff',
                              fontSize: 14
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 10, color: '#17c77a', opacity: 0.7 }}>Orë 00-23, minuta dhe sekonda 00-59</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          style={{ ...downloadButton, background: '#17c77a', padding: '0.5rem 1rem' }}
                          onClick={handleSetDeadline}
                        >
                          ✓ Ruaj
                        </button>
                        <button
                          style={{ ...downloadButton, background: '#666', padding: '0.5rem 1rem' }}
                          onClick={() => { setShowDeadline(false); }}
                        >
                          ✕ Mbylle
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#0fa36a',
                        border: 'none',
                        borderRadius: 10,
                        color: '#041407',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: 14,
                        width: '100%'
                      }}
                      onClick={() => { setShowDeadline(true); }}
                    >
                      🗓️ Ndrysho Afatin
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GRADES TAB */}
          {activeTab === 'grades' && (
            <div>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#1fdc8c' }}>📊 Menaxhimi i Pikëve</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(23,199,122,0.08)', padding: '1rem', borderRadius: 10, border: '1px solid rgba(23,199,122,0.2)' }}>
                  <div style={{ fontWeight: 600, color: '#17c77a' }}>Pikët Totale të Projektit: {projectMaxPoints}</div>
                </div>

                {showBulkGrade ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(23,199,122,0.1)', padding: '1rem', borderRadius: 10 }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={bulkGradeValue}
                      onChange={(e) => setBulkGradeValue(e.target.value)}
                      placeholder={`Pikët totale (aktuale ${projectMaxPoints})`}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: 8,
                        border: '1px solid rgba(23,199,122,0.5)',
                        background: 'rgba(9,18,12,0.9)',
                        color: '#fff',
                        fontSize: 14
                      }}
                    />
                    <button
                      style={{ ...downloadButton, background: '#17c77a' }}
                      onClick={handleSetProjectMax}
                    >
                      ✓ Ruaj
                    </button>
                    <button
                      style={{ ...downloadButton, background: '#666' }}
                      onClick={() => { setShowBulkGrade(false); setBulkGradeValue(''); }}
                    >
                      ✕ Mbylle
                    </button>
                  </div>
                ) : (
                  <button
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#19c776',
                      border: 'none',
                      borderRadius: 10,
                      color: '#041407',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: 14,
                      width: '100%'
                    }}
                    onClick={() => { setShowBulkGrade(true); }}
                  >
                    ⚙️ Ndrysho Pikëve Totale
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoreziметStudentesh;
