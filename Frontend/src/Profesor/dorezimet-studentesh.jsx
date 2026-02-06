import React, { useState, useEffect, useCallback, useMemo } from 'react';
import JSZip from 'jszip';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStudentProjectSubmissions, updateProjectGrade, updateProjectMaxPoints, updateProjectDeadline, addInstructionTemplate, getInstructionTemplates, updateInstructionTemplate, deleteInstructionTemplate, uploadLendaTemplate, getLendaTemplateInfo, deleteLendaTemplate } from '../services/profesorApi';
import '../Student/StudentTheme.css';

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
  const [templates, setTemplates] = useState([]);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [templateInfo, setTemplateInfo] = useState({ hasTemplate: false, fileName: '' });
  const [templateUploadFile, setTemplateUploadFile] = useState(null);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);

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

  useEffect(() => {
    if (!lendaId) return;
    const loadTemplateInfo = async () => {
      try {
        const data = await getLendaTemplateInfo(PROFESOR_ID, lendaId);
        setTemplateInfo(data?.hasTemplate ? { hasTemplate: true, fileName: data.fileName } : { hasTemplate: false, fileName: '' });
      } catch (error) {
        console.error('Error loading template info:', error);
        setTemplateInfo({ hasTemplate: false, fileName: '' });
      }
    };
    loadTemplateInfo();
  }, [lendaId, PROFESOR_ID]);

  // Load instruction templates when component mounts
  useEffect(() => {
    if (!lendaId) return;

    const loadTemplates = async () => {
      try {
        const data = await getInstructionTemplates(PROFESOR_ID, lendaId);
        if (data && Array.isArray(data)) {
          setTemplates(data);
        }
      } catch (error) {
        console.error('Error loading instruction templates:', error);
      }
    };

    loadTemplates();
  }, [lendaId]);

  const profesorName = 'Profesor';
  const avatarLetter = 'P';

  const pageStyle = {
    color: '#B8E3E9',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #0B2E33 100%, #0B2E33 0%)',
    fontFamily: 'Inter, system-ui, Arial, sans-serif'
  };

  const topBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? '0.85rem 1.5rem' : '1rem 2.5rem',
    background: 'linear-gradient(180deg,  #4F7C82 10%, #0B2E33 90%, #0B2E33 100%)'
  };

  const brandStyle = {
    color: '#B8E3E9',
    fontWeight: 800,
    fontSize: isMobile ? 18 : 22,
    letterSpacing: 0.6
  };

  const actionsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 10 : 18
  };

  const avatarStyle = {
    width: 42,
    height: 42,
    borderRadius: 21,
    background: '#4F7C82',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0B2E33',
    fontWeight: 700
  };

  const bannerStyle = {
    border: '1px solid rgba(184,227,233,0.25)',
    borderRadius: 14,
    padding: '0.85rem 1rem',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: 600,
  };

  const submissionCard = {
    background: 'rgba(11,46,51,0.75)',
    border: '1px solid rgba(184,227,233,0.35)',
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
    background: '#0B2E33',
    border: '1px solid rgba(184,227,233,0.35)',
    borderRadius: 8,
    color: '#B8E3E9',
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
    const selectedPeriodInfo = periods.find(p => {
      const pKey = typeof p === 'string' ? p : p.key;
      return pKey === selectedPeriod;
    });
    const isNamedPeriod = selectedPeriodInfo && typeof selectedPeriodInfo !== 'string' && selectedPeriodInfo.title;

    if (isNamedPeriod) {
      const start = parseDateParts(deadlineStartDate, deadlineStartHour, deadlineStartMinute, deadlineStartSecond);
      const end = parseDateParts(deadlineEndDate, deadlineEndHour, deadlineEndMinute, deadlineEndSecond);
      if (start && end) {
        return submissions.filter(sub => {
          const submitDate = new Date(sub.createdAt);
          if (Number.isNaN(submitDate.getTime())) return false;
          return submitDate >= start && submitDate <= end;
        });
      }
      return submissions;
    }

    return submissions.filter(sub => {
      const submitDate = new Date(sub.createdAt);
      if (Number.isNaN(submitDate.getTime())) return false;
      const submitKey = `${submitDate.getFullYear()}-${submitDate.getMonth()}`;
      return submitKey === selectedPeriod;
    });
  }, [submissions, selectedPeriod, periods, deadlineStartDate, deadlineStartHour, deadlineStartMinute, deadlineStartSecond, deadlineEndDate, deadlineEndHour, deadlineEndMinute, deadlineEndSecond]);

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
    gap: '2.4rem',
    marginTop: '2rem',
    paddingBottom: '2rem',
    marginLeft: '2.5rem',
    marginRight: '2.5rem',
    alignItems: 'stretch'
  };

  const leftPanelStyle = {
    flex: '0 0 280px',
    background: 'rgba(11,46,51,0.75)',
    borderRadius: 18,
    padding: '1.5rem',
    border: '1px solid rgba(184,227,233,0.35)',
    minHeight: 'calc(100vh - 140px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    position: 'sticky',
    top: '100px',
    alignSelf: 'stretch'
  };

  const rightPanelStyle = {
    flex: 1,
    background: 'rgba(11,46,51,0.6)',
    borderRadius: 18,
    padding: '2rem',
    border: '1px solid rgba(184,227,233,0.25)',
    minHeight: '500px',
    maxHeight: 'calc(100vh - 140px)',
    overflowY: 'auto',
    overflowX: 'hidden',
    alignSelf: 'stretch'
  };

  const tabButtonStyle = (isActive) => ({
    width: '100%',
    padding: '0.75rem 1rem',
    background: isActive ? 'rgba(184,227,233,0.12)' : 'rgba(11,46,51,0.6)',
    border: isActive ? '1px solid rgba(184,227,233,0.6)' : '1px solid rgba(184,227,233,0.25)',
    borderRadius: 10,
    color: '#B8E3E9',
    fontWeight: isActive ? 700 : 600,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center'
  });

  const sidebarBackButtonStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(11,46,51,0.6)',
    border: '1px solid rgba(184,227,233,0.35)',
    borderRadius: 10,
    color: '#B8E3E9',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    marginTop: 'auto',
    transition: 'all 0.2s',
    textAlign: 'center'
  };

  return (
    <div className="student-theme" style={pageStyle}>
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
            style={tabButtonStyle(activeTab === 'deadline')}
            onClick={() => setActiveTab('deadline')}
          >
            Afati i Dorëzimit
          </button>
          <button
            style={tabButtonStyle(activeTab === 'templates')}
            onClick={() => setActiveTab('templates')}
          >
            Template
          </button>
          <button
            style={tabButtonStyle(activeTab === 'projects')}
            onClick={() => setActiveTab('projects')}
          >
            Lista e Projekteve
          </button>
          <button
            style={tabButtonStyle(activeTab === 'grades')}
            onClick={() => setActiveTab('grades')}
          >
            Pikët
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
          {/* TEMPLATES TAB */}
          {activeTab === 'templates' && (
            <div>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#B8E3E9', textAlign: 'center' }}>Template/Instruksione</h2>
              <button
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#0B2E33',
                  border: '1px solid rgba(184,227,233,0.35)',
                  borderRadius: 10,
                  color: '#B8E3E9',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 14,
                  marginBottom: '1.5rem',
                  width: '100%'
                }}
                onClick={() => {
                  if (editingTemplateId) {
                    setEditingTemplateId(null);
                    setTemplateTitle('');
                    setTemplateContent('');
                    setShowTemplateForm(false);
                  } else {
                    setShowTemplateForm(!showTemplateForm);
                  }
                }}
              >
                {showTemplateForm ? (editingTemplateId ? 'Anulo Modifikimin' : 'Anulo') : (editingTemplateId ? 'Redakto Template' : 'Shto Template/Instruksion')}
              </button>

              {showTemplateForm && (
                <div 
                  data-template-form
                  style={{
                  background: 'rgba(184,227,233,0.12)',
                  border: '1px solid rgba(184,227,233,0.35)',
                  borderRadius: 10,
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  {editingTemplateId && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(184,227,233,0.12)', borderRadius: 6, color: '#B8E3E9', fontWeight: 600, fontSize: 13 }}>
                      Po e modifikoni template-in
                    </div>
                  )}
                  
                  <div style={{
                      background: 'rgba(11,46,51,0.6)',
                      border: '1px solid rgba(184,227,233,0.35)',
                      borderRadius: 10,
                      padding: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{ fontWeight: 700, color: '#B8E3E9', marginBottom: '0.75rem' }}>
                        Template i Projektit
                      </div>
                      {templateInfo.hasTemplate ? (
                        <div style={{ color: 'rgba(184,227,233,0.85)', marginBottom: '0.75rem' }}>
                          Aktual: <strong style={{ color: '#B8E3E9' }}>{templateInfo.fileName}</strong>
                        </div>
                      ) : (
                        <div style={{ color: 'rgba(184,227,233,0.7)', marginBottom: '0.75rem' }}>Nuk ka template të ruajtur.</div>
                      )}
                      <input
                        type="file"
                        onChange={(e) => setTemplateUploadFile(e.target.files?.[0] || null)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          borderRadius: 8,
                          border: '1px solid rgba(184,227,233,0.4)',
                          background: 'rgba(11,46,51,0.6)',
                          color: '#B8E3E9',
                          fontSize: 14,
                          boxSizing: 'border-box',
                          cursor: 'pointer',
                          marginBottom: '0.75rem'
                        }}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt"
                      />
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            background: '#0B2E33',
                            border: '1px solid rgba(184,227,233,0.35)',
                            borderRadius: 8,
                            color: '#B8E3E9',
                            fontWeight: 700,
                            cursor: uploadingTemplate ? 'not-allowed' : 'pointer',
                            opacity: uploadingTemplate ? 0.6 : 1
                          }}
                          disabled={uploadingTemplate}
                          onClick={async () => {
                            if (!templateUploadFile) {
                              alert('Zgjedh një fajll për template.');
                              return;
                            }
                            try {
                              setUploadingTemplate(true);
                              await uploadLendaTemplate(PROFESOR_ID, lendaId, templateUploadFile);
                              const data = await getLendaTemplateInfo(PROFESOR_ID, lendaId);
                              setTemplateInfo(data?.hasTemplate ? { hasTemplate: true, fileName: data.fileName } : { hasTemplate: false, fileName: '' });
                              setTemplateUploadFile(null);
                              alert('Template u ngarkua me sukses!');
                            } catch (error) {
                              console.error('Error uploading template:', error);
                              alert('Error: ' + (error.message || 'Nuk u ngarkua template'));
                            } finally {
                              setUploadingTemplate(false);
                            }
                          }}
                        >
                          {uploadingTemplate ? 'Duke ngarkuar...' : 'Ngarko Template'}
                        </button>
                        <button
                          style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            background: 'rgba(184,227,233,0.08)',
                            border: '1px solid rgba(184,227,233,0.35)',
                            color: '#B8E3E9',
                            borderRadius: 8,
                            fontWeight: 700,
                            cursor: templateInfo.hasTemplate ? 'pointer' : 'not-allowed',
                            opacity: templateInfo.hasTemplate ? 1 : 0.6
                          }}
                          disabled={!templateInfo.hasTemplate}
                          onClick={async () => {
                            try {
                              await deleteLendaTemplate(PROFESOR_ID, lendaId);
                              setTemplateInfo({ hasTemplate: false, fileName: '' });
                              alert('Template u fshi.');
                            } catch (error) {
                              console.error('Error deleting template:', error);
                              alert('Error: ' + (error.message || 'Nuk u fshi template'));
                            }
                          }}
                        >
                          Fshi Template
                        </button>
                      </div>
                    </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 14, fontWeight: 600, color: '#B8E3E9' }}>
                      Titulli (opsional):
                    </label>
                    <input
                      type="text"
                      placeholder="Shto një titull për template-in..."
                      value={templateTitle}
                      onChange={(e) => setTemplateTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 8,
                        border: '1px solid rgba(184,227,233,0.4)',
                        background: 'rgba(11,46,51,0.6)',
                        color: '#B8E3E9',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 14, fontWeight: 600, color: '#B8E3E9' }}>
                      Përmbajtja/Instruksionet:
                    </label>
                    <textarea
                      placeholder="Shkruaj instruksionet ose përmbajtjen e template-it..."
                      value={templateContent}
                      onChange={(e) => setTemplateContent(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: 8,
                        border: '1px solid rgba(184,227,233,0.4)',
                        background: 'rgba(11,46,51,0.6)',
                        color: '#B8E3E9',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        minHeight: '200px',
                        boxSizing: 'border-box',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <button
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#0B2E33',
                      border: '1px solid rgba(184,227,233,0.35)',
                      borderRadius: 8,
                      color: '#B8E3E9',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: 14,
                      width: '100%'
                    }}
                    onClick={async () => {
                      if (templateContent.trim()) {
                        try {
                          if (editingTemplateId) {
                            // Update existing template
                            await updateInstructionTemplate(PROFESOR_ID, lendaId, editingTemplateId, {
                              title: templateTitle || 'Instruksione',
                              content: templateContent
                            });
                            alert('Template u përditësua me sukses!');
                          } else {
                            // Create new template
                            await addInstructionTemplate(PROFESOR_ID, lendaId, {
                              title: templateTitle || 'Instruksione',
                              content: templateContent
                            });
                            alert('Template u ruajt me sukses!');
                          }

                          // Reload templates from backend
                          const updatedTemplates = await getInstructionTemplates(PROFESOR_ID, lendaId);
                          setTemplates(updatedTemplates || []);

                          setEditingTemplateId(null);
                          setTemplateTitle('');
                          setTemplateContent('');
                          setShowTemplateForm(false);
                        } catch (error) {
                          console.error('Error saving template:', error);
                          alert('Error: ' + (error.message || 'Nuk u ruajt template'));
                        }
                      } else {
                        alert('Shto instruksion!');
                      }
                    }}
                  >
                    {editingTemplateId ? 'Përditëso Template' : 'Ruaj Template'}
                  </button>
                </div>
              )}

              {templates.length === 0 ? (
                <div style={{ ...bannerStyle, background: 'rgba(184,227,233,0.12)' }}>
                  Nuk ka template/instruksione të ruajtura ende. Kliko butonin më lart për të shtuar një.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      style={{
                        background: 'rgba(11,46,51,0.6)',
                        border: '1px solid rgba(184,227,233,0.25)',
                        borderRadius: 10,
                        padding: '1.5rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                        <h3 style={{ margin: 0, color: '#B8E3E9', fontSize: 18, fontWeight: 700 }}>
                          {template.title}
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            style={{
                              background: 'rgba(184,227,233,0.12)',
                              border: '1px solid rgba(184,227,233,0.35)',
                              color: '#B8E3E9',
                              padding: '0.4rem 0.8rem',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 600
                            }}
                            onClick={() => {
                              setEditingTemplateId(template.id);
                              setTemplateTitle(template.title);
                              setTemplateContent(template.content);
                              setShowTemplateForm(true);
                              // Scroll to form
                              setTimeout(() => {
                                document.querySelector('[data-template-form]')?.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                            }}
                          >
                            Modifiko
                          </button>
                          <button
                            style={{
                              background: 'rgba(184,227,233,0.08)',
                              border: '1px solid rgba(184,227,233,0.35)',
                              color: '#B8E3E9',
                              padding: '0.4rem 0.8rem',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 600
                            }}
                            onClick={async () => {
                              try {
                                await deleteInstructionTemplate(PROFESOR_ID, lendaId, template.id);
                                const updatedTemplates = await getInstructionTemplates(PROFESOR_ID, lendaId);
                                setTemplates(updatedTemplates || []);
                              } catch (error) {
                                console.error('Error deleting template:', error);
                                alert('Error: ' + (error.message || 'Nuk u fshi template'));
                              }
                            }}
                          >
                            Fshi
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(184,227,233,0.7)', marginBottom: '1rem' }}>
                        Krijuar: {template.createdAt}
                      </div>
                      <div style={{
                        background: 'rgba(11,46,51,0.6)',
                        borderRadius: 8,
                        padding: '1rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: 'rgba(184,227,233,0.9)',
                        maxHeight: '300px',
                        overflow: 'auto',
                        marginBottom: '1rem'
                      }}>
                        {template.content}
                      </div>
                      {template.files && template.files.length > 0 && (
                        <div style={{
                          background: 'rgba(184,227,233,0.12)',
                          border: '1px solid rgba(184,227,233,0.35)',
                          borderRadius: 8,
                          padding: '1rem',
                          marginTop: '1rem'
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#B8E3E9', marginBottom: '0.75rem' }}>
                            Fajllat e Lidhur:
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {template.files.map((file, idx) => {
                              const formatFileSize = (bytes) => {
                                if (bytes === 0) return '0 B';
                                const k = 1024;
                                const sizes = ['B', 'KB', 'MB', 'GB'];
                                const i = Math.floor(Math.log(bytes) / Math.log(k));
                                return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
                              };
                              return (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'rgba(11,46,51,0.6)',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 6,
                                    fontSize: 13,
                                    border: '1px solid rgba(184,227,233,0.25)'
                                  }}
                                >
                                  <div style={{ color: 'rgba(184,227,233,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                    {file.name} <span style={{ color: 'rgba(184,227,233,0.65)', fontSize: 12 }}>({formatFileSize(file.size)})</span>
                                  </div>
                                  <button
                                    style={{
                                      background: '#0B2E33',
                                      border: '1px solid rgba(184,227,233,0.35)',
                                      color: '#B8E3E9',
                                      padding: '0.4rem 0.8rem',
                                      borderRadius: 4,
                                      cursor: 'pointer',
                                      fontSize: 11,
                                      fontWeight: 600,
                                      marginLeft: '0.75rem',
                                      whiteSpace: 'nowrap'
                                    }}
                                    onClick={() => {
                                      alert(`Për të shkarkuar "${file.name}", do të nevojitet integrimi me serverin. Fajlli mund të shkarkohet pasi të ruhet në bazën e të dhënave.`);
                                    }}
                                  >
                                    Shkarko
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#B8E3E9', textAlign: 'center' }}>Lista e Projekteve - {subject || 'Lënda'}</h2>
              {status.loading && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#B8E3E9' }}>
                  Duke u ngarkuar projektet...
                </div>
              )}
              {status.error && (
                <div style={{ ...bannerStyle, background: 'rgba(220, 38, 38, 0.1)', color: '#ff6b6b' }}>
                  {status.error}
                </div>
              )}
              {!status.loading && !status.error && submissions.length === 0 && (
                <div style={{ ...bannerStyle, background: 'rgba(184,227,233,0.12)' }}>
                  Nuk ka projekte për këtë lëndë ende.
                </div>
              )}
              {!status.loading && !status.error && submissions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontWeight: 600, color: '#B8E3E9', padding: '0.75rem 1rem', background: 'rgba(184,227,233,0.12)', borderRadius: 10, border: '1px solid rgba(184,227,233,0.35)' }}>
                    Pikët totale: {projectMaxPoints}
                  </div>
                  {periods.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: 12, color: '#B8E3E9', fontWeight: 600 }}>Filtro sipas periudhës:</label>
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 10,
                          border: '1px solid rgba(184,227,233,0.4)',
                          background: 'rgba(11,46,51,0.6)',
                          color: '#B8E3E9',
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Të gjitha periudhat</option>
                        {periods.map((p, idx) => {
                          const pKey = typeof p === 'string' ? p : p.key;
                          const pTitle = typeof p === 'string' ? null : p.title;
                          const [year, month] = pKey.split('-');
                          const monthNames = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];
                          const monthName = monthNames[parseInt(month)] || 'N/A';
                          const displayText = pTitle ? `${pTitle}` : `${monthName} ${year}`;
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
                      background: '#0B2E33',
                      border: '1px solid rgba(184,227,233,0.35)',
                      borderRadius: 10,
                      color: '#B8E3E9',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: 14,
                      width: '100%'
                    }}
                    onClick={handleBulkDownload}
                    disabled={bulkStatus.loading}
                  >
                    {bulkStatus.loading ? 'Duke shkarkuar...' : 'Shkarko të Gjitha Projektet'}
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
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#B8E3E9' }}>
                            {submission.student.fullName}
                          </div>
                          <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>
                            {submission.fileName}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 8, color: '#B8E3E9' }}>
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
                                  border: '1px solid rgba(184,227,233,0.4)',
                                  background: 'rgba(11,46,51,0.6)',
                                  color: '#B8E3E9',
                                  marginLeft: 8
                                }}
                                autoFocus
                              />
                            ) : (
                              <span>{submission.piket ?? 0} / {projectMaxPoints}</span>
                            )}
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMobile ? 'flex-start' : 'flex-end',
                            gap: 4,
                            minWidth: isMobile ? '100%' : 'auto'
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              opacity: 0.8,
                              textAlign: isMobile ? 'left' : 'right',
                              marginBottom: 15
                            }}
                          >
                            Dorëzuar: {new Date(submission.createdAt).toLocaleString('sq-AL')}
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexDirection: isMobile ? 'column' : 'row' }}>
                            <button
                              style={downloadButton}
                              onClick={() => handleDownload(submission.fileUrl, submission.fileName)}
                            >
                              Shkarko
                            </button>
                            {editingGrade === submission.id ? (
                              <>
                                <button
                                  style={{ ...downloadButton, background: '#0B2E33' }}
                                  onClick={() => handleUpdateGrade(submission.id)}
                                >
                                  Ruaj
                                </button>
                                <button
                                  style={{ ...downloadButton, background: 'rgba(11,46,51,0.6)' }}
                                  onClick={() => { setEditingGrade(null); }}
                                >
                                  Mbylle
                                </button>
                              </>
                            ) : (
                              <button
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: '#0B2E33',
                                  border: '1px solid rgba(184,227,233,0.35)',
                                  borderRadius: 8,
                                  color: '#B8E3E9',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  fontSize: 14
                                }}
                                onClick={() => {
                                  setEditingGrade(submission.id);
                                  setGradeValues({ ...gradeValues, [submission.id]: submission.piket ?? 0 });
                                }}
                              >
                                Vlerëso
                              </button>
                            )}
                          </div>
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
            <div style={{ maxWidth: 740, margin: '0 auto', width: '100%' }}>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#B8E3E9', textAlign: 'center' }}>Afati i Dorëzimit</h2>
              {status.error ? (
                <div style={{ ...bannerStyle, background: 'rgba(220, 38, 38, 0.1)', color: '#ff6b6b' }}>
                  {status.error}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ background: 'rgba(184,227,233,0.12)', padding: '1rem', borderRadius: 10, border: '1px solid rgba(184,227,233,0.35)' }}>
                    <div style={{ fontWeight: 600, color: '#B8E3E9', marginBottom: '0.75rem' }}>Informacioni Aktual</div>
                    {bannerStartDate && bannerEndDate ? (
                      <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(184,227,233,0.9)' }}>
                        <div>Fillon: {bannerStartDate.toLocaleString('sq-AL')}</div>
                        <div>Përfundon: {bannerEndDate.toLocaleString('sq-AL')}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, color: 'rgba(184,227,233,0.7)' }}>Nuk ka afat të dhënë aktualisht.</div>
                    )}
                  </div>

                  {showDeadline ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(184,227,233,0.12)', padding: '1.5rem', borderRadius: 10, border: '1px solid rgba(184,227,233,0.35)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1rem' }}>
                        <label style={{ fontSize: 12, color: '#B8E3E9', fontWeight: 600 }}>Emërtimi i Dorëzimit (opsional):</label>
                        <input
                          type="text"
                          placeholder="Vendos titullin e Assignment..."
                          value={deadlineTitle}
                          onChange={(e) => setDeadlineTitle(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            borderRadius: 10,
                            border: '1px solid rgba(184,227,233,0.4)',
                            background: 'rgba(11,46,51,0.6)',
                            color: '#B8E3E9',
                            fontSize: 14,
                            fontWeight: 500,
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 12, color: '#B8E3E9', fontWeight: 600 }}>Fillon (DD/MM/YYYY & HH:MM:SS):</label>
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
                              border: '1px solid rgba(184,227,233,0.5)',
                              background: 'rgba(11,46,51,0.6)',
                              color: '#B8E3E9',
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
                              border: '1px solid rgba(184,227,233,0.5)',
                              background: 'rgba(11,46,51,0.6)',
                              color: '#B8E3E9',
                              fontSize: 14
                            }}
                          />
                          <span style={{ color: '#B8E3E9', fontWeight: 700 }}>:</span>
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
                              border: '1px solid rgba(184,227,233,0.5)',
                              background: 'rgba(11,46,51,0.6)',
                              color: '#B8E3E9',
                              fontSize: 14
                            }}
                          />
                          <span style={{ color: '#B8E3E9', fontWeight: 700 }}>:</span>
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
                              border: '1px solid rgba(184,227,233,0.5)',
                              background: 'rgba(11,46,51,0.6)',
                              color: '#B8E3E9',
                              fontSize: 14
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 10, color: 'rgba(184,227,233,0.7)' }}>Orë 00-23, minuta dhe sekonda 00-59</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 12, color: '#B8E3E9', fontWeight: 600 }}>Përfundon (DD/MM/YYYY & HH:MM:SS):</label>
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
                              border: '1px solid rgba(184,227,233,0.5)',
                              background: 'rgba(11,46,51,0.6)',
                              color: '#B8E3E9',
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
                              border: '1px solid rgba(184,227,233,0.5)',
                              background: 'rgba(11,46,51,0.6)',
                              color: '#B8E3E9',
                              fontSize: 14
                            }}
                          />
                          <span style={{ color: '#B8E3E9', fontWeight: 700 }}>:</span>
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
                              border: '1px solid rgba(184,227,233,0.5)',
                              background: 'rgba(11,46,51,0.6)',
                              color: '#B8E3E9',
                              fontSize: 14
                            }}
                          />
                          <span style={{ color: '#B8E3E9', fontWeight: 700 }}>:</span>
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
                              border: '1px solid rgba(184,227,233,0.5)',
                              background: 'rgba(11,46,51,0.6)',
                              color: '#B8E3E9',
                              fontSize: 14
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 10, color: 'rgba(184,227,233,0.7)' }}>Orë 00-23, minuta dhe sekonda 00-59</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          style={{ ...downloadButton, background: '#0B2E33', padding: '0.5rem 1rem' }}
                          onClick={handleSetDeadline}
                        >
                          Ruaj
                        </button>
                        <button
                          style={{ ...downloadButton, background: 'rgba(11,46,51,0.6)', padding: '0.5rem 1rem' }}
                          onClick={() => { setShowDeadline(false); }}
                        >
                          Mbylle
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#0B2E33',
                        border: '1px solid rgba(184,227,233,0.35)',
                        borderRadius: 10,
                        color: '#B8E3E9',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: 14,
                        width: '100%'
                      }}
                      onClick={() => { setShowDeadline(true); }}
                    >
                      Ndrysho Afatin
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GRADES TAB */}
          {activeTab === 'grades' && (
            <div>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#B8E3E9', textAlign: 'center' }}>Menaxhimi i Pikëve</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(184,227,233,0.12)', padding: '1rem', borderRadius: 10, border: '1px solid rgba(184,227,233,0.35)' }}>
                  <div style={{ fontWeight: 600, color: '#B8E3E9' }}>Pikët Totale të Projektit: {projectMaxPoints}</div>
                </div>

                {showBulkGrade ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(184,227,233,0.12)', padding: '1rem', borderRadius: 10 }}>
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
                        border: '1px solid rgba(184,227,233,0.5)',
                        background: 'rgba(11,46,51,0.6)',
                        color: '#B8E3E9',
                        fontSize: 14
                      }}
                    />
                    <button
                      style={{ ...downloadButton, background: '#0B2E33' }}
                      onClick={handleSetProjectMax}
                    >
                      Ruaj
                    </button>
                    <button
                      style={{ ...downloadButton, background: 'rgba(11,46,51,0.6)' }}
                      onClick={() => { setShowBulkGrade(false); setBulkGradeValue(''); }}
                    >
                      Mbylle
                    </button>
                  </div>
                ) : (
                  <button
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#0B2E33',
                      border: '1px solid rgba(184,227,233,0.35)',
                      borderRadius: 10,
                      color: '#B8E3E9',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: 14,
                      width: '100%'
                    }}
                    onClick={() => { setShowBulkGrade(true); }}
                  >
                    Ndrysho Pikëve Totale
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
