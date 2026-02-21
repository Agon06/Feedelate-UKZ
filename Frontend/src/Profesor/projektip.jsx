import React, { useState, useEffect } from "react";
import { getProfesorProjects, createProfesorProject, deleteProfesorProject } from "../services/profesorApi";
import '../Student/StudentTheme.css';

const Projektip = () => {
  const student = JSON.parse(localStorage.getItem('profesor') || localStorage.getItem('student') || '{}');
  const PROFESOR_ID = student.id || 1;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [formData, setFormData] = useState({
    emriProjekti: "",
    pershkrimiProjekti: "",
    deaAdline: "",
    lendaId: 1,
  });

  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #0B2E33 100%, #0B2E33 0%)',
    color: '#B8E3E9',
    padding: isMobile ? '1.5rem' : '2.5rem',
    fontFamily: 'Inter, system-ui, Arial, sans-serif'
  };

  const titleStyle = {
    marginTop: 0,
    marginBottom: '1.5rem',
    color: '#0B2E33'
  };

  const primaryButtonStyle = {
    padding: '0.65rem 1.2rem',
    background: '#0B2E33',
    color: '#B8E3E9',
    border: '1px solid rgba(184,227,233,0.4)',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700
  };

  const formCardStyle = {
    background: 'rgba(11,46,51,0.75)',
    padding: '1.5rem',
    borderRadius: 16,
    marginBottom: '2rem',
    border: '1px solid rgba(184,227,233,0.35)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.45)'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(11,46,51,0.6)',
    color: '#B8E3E9',
    border: '1px solid rgba(184,227,233,0.25)',
    borderRadius: 10
  };

  const cardStyle = {
    background: 'rgba(11,46,51,0.75)',
    border: '1px solid rgba(184,227,233,0.35)',
    borderRadius: 16,
    padding: '1.5rem',
    boxShadow: '0 20px 40px rgba(0,0,0,0.45)'
  };

  const deleteButtonStyle = {
    padding: '0.5rem 1rem',
    background: 'rgba(184,227,233,0.08)',
    color: '#B8E3E9',
    border: '1px solid rgba(184,227,233,0.35)',
    borderRadius: 10,
    cursor: 'pointer',
    marginTop: '1rem'
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProfesorProjects(PROFESOR_ID);
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Error fetching projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProfesorProject(PROFESOR_ID, {
        ...formData,
        lendaId: parseInt(formData.lendaId),
      });
      setFormData({
        emriProjekti: "",
        pershkrimiProjekti: "",
        deaAdline: "",
        lendaId: 1,
      });
      setShowForm(false);
      await fetchProjects();
    } catch (err) {
      setError(err.message || "Error creating project");
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await deleteProfesorProject(PROFESOR_ID, projectId);
      await fetchProjects();
    } catch (err) {
      setError(err.message || "Error deleting project");
    }
  };

  if (loading) return <div style={{ padding: "2rem" }}>Po ngarkohen projektet...</div>;

  return (
    <div className="student-theme" style={pageStyle}>
      <h1 style={titleStyle}>Projektet e Mia</h1>

      {error && (
        <div style={{ padding: "1rem", background: "rgba(255,82,82,0.2)", borderRadius: "8px", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          ...primaryButtonStyle,
          marginBottom: '1rem'
        }}
      >
        {showForm ? "Mbyll formularin" : "Shto projekt të ri"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={formCardStyle}
        >
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Emri i projektit
            </label>
            <input
              type="text"
              name="emriProjekti"
              value={formData.emriProjekti}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Përshkrimi
            </label>
            <textarea
              name="pershkrimiProjekti"
              value={formData.pershkrimiProjekti}
              onChange={handleInputChange}
              required
              style={{
                ...inputStyle,
                minHeight: '100px'
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Afati (deadline)
            </label>
            <input
              type="date"
              name="deaAdline"
              value={formData.deaAdline}
              onChange={handleInputChange}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            style={primaryButtonStyle}
          >
            Shto projektin
          </button>
        </form>
      )}

      <div
        style={{
          maxHeight: "580px",
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: "0.5rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {projects.length === 0 ? (
            <p>Nuk keni projekte të krijuara akoma.</p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                style={cardStyle}
              >
                <h3 style={{ color: "#B8E3E9", marginTop: 0 }}>{project.emriProjekti}</h3>
                <p style={{ color: "rgba(184,227,233,0.9)" }}>{project.pershkrimiProjekti}</p>
                {project.deaAdline && (
                  <p style={{ fontSize: "0.9rem", color: "rgba(184,227,233,0.8)" }}>
                    Afati: {new Date(project.deaAdline).toLocaleDateString()}
                  </p>
                )}
                <button
                  onClick={() => handleDelete(project.id)}
                  style={deleteButtonStyle}
                >
                  Fshi
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Projektip;
