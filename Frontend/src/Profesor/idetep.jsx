import React, { useState, useEffect, useCallback, useMemo } from 'react';
import JSZip from 'jszip';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProfesorIdeas, getStudentSubmissions, getIdeaDeadline, updateIdeaDeadline, uploadLendaTemplate, getLendaTemplateInfo, deleteLendaTemplate } from '../services/profesorApi';
import './idetep.css';

const Idetep = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const subjectName = location.state?.subject ?? 'Lëndë e pa specifikuar';
  const lendaId = location.state?.lendaId ?? null;
  const student = JSON.parse(localStorage.getItem('profesor') || localStorage.getItem('student') || '{}');
  const PROFESOR_ID = student.id || 1;

  const [ideas, setIdeas] = useState([]);
  const [listStatus, setListStatus] = useState({ loading: true, error: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState([]);
  const [filesStatus, setFilesStatus] = useState({ loading: true, error: null });
  const [fileSearchTerm, setFileSearchTerm] = useState('');
  const [ideaDeadline, setIdeaDeadline] = useState({ start: '', end: '' });
  const [deadlineStatus, setDeadlineStatus] = useState({ loading: true, saving: false, error: null, message: null });
  const [templateInfo, setTemplateInfo] = useState({ hasTemplate: false, fileName: '' });
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [periods, setPeriods] = useState([]);
  const [deadlineTitle, setDeadlineTitle] = useState('');
  const [activeTab, setActiveTab] = useState('ideas');
  const [toastMessage, setToastMessage] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, message: '', onConfirm: null });
  const [showDeadlineForm, setShowDeadlineForm] = useState(false);
  const [deadlinesList, setDeadlinesList] = useState([]);
  const [selectedDeadlineIndex, setSelectedDeadlineIndex] = useState(null);

  const spacing = isMobile ? '1rem' : '1.5rem';
  const panelPadding = isMobile ? '1.25rem' : '2rem';
  const cardPadding = isMobile ? '1rem' : '1.25rem';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        createdAt: file.createdAt,
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

  const getSubmissionDate = (item) => {
    const raw = item?.submission_date || item?.submissionDate || item?.createdAt || item?.created_at;
    if (!raw) return null;
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const calculatePeriods = () => {
    const months = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];
    const periodsMap = new Map();

    // ✅ Add ALL deadlines from deadlinesList
    deadlinesList.forEach((deadline, idx) => {
      if (deadline.start && deadline.end) {
        const startDate = new Date(deadline.start);
        const endDate = new Date(deadline.end);
        const customTitle = deadline.title || null;
        const id = `deadline-${idx}-${customTitle ? customTitle.replace(/\s+/g, '-') : startDate.getTime()}`;
        
        periodsMap.set(id, {
          id: id,
          label: customTitle ? `📌 ${customTitle}` : `📅 ${startDate.toLocaleDateString('sq-AL')}`,
          startDate: startDate,
          endDate: endDate,
          isDeadline: true,
          customTitle: customTitle,
          deadlineData: deadline
        });
      }
    });

    // ✅ ALSO: Generate periods from actual idea submission dates (but skip if matches any deadline)
    ideas.forEach((idea) => {
      const submitDate = new Date(idea.createdAt || idea.created_at);
      const year = submitDate.getFullYear();
      const month = submitDate.getMonth();
      const key = `${year}-${month}`;
      
      // Skip if this submission falls within any deadline period
      let isInDeadline = false;
      deadlinesList.forEach(deadline => {
        if (deadline.start && deadline.end) {
          const deadlineStart = new Date(deadline.start);
          const deadlineEnd = new Date(deadline.end);
          if (submitDate >= deadlineStart && submitDate <= deadlineEnd) {
            isInDeadline = true;
          }
        }
      });
      
      if (isInDeadline) return; // Skip, it's already in a deadline period

      if (!periodsMap.has(key)) {
        const endMonth = (month + 2) % 12;
        const endYear = month + 2 >= 12 ? year + 1 : year;
        const periodLabel = `${months[month]} - ${months[endMonth]} ${year}`;

        periodsMap.set(key, {
          id: key,
          label: `📅 ${periodLabel}`,
          startDate: new Date(year, month, 1),
          endDate: new Date(endYear, (endMonth + 1) % 12, 0),
          isDeadline: false
        });
      }
    });

    const periodsList = Array.from(periodsMap.values());
    setPeriods(periodsList);
  };

  const loadIdeaDeadline = useCallback(async () => {
    if (!lendaId) {
      setIdeaDeadline({ start: '', end: '' });
      setDeadlineTitle('');
      setDeadlineStatus({ loading: false, saving: false, error: null, message: null });
      setDeadlinesList([]);
      return;
    }

    setDeadlineStatus({ loading: true, saving: false, error: null, message: null });
    try {
      const response = await getIdeaDeadline(PROFESOR_ID, lendaId);
      console.log('📌 loadIdeaDeadline response:', response);
      
      const startValue = response.lenda?.ideaStartDate ? response.lenda.ideaStartDate.slice(0, 16) : '';
      const endValue = response.lenda?.ideaDeadline ? response.lenda.ideaDeadline.slice(0, 16) : '';
      const titleValue = response.lenda?.ideaTitle || '';
      setIdeaDeadline({ start: startValue, end: endValue });
      setDeadlineTitle(titleValue);

      // ✅ Populo listën nga JSON në DB (nëse ekziston)
      if (Array.isArray(response.lenda?.ideaDeadlinesJson) && response.lenda.ideaDeadlinesJson.length > 0) {
        console.log('✅ Loading from ideaDeadlinesJson:', response.lenda.ideaDeadlinesJson.length, 'afate');
        setDeadlinesList(response.lenda.ideaDeadlinesJson);
      } else if (startValue && endValue) {
        console.log('⚠️ No JSON found, creating from single deadline');
        setDeadlinesList([
          {
            title: titleValue || 'Afat pa titull',
            start: startValue,
            end: endValue
          }
        ]);
      } else {
        console.log('ℹ️ No deadlines found');
        setDeadlinesList([]);
      }

      setDeadlineStatus({ loading: false, saving: false, error: null, message: null });
    } catch (error) {
      setDeadlineStatus({ loading: false, saving: false, error: error?.message ?? 'Nuk u lexuan afatet.', message: null });
    }
  }, [PROFESOR_ID, lendaId]);

  const loadTemplateInfo = useCallback(async () => {
    if (!lendaId) {
      setTemplateInfo({ hasTemplate: false, fileName: '' });
      return;
    }
    try {
      const data = await getLendaTemplateInfo(PROFESOR_ID, lendaId);
      setTemplateInfo(data.hasTemplate ? { hasTemplate: true, fileName: data.fileName } : { hasTemplate: false, fileName: '' });
    } catch (error) {
      console.error('Error loading template info:', error);
      setTemplateInfo({ hasTemplate: false, fileName: '' });
    }
  }, [PROFESOR_ID, lendaId]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadingTemplate(true);
      await uploadLendaTemplate(PROFESOR_ID, lendaId, file);
      await loadTemplateInfo();
      alert('Template u ngarkua me sukses!');
    } catch (error) {
      alert('Error: ' + (error.message || 'Ngarkimi dështoi'));
    } finally {
      setUploadingTemplate(false);
    }
  };

  const handleDeleteTemplate = async () => {
    setConfirmDialog({
      open: true,
      message: 'A jeni të sigurt që dëshironi të fshini template-in?',
      onConfirm: async () => {
        try {
          setUploadingTemplate(true);
          await deleteLendaTemplate(PROFESOR_ID, lendaId);
          setTemplateInfo({ hasTemplate: false, fileName: '' });
          setToastMessage({ type: 'success', text: 'Template u fshi me sukses!' });
          setTimeout(() => setToastMessage(null), 4000);
        } catch (error) {
          setToastMessage({ type: 'error', text: 'Error: ' + (error.message || 'Fshirja dështoi') });
          setTimeout(() => setToastMessage(null), 4000);
        } finally {
          setUploadingTemplate(false);
        }
        setConfirmDialog({ open: false, message: '', onConfirm: null });
      }
    });
  };

  useEffect(() => {
    loadIdeas();
    loadFiles();
    loadIdeaDeadline();
    loadTemplateInfo();
  }, [loadIdeas, loadFiles, loadIdeaDeadline, loadTemplateInfo]);

  // Calculate periods whenever deadline or submission data changes
  useEffect(() => {
    calculatePeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaDeadline, ideas, files]);

  const filteredIdeas = useMemo(() => {
    if (!selectedPeriod || selectedPeriod === 'all') return ideas;
    const period = periods.find(p => p.id === selectedPeriod);
    if (!period) return ideas;
    
    return ideas.filter(idea => {
      const submitDate = new Date(idea.createdAt || idea.created_at);
      // Always use deadline date ranges for accurate filtering
      return submitDate >= period.startDate && submitDate <= period.endDate;
    });
  }, [ideas, selectedPeriod, periods]);

  const filteredFiles = useMemo(() => {
    if (!selectedPeriod || selectedPeriod === 'all') return files;
    const period = periods.find(p => p.id === selectedPeriod);
    if (!period) return files;
    
    return files.filter(file => {
      const submitDate = new Date(file.createdAt);
      // Always use deadline date ranges for accurate filtering
      return submitDate >= period.startDate && submitDate <= period.endDate;
    });
  }, [files, selectedPeriod, periods]);

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

  const handleDownloadIdea = (idea) => {
    const safeName = `ide_${(idea?.title || idea?.shorthand || 'idea')}`
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '');
    
    const rows = [
      ['Titulli', idea?.title || ''],
      ['Shkurtesa', idea?.shorthand || ''],
      ['Lënda', idea?.subject?.name || subjectName],
      ['Studenti', idea?.studentName || 'N/A'],
      ['Tipi', idea?.type || ''],
      ['Data', idea?.createdAt || idea?.created_at || '']
    ];
    
    const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `${safeName}.csv`);
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

    const baseItem = {
      title: deadlineTitle.trim() || 'Afat pa titull',
      start: ideaDeadline.start || '',
      end: ideaDeadline.end || '',
    };

    const updatedDeadlinesList = (() => {
      if (!baseItem.start || !baseItem.end) return deadlinesList;
      if (selectedDeadlineIndex === null || selectedDeadlineIndex === undefined) {
        console.log('➕ Adding new deadline to list');
        return [...deadlinesList, baseItem];
      }
      console.log(`✏️ Updating deadline at index ${selectedDeadlineIndex}`);
      return deadlinesList.map((item, idx) => (idx === selectedDeadlineIndex ? baseItem : item));
    })();

    console.log(`📤 Sending to backend:`, { count: updatedDeadlinesList.length, list: updatedDeadlinesList });

    const payload = {
      ideaStartDate: normalizeDateInput(ideaDeadline.start),
      ideaDeadline: normalizeDateInput(ideaDeadline.end),
      ideaTitle: deadlineTitle.trim() || null,
      ideaDeadlinesJson: updatedDeadlinesList,
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
      const titleValue = response.lenda?.ideaTitle || '';
      setIdeaDeadline({ start: startValue, end: endValue });
      setDeadlineTitle(titleValue);

      // Reload data to update periods
      calculatePeriods();

      // ✅ Përditëso listën nga backend, ose përdor listën lokale
      if (Array.isArray(response.lenda?.ideaDeadlinesJson) && response.lenda.ideaDeadlinesJson.length > 0) {
        console.log('✅ Backend returned:', response.lenda.ideaDeadlinesJson.length, 'afate');
        setDeadlinesList(response.lenda.ideaDeadlinesJson);
      } else if (startValue && endValue) {
        console.log('⚠️ Backend did not return JSON, using local list');
        setDeadlinesList(updatedDeadlinesList);
      }

      // ✅ Fsheh formën pas ruajtes
      setShowDeadlineForm(false);
      setSelectedDeadlineIndex(null);

      setDeadlineStatus({ loading: false, saving: false, error: null, message: 'Afati u ruajt me sukses.' });
    } catch (error) {
      setDeadlineStatus({ loading: false, saving: false, error: error?.message ?? 'Nuk u ruajt afati.', message: null });
    }
  };

  const handleClearDeadline = async () => {
    if (!lendaId) return;
    setDeadlineStatus({ loading: false, saving: true, error: null, message: null });
    try {
      const nextDeadlinesList = (selectedDeadlineIndex === null || selectedDeadlineIndex === undefined)
        ? deadlinesList.filter((dl) => !(dl.start === ideaDeadline.start && dl.end === ideaDeadline.end))
        : deadlinesList.filter((_, idx) => idx !== selectedDeadlineIndex);

      const response = await updateIdeaDeadline(PROFESOR_ID, lendaId, {
        ideaStartDate: null,
        ideaDeadline: null,
        ideaTitle: null,
        ideaDeadlinesJson: nextDeadlinesList,
      });
      const startValue = response.lenda?.ideaStartDate ? response.lenda.ideaStartDate.slice(0, 16) : '';
      const endValue = response.lenda?.ideaDeadline ? response.lenda.ideaDeadline.slice(0, 16) : '';
      setIdeaDeadline({ start: startValue, end: endValue });
      
      // ✅ Fshij afatin nga lista
      if (Array.isArray(response.lenda?.ideaDeadlinesJson)) {
        setDeadlinesList(response.lenda.ideaDeadlinesJson);
      } else {
        setDeadlinesList(nextDeadlinesList);
      }
      
      // ✅ Fsheh formën
      setShowDeadlineForm(false);
      setSelectedDeadlineIndex(null);
      
      setDeadlineStatus({ loading: false, saving: false, error: null, message: 'Afati u fshi.' });
    } catch (error) {
      setDeadlineStatus({ loading: false, saving: false, error: error?.message ?? 'Nuk u fshi afati.', message: null });
    }
  };

  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #0B2E33 100%, #0B2E33 0%)',
    color: '#B8E3E9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, system-ui, sans-serif',
    padding: isMobile ? '1rem' : '2rem',
    overflow: 'hidden',
    boxSizing: 'border-box'
  };

  const modalStyle = {
    width: '100%',
    maxWidth: isMobile ? '95vw' : '1100px',
    background: '#0B2E33',
    borderRadius: isMobile ? 16 : 28,
    border: '1px solid rgba(184,227,233,0.35)',
    boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
    padding: isMobile ? '1rem' : '2rem',
    position: 'relative',
    boxSizing: 'border-box',
    maxHeight: '90vh',
    overflowY: 'auto'
  };

  const closeButtonStyle = {
    position: 'absolute',
    right: 24,
    top: 20,
    background: 'transparent',
    border: '1px solid rgba(184,227,233,0.3)',
    borderRadius: 20,
    width: 38,
    height: 38,
    color: '#B8E3E9',
    cursor: 'pointer',
    transition: 'all 200ms ease'
  };

  const columnsStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: spacing,
    marginTop: '1rem'
  };

  const columnCard = {
    background: 'rgba(11,46,51,0.75)',
    borderRadius: isMobile ? 12 : 20,
    border: '1px solid rgba(184,227,233,0.25)',
    padding: cardPadding,
    minHeight: isMobile ? 280 : 360
  };

  const searchInput = {
    width: '100%',
    padding: '0.75rem 0.9rem',
    borderRadius: 14,
    border: '1px solid rgba(184,227,233,0.25)',
    background: 'rgba(11,46,51,0.6)',
    color: '#B8E3E9',
    marginBottom: '1rem'
  };

  const ideaList = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    maxHeight: '220px',
    overflowY: 'auto',
    overflowX: 'visible',
    paddingRight: '0.5rem'
  };

  const ideaItem = {
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
    gap: '0.75rem'
  };

  const tinyButton = {
    borderRadius: 10,
    border: '1px solid rgba(184,227,233,0.35)',
    background: 'transparent',
    color: '#B8E3E9',
    fontSize: 12,
    padding: '0.35rem 0.6rem',
    cursor: 'pointer',
    marginLeft: 8,
    transition: 'all 200ms ease'
  };

  const downloadButton = {
    borderRadius: 10,
    border: '1px solid rgba(184,227,233,0.35)',
    background: 'transparent',
    color: '#B8E3E9',
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
    border: '1px solid rgba(184,227,233,0.3)',
    color: '#B8E3E9'
  };

  const primaryButton = {
    borderRadius: 12,
    border: '1px solid rgba(184,227,233,0.4)',
    background: '#0B2E33',
    color: '#B8E3E9',
    fontWeight: 700,
    padding: '0.8rem 1.6rem',
    cursor: 'pointer',
    transition: 'all 200ms ease'
  };

  const secondaryButton = {
    borderRadius: 12,
    border: '1px solid rgba(184,227,233,0.4)',
    background: 'rgba(11,46,51,0.6)',
    color: '#B8E3E9',
    fontWeight: 600,
    padding: '0.8rem 1.6rem',
    cursor: 'pointer',
    transition: 'all 200ms ease'
  };

  // Footer styling (layout helper)
  // const footerStyle = {
  //   marginTop: '1.5rem',
  //   display: 'flex',
  //   justifyContent: 'space-between'
  // };

  const deadlineBar = {
    marginTop: '1.25rem',
    display: 'grid',
    gridTemplateColumns: 'minmax(360px, 1fr) minmax(260px, 0.8fr)',
    gap: '1rem',
    alignItems: 'stretch'
  };

  const deadlineCard = {
    background: 'rgba(11,46,51,0.75)',
    borderRadius: 18,
    border: '1px solid rgba(184,227,233,0.25)',
    padding: '1rem 1.1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem'
  };

  const deadlineLabel = {
    fontSize: 14,
    fontWeight: 700,
    color: '#B8E3E9',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    letterSpacing: '0.2px'
  };

  const deadlineInput = {
    width: '100%',
    borderRadius: 12,
    border: '1px solid rgba(184,227,233,0.25)',
    background: 'rgba(11,46,51,0.6)',
    color: '#B8E3E9',
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
    border: '1px solid rgba(184,227,233,0.25)',
    background: 'rgba(11,46,51,0.6)',
    color: '#B8E3E9',
    padding: '0.55rem 0.6rem'
  };

  const deadlineActions = {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap'
  };

  const deadlineSummary = {
    ...deadlineCard,
    borderColor: 'rgba(184,227,233,0.35)',
    background: 'rgba(11,46,51,0.75)'
  };

  const containerStyle = {
    display: isMobile ? 'block' : 'flex',
    maxWidth: 1400,
    margin: '0 auto',
    padding: panelPadding,
    gap: spacing,
    minHeight: 'calc(100vh - 80px)',
    alignItems: 'stretch'
  };

  const leftPanelStyle = {
    flex: isMobile ? '1' : '0 0 280px',
    background: 'rgba(11,46,51,0.75)',
    border: '1px solid rgba(184,227,233,0.35)',
    borderRadius: 18,
    padding: panelPadding,
    minHeight: isMobile ? 'auto' : 'calc(100vh - 180px)',
    position: isMobile ? 'relative' : 'sticky',
    top: isMobile ? '0' : '2rem',
    marginBottom: isMobile ? '2rem' : '0',
    alignSelf: 'stretch'
  };

  const rightPanelStyle = {
    flex: 1,
    background: 'rgba(11,46,51,0.75)',
    border: '1px solid rgba(184,227,233,0.35)',
    borderRadius: 18,
    padding: panelPadding,
    minHeight: isMobile ? 'auto' : 'calc(100vh - 180px)',
    alignSelf: 'stretch'
  };

  const tabButtonStyle = (isActive) => ({
    width: '100%',
    padding: '1rem',
    background: isActive ? 'rgba(184,227,233,0.12)' : 'rgba(11,46,51,0.6)',
    border: `1px solid ${isActive ? '#B8E3E9' : 'rgba(184,227,233,0.25)'}`,
    borderRadius: 12,
    color: isActive ? '#B8E3E9' : 'rgba(184,227,233,0.85)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '0.75rem',
    transition: 'all 0.2s',
    textAlign: 'left'
  });

  const backButtonStyle = {
    background: '#0B2E33',
    border: '1px solid rgba(184,227,233,0.4)',
    borderRadius: 10,
    padding: '0.6rem 1.2rem',
    color: '#B8E3E9',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    marginTop: '1rem'
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Left Sidebar */}
        <div style={leftPanelStyle}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#B8E3E9', marginBottom: '1.5rem', textAlign: 'center', letterSpacing: 1 }}>
            {subjectName}
          </h2>
          <button
            style={tabButtonStyle(activeTab === 'deadline')}
            onClick={() => setActiveTab('deadline')}
          >
            Afati i dorëzimit
          </button>
          <button
            style={tabButtonStyle(activeTab === 'template')}
            onClick={() => setActiveTab('template')}
          >
            Template
          </button>
          <button
            style={tabButtonStyle(activeTab === 'ideas')}
            onClick={() => setActiveTab('ideas')}
          >
            Lista e Ideve
          </button>
          <button
            style={tabButtonStyle(activeTab === 'files')}
            onClick={() => setActiveTab('files')}
          >
            File-t e Dërguara
          </button>
          <button style={backButtonStyle} onClick={() => navigate(-1)}>
            Kthehu Mbrapa
          </button>
        </div>

        {/* Right Content */}
        <div style={rightPanelStyle}>
          {/* Afati i dorëzimit Tab */}
          {activeTab === 'deadline' && (
            <div style={{ display: 'grid', gridTemplateColumns: showDeadlineForm ? '1fr 280px' : '1fr', gap: '1.5rem' }}>
              {/* Forma në të majtë - fshehur by default */}
              {showDeadlineForm && (
                <div style={deadlineCard}>
                  <div style={deadlineLabel}>
                    Afati i dorëzimit të idesë
                    {deadlineStatus.loading && <span style={{ fontSize: 12, color: '#cfeee0' }}>Duke u lexuar...</span>}
                    {deadlineStatus.error && <span style={{ fontSize: 12, color: '#f8b4b4' }}>{deadlineStatus.error}</span>}
                    {deadlineStatus.message && <span style={{ fontSize: 12, color: '#7be7b2' }}>{deadlineStatus.message}</span>}
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Emërtimi i dorëzimit (opsional)</div>
                    <input
                      type="text"
                      placeholder="Vendos titullin e Assignment."
                      value={deadlineTitle}
                      onChange={(e) => setDeadlineTitle(e.target.value)}
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
                  </div>
                </div>
              )}

              {/* Lista në të djathtë */}
              <div style={deadlineCard}>
                <button
                  style={{ ...primaryButton, width: '100%', marginBottom: '1rem' }}
                  onClick={() => {
                    setShowDeadlineForm(true);
                    setIdeaDeadline({ start: '', end: '' });
                    setDeadlineTitle('');
                    setSelectedDeadlineIndex(null);
                  }}
                >
                  + Shto afat të ri
                </button>

                <div style={{ fontSize: 12, opacity: 0.75, marginBottom: '0.75rem' }}>Afatet ekzistues:</div>
                <div style={{ ...ideaList, maxHeight: '400px', minHeight: '200px' }}>
                  {deadlinesList.length === 0 ? (
                    <div style={{ textAlign: 'center', opacity: 0.6, padding: '1rem' }}>
                      Nuk ka afate të ruajur
                    </div>
                  ) : (
                    deadlinesList.map((deadline, idx) => (
                      <div
                        key={idx}
                        style={{ ...ideaItem, cursor: 'pointer', marginBottom: '0.5rem' }}
                        onClick={() => {
                          setShowDeadlineForm(true);
                          setIdeaDeadline(deadline);
                          setDeadlineTitle(deadline.title || '');
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
                            {formatDateDisplay(deadline.start)} → {formatDateDisplay(deadline.end)}
                          </div>
                        </div>
                        <button
                          style={{ ...tinyButton, marginLeft: '0.5rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeadlineForm(true);
                            setIdeaDeadline(deadline);
                            setDeadlineTitle(deadline.title || '');
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
                    {ideaDeadline.start && ideaDeadline.end ? (
                      <>
                        {deadlineTitle && (
                          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                            {deadlineTitle}
                          </div>
                        )}
                        <div>{formatDateDisplay(ideaDeadline.start)}</div>
                        <div style={{ marginTop: '0.25rem' }}>{formatDateDisplay(ideaDeadline.end)}</div>
                      </>
                    ) : (
                      <span style={{ opacity: 0.6 }}>Nuk ka afat të zgjedhur</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Template/Instruksionet Tab */}
          {activeTab === 'template' && (
            <div style={{
              background: 'rgba(11,46,51,0.75)',
              border: '1px solid rgba(184,227,233,0.25)',
              borderRadius: 12,
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: '0 0 0.75rem', fontSize: 16, color: '#B8E3E9' }}>Template/Instruksionet</h3>
              {templateInfo.hasTemplate ? (
                <div>
                  <p style={{ margin: '0 0 0.75rem', fontSize: 14, color: '#B8E3E9' }}>
                    <strong>File:</strong> {templateInfo.fileName}
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <label
                      htmlFor="template-upload"
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: 'rgba(184,227,233,0.12)',
                        border: '1px solid rgba(184,227,233,0.5)',
                        borderRadius: 8,
                        color: '#B8E3E9',
                        fontWeight: 600,
                        cursor: uploadingTemplate ? 'not-allowed' : 'pointer',
                        textAlign: 'center',
                        fontSize: 13,
                        opacity: uploadingTemplate ? 0.5 : 1,
                        transition: 'all 200ms ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!uploadingTemplate) {
                          e.currentTarget.style.background = 'rgba(184, 227, 233, 0.2)';
                          e.currentTarget.style.borderColor = '#B8E3E9';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(184, 227, 233, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!uploadingTemplate) {
                          e.currentTarget.style.background = 'rgba(184, 227, 233, 0.12)';
                          e.currentTarget.style.borderColor = 'rgba(184, 227, 233, 0.5)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {uploadingTemplate ? 'Duke ngarkuar...' : 'Ndrysho'}
                    </label>
                    <button
                      onClick={handleDeleteTemplate}
                      disabled={uploadingTemplate}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: 'rgba(255,82,82,0.2)',
                        border: '1px solid rgba(255,82,82,0.5)',
                        borderRadius: 8,
                        color: '#ff5252',
                        fontWeight: 600,
                        cursor: uploadingTemplate ? 'not-allowed' : 'pointer',
                        fontSize: 13,
                        opacity: uploadingTemplate ? 0.5 : 1,
                        transition: 'all 200ms ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!uploadingTemplate) {
                          e.currentTarget.style.background = 'rgba(255, 82, 82, 0.3)';
                          e.currentTarget.style.borderColor = '#ff5252';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 82, 82, 0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!uploadingTemplate) {
                          e.currentTarget.style.background = 'rgba(255, 82, 82, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(255, 82, 82, 0.5)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      Fshi
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ margin: '0 0 0.75rem', fontSize: 14, opacity: 0.85, color: '#B8E3E9' }}>
                    Nuk ka template të ngarkuar
                  </p>
                  <label
                    htmlFor="template-upload"
                    style={{
                      display: 'block',
                      padding: '0.6rem',
                      background: 'rgba(184,227,233,0.12)',
                      border: '1px solid rgba(184,227,233,0.5)',
                      borderRadius: 8,
                      color: '#B8E3E9',
                      fontWeight: 700,
                      cursor: uploadingTemplate ? 'not-allowed' : 'pointer',
                      textAlign: 'center',
                      fontSize: 14,
                      opacity: uploadingTemplate ? 0.5 : 1
                    }}
                  >
                    {uploadingTemplate ? 'Duke ngarkuar...' : 'Ngarko Template'}
                  </label>
                </div>
              )}
              <input
                id="template-upload"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                disabled={uploadingTemplate}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* Lista e Ideve Tab */}
          {activeTab === 'ideas' && (
            <div style={columnCard}>
              <h3 style={{ margin: '0 0 1rem', fontSize: 18, color: '#B8E3E9' }}>Lista e Ideve</h3>
              {periods.length > 0 && (
                <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      borderRadius: 10,
                      border: '1px solid rgba(184,227,233,0.35)',
                      background: 'rgba(11,46,51,0.6)',
                      color: '#B8E3E9',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">Të gjitha periudhat</option>
                    {periods.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              )}
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
                {!listStatus.loading && !listStatus.error && filteredIdeas.length === 0 && selectedPeriod && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    Nuk ka ide të dorëzuara në këtë periudhë.
                  </div>
                )}
                {!listStatus.loading && !listStatus.error && filteredIdeas
                  .filter(idea => {
                    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      idea.shorthand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (idea.studentName && idea.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
                    return matchesSearch;
                  })
                  .filter(idea => {
                    if (selectedPeriod === 'all') return true;
                    const period = periods.find(p => p.id === selectedPeriod);
                    if (!period) return true;
                    const ideaDate = getSubmissionDate(idea);
                    if (!ideaDate) return true;
                    return ideaDate >= period.startDate && ideaDate <= period.endDate;
                  })
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
                {!listStatus.loading && !listStatus.error && filteredIdeas
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
                    <div 
                      key={`${idea.type}-${idea.id}`} 
                      style={{ ...ideaItem, cursor: 'pointer' }}
                      onClick={() => {
                        navigate('/profesor/feedback', {
                          state: {
                            ideaId: idea.id,
                            lendaId,
                            subject: subjectName
                          }
                        });
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(184, 227, 233, 0.12)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#0B2E33'}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                        <button
                          style={downloadButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadIdea(idea);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(184, 227, 233, 0.2)';
                            e.currentTarget.style.borderColor = '#B8E3E9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'rgba(184,227,233,0.35)';
                          }}
                        >
                          Shkarko
                        </button>
                        <button
                          style={{ ...tinyButton, marginLeft: 4 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/profesor/feedback', { state: { lendaId, subject: subjectName, ideaId: idea.id } });
                          }}
                          title="Shfaq feedback për këtë ide"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(184, 227, 233, 0.12)';
                            e.currentTarget.style.borderColor = '#B8E3E9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'rgba(184,227,233,0.35)';
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
                    e.currentTarget.style.background = 'rgba(184, 227, 233, 0.12)';
                    e.currentTarget.style.borderColor = '#B8E3E9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(184,227,233,0.35)';
                  }}
                >
                  Rifresko listën
                </button>
                <button
                  style={{ ...primaryButton, flex: 1 }}
                  onClick={() => {
                    // Build data with one idea per row (vertical columns)
                    const header = ['Emri Studentit', 'ID', 'Titulli', 'Shkurtesa'];
                    const rows = filteredIdeas.map(i => [
                      i.studentName ?? 'Profesor',
                      i.id ?? '',
                      i.title,
                      i.shorthand
                    ]);
                    
                    // Create CSV with header first, then data rows
                    const csvRows = [
                      header.map(h => `"${h}"`).join(','),
                      ...rows.map(r => r.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
                    ];
                    const csv = csvRows.join('\n');
                    
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
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(184, 227, 233, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Shkarko të gjitha
                </button>
              </div>
            </div>
          )}

          {/* File-t e Dërguara Tab */}
          {activeTab === 'files' && (
            <div style={columnCard}>
              <h3 style={{ margin: '0 0 1rem', fontSize: 18, color: '#B8E3E9' }}>File-t e Dërguara</h3>
              {periods.length > 0 && (
                <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      borderRadius: 10,
                      border: '1px solid rgba(184,227,233,0.35)',
                      background: 'rgba(11,46,51,0.6)',
                      color: '#B8E3E9',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">Të gjitha periudhat</option>
                    {periods.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              )}
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
                {!filesStatus.loading && !filesStatus.error && filteredFiles.length === 0 && selectedPeriod && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    Nuk ka file të dorëzuara në këtë periudhë.
                  </div>
                )}
                {!filesStatus.loading && !filesStatus.error && filteredFiles
                  .filter(file => {
                    const matchesSearch = file.fileName.toLowerCase().includes(fileSearchTerm.toLowerCase()) ||
                      file.studentName.toLowerCase().includes(fileSearchTerm.toLowerCase());
                    return matchesSearch;
                  })
                  .filter(file => {
                    if (selectedPeriod === 'all') return true;
                    const period = periods.find(p => p.id === selectedPeriod);
                    if (!period) return true;
                    const fileDate = getSubmissionDate(file);
                    if (!fileDate) return true;
                    return fileDate >= period.startDate && fileDate <= period.endDate;
                  })
                  .length === 0 && (
                    <div style={{ textAlign: 'center', opacity: 0.8 }}>
                      {fileSearchTerm ? 'Nuk u gjet asnjë file me këtë kriter.' : 'Ende nuk ka file të dërguar.'}
                    </div>
                  )}
                {!filesStatus.loading && !filesStatus.error && filteredFiles
                  .filter(file =>
                    file.fileName.toLowerCase().includes(fileSearchTerm.toLowerCase()) ||
                    file.studentName.toLowerCase().includes(fileSearchTerm.toLowerCase())
                  )
                  .map((file) => (
                    <div key={file.id} style={ideaItem}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{file.fileName}</div>
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
                            e.currentTarget.style.background = 'rgba(184, 227, 233, 0.2)';
                            e.currentTarget.style.borderColor = '#B8E3E9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'rgba(184,227,233,0.35)';
                          }}
                        >
                          Shkarko
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
                            e.currentTarget.style.background = 'rgba(184, 227, 233, 0.12)';
                            e.currentTarget.style.borderColor = '#B8E3E9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'rgba(184,227,233,0.35)';
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
                    e.currentTarget.style.background = 'rgba(184, 227, 233, 0.12)';
                    e.currentTarget.style.borderColor = '#B8E3E9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(184,227,233,0.35)';
                  }}
                >
                  Rifresko listën
                </button>
                <button
                  style={{ ...primaryButton, flex: 1 }}
                  onClick={handleDownloadAllFiles}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(184, 227, 233, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Shkarko të gjitha (.zip)
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

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
            border: '1px solid rgba(184,227,233,0.35)',
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
                  border: '1px solid rgba(184,227,233,0.4)',
                  background: '#0B2E33',
                  color: '#B8E3E9',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  boxShadow: '0 4px 12px rgba(184, 227, 233, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(184, 227, 233, 0.12)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(184, 227, 233, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0B2E33';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(184, 227, 233, 0.2)';
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
                  border: '1px solid rgba(184,227,233,0.3)',
                  background: 'transparent',
                  color: '#B8E3E9',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(184,227,233,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(184,227,233,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(184,227,233,0.3)';
                }}
              >
                Jo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Message */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: toastMessage.type === 'success' ? '#0B2E33' : toastMessage.type === 'error' ? '#ff5252' : '#4F7C82',
          color: '#B8E3E9',
          padding: '1rem 1.5rem',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 2000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toastMessage.text}
        </div>
      )}
    </div>
  );
};

export default Idetep;
