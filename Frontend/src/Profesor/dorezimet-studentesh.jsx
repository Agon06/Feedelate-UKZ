import React, { useState, useEffect, useCallback, useMemo } from 'react';
import JSZip from 'jszip';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStudentProjectSubmissions, updateProjectGrade, updateProjectMaxPoints, updateProjectDeadline, addInstructionTemplate, getInstructionTemplates, updateInstructionTemplate, deleteInstructionTemplate, uploadLendaTemplate, getLendaTemplateInfo, deleteLendaTemplate, exportProjectResults } from '../services/profesorApi';
import '../Student/StudentTheme.css';

const DoreziметStudentesh = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subject, lendaId } = location.state || {};

  const student = JSON.parse(localStorage.getItem('profesor') || localStorage.getItem('student') || '{}');
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
  
  // Project deadline management - new system like ideas
  const [projectDeadline, setProjectDeadline] = useState({ start: '', end: '', title: '' });
  const [projectDeadlinesList, setProjectDeadlinesList] = useState([]);
  const [showDeadlineForm, setShowDeadlineForm] = useState(false);
  const [selectedDeadlineIndex, setSelectedDeadlineIndex] = useState(null);
  const [deadlineStatus, setDeadlineStatus] = useState({ loading: true, saving: false, error: null, message: null });
  
  // Old deadline states - keeping for compatibility during transition
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

  // New helper functions for project deadline management (like ideas)
  const setProjectDatePart = (field, dateStr) => {
    if (!dateStr) {
      setProjectDeadline((prev) => ({ ...prev, [field]: '' }));
      return;
    }
    const defaultTime = field === 'end' ? '23:59' : '00:00';
    setProjectDeadline((prev) => ({ ...prev, [field]: `${dateStr}T${defaultTime}` }));
  };

  const get24hParts = (value) => {
    if (!value) return { hour: '00', minute: '00' };
    const parts = value.split('T')[1];
    if (!parts) return { hour: '00', minute: '00' };
    const [h, m] = parts.split(':');
    return { hour: pad2(Number(h) || 0), minute: pad2(Number(m) || 0) };
  };

  const setProjectTime24 = (field, hourStr, minuteStr) => {
    const h = pad2(Math.min(Math.max(Number(hourStr) || 0, 0), 23));
    const m = pad2(Math.min(Math.max(Number(minuteStr) || 0, 0), 59));
    setProjectDeadline((prev) => {
      const current = prev[field];
      const datePart = current?.split('T')[0] || new Date().toISOString().slice(0, 10);
      return { ...prev, [field]: `${datePart}T${h}:${m}` };
    });
  };

  const formatProjectDateDisplay = (value) => {
    if (!value) return 'Nuk është caktuar';
    const [datePart, timePart] = value.split('T');
    const timeClean = (timePart ?? '').slice(0, 5);
    return timeClean ? `${datePart} ${timeClean}`.trim() : datePart;
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

        // Load new project deadlines list (from JSON field in database)
        if (Array.isArray(data?.lenda?.projectDeadlinesJson) && data.lenda.projectDeadlinesJson.length > 0) {
          setProjectDeadlinesList(data.lenda.projectDeadlinesJson);
        } else if (startDateIso && endDateIso) {
          // Migrate old single deadline to new system
          setProjectDeadlinesList([{
            title: 'Afat i projektit',
            start: startDateIso.slice(0, 16),
            end: endDateIso.slice(0, 16)
          }]);
        } else {
          setProjectDeadlinesList([]);
        }

        setStatus({ loading: false, error: null });
        setDeadlineStatus({ loading: false, saving: false, error: null, message: null });
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

  const handleExportResults = async () => {
    try {
      // Export with current lenda and selected period filter
      await exportProjectResults(PROFESOR_ID, lendaId, selectedPeriod, {
        deadlineStartDate,
        deadlineStartHour,
        deadlineStartMinute,
        deadlineStartSecond,
        deadlineEndDate,
        deadlineEndHour,
        deadlineEndMinute,
        deadlineEndSecond
      });
      alert('Rezultatet u shkarkuan me sukses!');
    } catch (error) {
      alert('Error: ' + (error.message || 'Nuk u shkarkuan rezultatet'));
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
  }, [calculatePeriods]);

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

  // New handleSaveProjectDeadline - works like ideas
  const handleSaveProjectDeadline = async () => {
    if (!lendaId) {
      setDeadlineStatus({ loading: false, saving: false, error: 'Zgjidh lëndën përpara se të caktosh afatin.', message: null });
      return;
    }

    const baseItem = {
      title: projectDeadline.title?.trim() || 'Afat pa titull',
      start: projectDeadline.start || '',
      end: projectDeadline.end || '',
    };

    if (!baseItem.start || !baseItem.end) {
      setDeadlineStatus({ loading: false, saving: false, error: 'Plotëso si fillimin ashtu edhe mbarimin e afatit.', message: null });
      return;
    }

    const updatedDeadlinesList = (() => {
      if (selectedDeadlineIndex === null || selectedDeadlineIndex === undefined) {
        console.log('➕ Adding new project deadline to list');
        return [...projectDeadlinesList, baseItem];
      }
      console.log(`✏️ Updating project deadline at index ${selectedDeadlineIndex}`);
      return projectDeadlinesList.map((item, idx) => (idx === selectedDeadlineIndex ? baseItem : item));
    })();

    console.log(`📤 Sending project deadlines to backend:`, { count: updatedDeadlinesList.length, list: updatedDeadlinesList });

    const payload = {
      projectStartDate: projectDeadline.start ? `${projectDeadline.start}:00` : null,
      projectDeadline: projectDeadline.end ? `${projectDeadline.end}:00` : null,
      projectDeadlinesJson: updatedDeadlinesList,
    };

    if (payload.projectStartDate && payload.projectDeadline && payload.projectStartDate > payload.projectDeadline) {
      setDeadlineStatus({ loading: false, saving: false, error: 'Data e fillimit duhet të jetë para afatit.', message: null });
      return;
    }

    setDeadlineStatus({ loading: false, saving: true, error: null, message: null });
    try {
      const response = await updateProjectDeadline(PROFESOR_ID, lendaId, payload);
      const startValue = response.lenda?.projectStartDate ? response.lenda.projectStartDate.slice(0, 16) : '';
      const endValue = response.lenda?.projectDeadline ? response.lenda.projectDeadline.slice(0, 16) : '';
      
      setProjectDeadline({ start: startValue, end: endValue, title: baseItem.title });

      // Update deadlines list from backend response
      if (Array.isArray(response.lenda?.projectDeadlinesJson) && response.lenda.projectDeadlinesJson.length > 0) {
        console.log('✅ Backend returned:', response.lenda.projectDeadlinesJson.length, 'project afate');
        setProjectDeadlinesList(response.lenda.projectDeadlinesJson);
      } else {
        console.log('⚠️ Backend did not return JSON, using local list');
        setProjectDeadlinesList(updatedDeadlinesList);
      }

      // Reload periods
      calculatePeriods();

      // Hide form after saving
      setShowDeadlineForm(false);
      setSelectedDeadlineIndex(null);

      setDeadlineStatus({ loading: false, saving: false, error: null, message: 'Afati u ruajt me sukses.' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeadlineStatus(prev => ({ ...prev, message: null }));
      }, 3000);
    } catch (error) {
      setDeadlineStatus({ loading: false, saving: false, error: error?.message ?? 'Nuk u ruajt afati.', message: null });
    }
  };

  const handleClearProjectDeadline = async () => {
    if (!lendaId) {
      setDeadlineStatus({ loading: false, saving: false, error: 'Zgjidh lëndën përpara.', message: null });
      return;
    }

    if (selectedDeadlineIndex === null || selectedDeadlineIndex === undefined) {
      setDeadlineStatus({ loading: false, saving: false, error: 'Zgjidh një afat për ta fshirë.', message: null });
      return;
    }

    const updatedDeadlinesList = projectDeadlinesList.filter((_, idx) => idx !== selectedDeadlineIndex);
    console.log(`🗑️ Removing project deadline at index ${selectedDeadlineIndex}`, { remaining: updatedDeadlinesList.length });

    const payload = {
      projectStartDate: updatedDeadlinesList.length > 0 ? updatedDeadlinesList[updatedDeadlinesList.length - 1].start + ':00' : null,
      projectDeadline: updatedDeadlinesList.length > 0 ? updatedDeadlinesList[updatedDeadlinesList.length - 1].end + ':00' : null,
      projectDeadlinesJson: updatedDeadlinesList,
    };

    setDeadlineStatus({ loading: false, saving: true, error: null, message: null });
    try {
      const response = await updateProjectDeadline(PROFESOR_ID, lendaId, payload);
      
      if (Array.isArray(response.lenda?.projectDeadlinesJson)) {
        setProjectDeadlinesList(response.lenda.projectDeadlinesJson);
      } else {
        setProjectDeadlinesList(updatedDeadlinesList);
      }

      setProjectDeadline({ start: '', end: '', title: '' });
      setShowDeadlineForm(false);
      setSelectedDeadlineIndex(null);

      // Reload periods
      calculatePeriods();

      setDeadlineStatus({ loading: false, saving: false, error: null, message: 'Afati u fshi me sukses.' });
      
      setTimeout(() => {
        setDeadlineStatus(prev => ({ ...prev, message: null }));
      }, 3000);
    } catch (error) {
      setDeadlineStatus({ loading: false, saving: false, error: error?.message ?? 'Nuk u fshi afati.', message: null });
    }
  };

  // Old handleSetDeadline - keeping for compatibility
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
            style={{
              ...tabButtonStyle(false),
              background: '#0B2E33',
              border: '1px solid rgba(184,227,233,0.35)',
              color: '#B8E3E9',
              fontWeight: 700,
              marginTop: '1rem'
            }}
            onClick={handleExportResults}
            title="Shkarko rezultatet në Excel/CSV"
          >
            📥 Eksporto Rezultatet
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

          {/* DEADLINE TAB - NEW SYSTEM LIKE IDEAS */}
          {activeTab === 'deadline' && (
            <div style={{ display: 'grid', gridTemplateColumns: showDeadlineForm ? '1fr 340px' : '1fr', gap: '1.5rem' }}>
              {/* Form on left - hidden by default */}
              {showDeadlineForm && (
                <div style={{ background: 'rgba(11,46,51,0.75)', borderRadius: 18, border: '1px solid rgba(184,227,233,0.25)', padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#B8E3E9', display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '0.2px' }}>
                    Afati i dorëzimit të projektit
                    {deadlineStatus.loading && <span style={{ fontSize: 12, color: '#cfeee0' }}>Duke u lexuar...</span>}
                    {deadlineStatus.error && <span style={{ fontSize: 12, color: '#f8b4b4' }}>{deadlineStatus.error}</span>}
                    {deadlineStatus.message && <span style={{ fontSize: 12, color: '#7be7b2' }}>{deadlineStatus.message}</span>}
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Emërtimi i dorëzimit (opsional)</div>
                    <input
                      type="text"
                      placeholder="Vendos titullin e Assignment."
                      value={projectDeadline.title || ''}
                      onChange={(e) => setProjectDeadline(prev => ({ ...prev, title: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 10,
                        border: '1px solid rgba(184,227,233,0.35)',
                        background: 'rgba(11,46,51,0.6)',
                        color: '#B8E3E9',
                        fontSize: 14,
                        fontWeight: 500,
                        outline: 'none'
                      }}
                      disabled={deadlineStatus.loading || deadlineStatus.saving}
                    />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Fillimi</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="date"
                          style={{
                            width: '100%',
                            borderRadius: 12,
                            border: '1px solid rgba(184,227,233,0.25)',
                            background: 'rgba(11,46,51,0.6)',
                            color: '#B8E3E9',
                            padding: '0.65rem 0.75rem'
                          }}
                          value={projectDeadline.start ? projectDeadline.start.split('T')[0] : ''}
                          onChange={(e) => setProjectDatePart('start', e.target.value)}
                          disabled={deadlineStatus.loading || deadlineStatus.saving}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(90px, 1fr))', gap: '0.5rem', marginTop: 8 }}>
                          <select
                            style={{
                              width: '100%',
                              borderRadius: 10,
                              border: '1px solid rgba(184,227,233,0.25)',
                              background: 'rgba(11,46,51,0.6)',
                              color: '#B8E3E9',
                              padding: '0.55rem 0.6rem'
                            }}
                            value={get24hParts(projectDeadline.start).hour}
                            onChange={(e) => setProjectTime24('start', e.target.value, get24hParts(projectDeadline.start).minute)}
                            disabled={deadlineStatus.loading || deadlineStatus.saving}
                          >
                            {Array.from({ length: 24 }, (_, i) => pad2(i)).map((h) => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                          <select
                            style={{
                              width: '100%',
                              borderRadius: 10,
                              border: '1px solid rgba(184,227,233,0.25)',
                              background: 'rgba(11,46,51,0.6)',
                              color: '#B8E3E9',
                              padding: '0.55rem 0.6rem'
                            }}
                            value={get24hParts(projectDeadline.start).minute}
                            onChange={(e) => setProjectTime24('start', get24hParts(projectDeadline.start).hour, e.target.value)}
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
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="date"
                          style={{
                            width: '100%',
                            borderRadius: 12,
                            border: '1px solid rgba(184,227,233,0.25)',
                            background: 'rgba(11,46,51,0.6)',
                            color: '#B8E3E9',
                            padding: '0.65rem 0.75rem'
                          }}
                          value={projectDeadline.end ? projectDeadline.end.split('T')[0] : ''}
                          onChange={(e) => setProjectDatePart('end', e.target.value)}
                          disabled={deadlineStatus.loading || deadlineStatus.saving}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(90px, 1fr))', gap: '0.5rem', marginTop: 8 }}>
                          <select
                            style={{
                              width: '100%',
                              borderRadius: 10,
                              border: '1px solid rgba(184,227,233,0.25)',
                              background: 'rgba(11,46,51,0.6)',
                              color: '#B8E3E9',
                              padding: '0.55rem 0.6rem'
                            }}
                            value={get24hParts(projectDeadline.end).hour}
                            onChange={(e) => setProjectTime24('end', e.target.value, get24hParts(projectDeadline.end).minute)}
                            disabled={deadlineStatus.loading || deadlineStatus.saving}
                          >
                            {Array.from({ length: 24 }, (_, i) => pad2(i)).map((h) => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                          <select
                            style={{
                              width: '100%',
                              borderRadius: 10,
                              border: '1px solid rgba(184,227,233,0.25)',
                              background: 'rgba(11,46,51,0.6)',
                              color: '#B8E3E9',
                              padding: '0.55rem 0.6rem'
                            }}
                            value={get24hParts(projectDeadline.end).minute}
                            onChange={(e) => setProjectTime24('end', get24hParts(projectDeadline.end).hour, e.target.value)}
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
                  
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      style={{
                        borderRadius: 12,
                        border: '1px solid rgba(184,227,233,0.4)',
                        background: '#0B2E33',
                        color: '#B8E3E9',
                        fontWeight: 700,
                        padding: '0.65rem 1.2rem',
                        cursor: 'pointer',
                        transition: 'all 200ms ease'
                      }}
                      onClick={handleSaveProjectDeadline}
                      disabled={deadlineStatus.loading || deadlineStatus.saving}
                    >
                      {deadlineStatus.saving ? 'Duke ruajtur...' : 'Ruaj afatin'}
                    </button>
                    <button
                      style={{
                        borderRadius: 12,
                        border: '1px solid rgba(184,227,233,0.4)',
                        background: 'rgba(11,46,51,0.6)',
                        color: '#B8E3E9',
                        fontWeight: 600,
                        padding: '0.65rem 1.2rem',
                        cursor: 'pointer',
                        transition: 'all 200ms ease'
                      }}
                      onClick={handleClearProjectDeadline}
                      disabled={deadlineStatus.loading || deadlineStatus.saving || (!projectDeadline.start && !projectDeadline.end) || selectedDeadlineIndex === null}
                    >
                      Hiq afatin
                    </button>
                  </div>
                </div>
              )}

              {/* List on right */}
              <div style={{ background: 'rgba(11,46,51,0.75)', borderRadius: 18, border: '1px solid rgba(184,227,233,0.35)', padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  style={{
                    borderRadius: 12,
                    border: '1px solid rgba(184,227,233,0.4)',
                    background: '#0B2E33',
                    color: '#B8E3E9',
                    fontWeight: 700,
                    padding: '0.8rem 1.6rem',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    width: '100%',
                    marginBottom: '1rem'
                  }}
                  onClick={() => {
                    setShowDeadlineForm(true);
                    setProjectDeadline({ start: '', end: '', title: '' });
                    setSelectedDeadlineIndex(null);
                  }}
                >
                  + Shto afat të ri
                </button>

                <div style={{ fontSize: 12, opacity: 0.75, marginBottom: '0.75rem' }}>Afatet ekzistues:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', minHeight: '200px', overflowY: 'auto', overflowX: 'visible', paddingRight: '0.5rem' }}>
                  {projectDeadlinesList.length === 0 ? (
                    <div style={{ textAlign: 'center', opacity: 0.6, padding: '1rem' }}>
                      Nuk ka afate të ruajtuara
                    </div>
                  ) : (
                    projectDeadlinesList.map((deadline, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          padding: '0.75rem 0.9rem',
                          borderRadius: 14,
                          background: '#0B2E33',
                          border: '1px solid rgba(184,227,233,0.2)',
                          width: '100%',
                          overflow: 'visible',
                          minWidth: 0,
                          gap: '0.75rem',
                          cursor: 'pointer',
                          marginBottom: '0.5rem'
                        }}
                        onClick={() => {
                          setShowDeadlineForm(true);
                          setProjectDeadline(deadline);
                          setSelectedDeadlineIndex(idx);
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(184, 227, 233, 0.12)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#0B2E33'}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>
                            {deadline.title || 'Afat pa titull'}
                          </div>
                          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 3 }}>
                            {formatProjectDateDisplay(deadline.start)} → {formatProjectDateDisplay(deadline.end)}
                          </div>
                        </div>
                        <button
                          style={{
                            borderRadius: 10,
                            border: '1px solid rgba(184,227,233,0.35)',
                            background: 'transparent',
                            color: '#B8E3E9',
                            fontSize: 12,
                            padding: '0.35rem 0.6rem',
                            cursor: 'pointer',
                            marginLeft: 8,
                            transition: 'all 200ms ease'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeadlineForm(true);
                            setProjectDeadline(deadline);
                            setSelectedDeadlineIndex(idx);
                          }}
                        >
                          Modifiko
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(184,227,233,0.2)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#B8E3E9', marginBottom: '0.5rem' }}>
                    Afati aktual:
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>
                    {projectDeadline.start && projectDeadline.end ? (
                      <>
                        {projectDeadline.title && (
                          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                            {projectDeadline.title}
                          </div>
                        )}
                        <div>{formatProjectDateDisplay(projectDeadline.start)}</div>
                        <div style={{ marginTop: '0.25rem' }}>{formatProjectDateDisplay(projectDeadline.end)}</div>
                      </>
                    ) : (
                      <span style={{ opacity: 0.6 }}>Nuk ka afat të zgjedhur</span>
                    )}
                  </div>
                </div>
              </div>
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
