import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProfesorIdeas } from '../services/profesorApi';

const Feedbackp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const PROFESOR_ID = 1;

  const ideaId = location.state?.ideaId ?? null;
  const lendaId = location.state?.lendaId ?? null;
  const subjectName = location.state?.subject ?? 'Lëndë';

  const storageKey = useMemo(() => ideaId ? `profesorIdeaFeedback:${PROFESOR_ID}:${ideaId}` : null, [ideaId]);
  const storageKeyGeneral = useMemo(() => (!ideaId && lendaId) ? `profesorLendaFeedback:${PROFESOR_ID}:${lendaId}` : null, [ideaId, lendaId]);

  const [status, setStatus] = useState({ loading: !!ideaId, error: null });
  const [idea, setIdea] = useState(null);
  const [message, setMessage] = useState('');
  const [savedAt, setSavedAt] = useState(null);

  // Load idea details if we have ideaId
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!ideaId || !lendaId) return;
      setStatus({ loading: true, error: null });
      try {
        const ideas = await getProfesorIdeas(PROFESOR_ID, lendaId);
        const found = Array.isArray(ideas) ? ideas.find((i) => i.id === Number(ideaId)) : null;
        if (isMounted) {
          setIdea(found ?? null);
          setStatus({ loading: false, error: null });
        }
      } catch (error) {
        if (isMounted) setStatus({ loading: false, error: error?.message ?? 'Nuk u lexuan të dhënat e idesë.' });
      }
    };
    load();
    return () => { isMounted = false; };
  }, [PROFESOR_ID, ideaId, lendaId]);

  // Load saved feedback from localStorage (per-idea or general per lëndë)
  useEffect(() => {
    const effectiveKey = storageKey ?? storageKeyGeneral;
    if (!effectiveKey) return;
    try {
      const raw = localStorage.getItem(effectiveKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setMessage(parsed.message ?? '');
        setSavedAt(parsed.savedAt ?? null);
      }
    } catch (_) {}
  }, [storageKey, storageKeyGeneral]);

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
    padding: '1rem 2.5rem'
  };

  const brandStyle = { color: '#17c77a', fontWeight: 800, fontSize: 22, letterSpacing: 0.6 };
  const actionsStyle = { display: 'flex', alignItems: 'center', gap: 18 };
  const bellStyle = { width: 40, height: 40, borderRadius: 20, background: 'rgba(23, 199, 122, 0.12)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fbd38d' };
  const avatarStyle = { width: 42, height: 42, borderRadius: 21, background: '#0e6b3d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 };

  const layoutStyle = { padding: '0 3.5rem 3rem' };
  const card = { background: 'rgba(13, 30, 19, 0.85)', border: '1px solid rgba(23, 199, 122, 0.35)', borderRadius: 18, padding: '1.25rem', marginTop: 18 };
  const backButton = { border: '1px solid rgba(23, 199, 122, 0.5)', color: '#17c77a', background: 'transparent', padding: '0.4rem 0.9rem', borderRadius: 999, cursor: 'pointer', fontWeight: 600, fontSize: 13 };
  const primaryButton = { borderRadius: 12, border: 'none', background: '#19c776', color: '#041407', fontWeight: 700, padding: '0.8rem 1.6rem', cursor: 'pointer' };
  const secondaryButton = { borderRadius: 12, border: '1px solid rgba(23,199,122,0.35)', background: 'transparent', color: '#c8f5e8', fontWeight: 600, padding: '0.8rem 1.6rem', cursor: 'pointer' };
  const banner = { border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '0.75rem 1rem', marginTop: 12 };

  const handleSave = () => {
    if (!ideaId) return;
    try {
      const payload = {
        ideaId: Number(ideaId),
        lendaId: Number(lendaId),
        subject: subjectName,
        message: message.trim(),
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setSavedAt(payload.savedAt);
    } catch (e) {}
  };

  const handleSaveGeneral = () => {
    if (!lendaId || ideaId) return;
    try {
      const payload = {
        lendaId: Number(lendaId),
        subject: subjectName,
        message: message.trim(),
        savedAt: new Date().toISOString(),
      };
      if (storageKeyGeneral) {
        localStorage.setItem(storageKeyGeneral, JSON.stringify(payload));
      }
      setSavedAt(payload.savedAt);
    } catch (e) {}
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
        <button style={backButton} onClick={() => navigate(-1)}>← Kthehu</button>

        {/* Header / Idea details */}
        <div style={card}>
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>Feedback</h2>
          {ideaId && (
            <>
              {status.loading && <div style={{ ...banner }}>Duke u ngarkuar idetë…</div>}
              {status.error && (
                <div style={{ ...banner, background: 'rgba(255,82,82,0.12)' }}>{status.error}</div>
              )}
              {!status.loading && !status.error && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{idea?.title ?? 'Ide'}</div>
                  <div style={{ opacity: 0.85, marginTop: 4, fontSize: 14 }}>
                    {idea?.subject?.name ? idea.subject.name : subjectName}
                    {idea?.student?.fullName ? ` • ${idea.student.fullName}` : ''}
                  </div>
                </div>
              )}
            </>
          )}

          {!ideaId && (
            <div style={{ opacity: 0.85 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{subjectName}</div>
              <div style={{ marginTop: 4, fontSize: 14 }}>Feedback i përgjithshëm për këtë lëndë.</div>
            </div>
          )}
        </div>

        {/* Feedback editor */}
        <div style={{ ...card, marginTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Mesazhi i feedback-ut</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Shkruaj feedback-in këtu…"
            rows={8}
            style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(4,10,6,0.6)', color: '#fff', padding: '0.8rem' }}
          />

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            {ideaId && (
              <button style={primaryButton} onClick={handleSave}>Ruaj</button>
            )}
            {!ideaId && lendaId && (
              <button style={primaryButton} onClick={handleSaveGeneral}>Ruaj</button>
            )}
            <button style={secondaryButton} onClick={() => navigate(-1)}>Anulo</button>
          </div>

          {savedAt && (
            <div style={{ ...banner, background: 'rgba(23,199,122,0.12)' }}>
              U ruajt në: {new Date(savedAt).toLocaleString('sq-AL')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedbackp;
