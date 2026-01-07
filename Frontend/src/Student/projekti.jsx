import React, { useState, useEffect } from "react";
import { getStudentProjects, createStudentProject, deleteStudentProject } from "../services/studentApi";

const Projekti = () => {
  const student = JSON.parse(localStorage.getItem('student') || '{}');
  if (!student.id) {
    // navigate to login, but no navigate here
    window.location.href = '/';
    return null;
  }
  const STUDENT_ID = student.id;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    emriProjekti: "",
    pershkrimiProjekti: "",
    deaAdline: "",
    lendaId: 1,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getStudentProjects(STUDENT_ID);
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
      await createStudentProject(STUDENT_ID, {
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
      await deleteStudentProject(STUDENT_ID, projectId);
      await fetchProjects();
    } catch (err) {
      setError(err.message || "Error deleting project");
    }
  };

  if (loading) return <div style={{ padding: "2rem" }}>Po ngarkohen projektet...</div>;

  return (
    <div style={{ padding: "2rem", color: "#fff" }}>
      <h1>Projektet e Mia</h1>

      {error && (
        <div style={{ padding: "1rem", background: "rgba(255,82,82,0.2)", borderRadius: "8px", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: "0.5rem 1rem",
          background: "#17c77a",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        {showForm ? "Mbyll formularin" : "Shto projekt të ri"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(13, 30, 19, 0.85)",
            padding: "1.5rem",
            borderRadius: "12px",
            marginBottom: "2rem",
            border: "1px solid rgba(23, 199, 122, 0.35)",
          }}
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
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(5,12,8,0.8)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
              }}
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
                width: "100%",
                padding: "0.75rem",
                background: "rgba(5,12,8,0.8)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                minHeight: "100px",
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
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(5,12,8,0.8)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#17c77a",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Shto projektin
          </button>
        </form>
      )}

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
              style={{
                background: "rgba(13, 30, 19, 0.85)",
                border: "1px solid rgba(23, 199, 122, 0.35)",
                borderRadius: "12px",
                padding: "1.5rem",
              }}
            >
              <h3 style={{ color: "#1fdc8c", marginTop: 0 }}>{project.emriProjekti}</h3>
              <p>{project.pershkrimiProjekti}</p>
              {project.deaAdline && (
                <p style={{ fontSize: "0.9rem", color: "#9bf3c8" }}>
                  Afati: {new Date(project.deaAdline).toLocaleDateString()}
                </p>
              )}
              <button
                onClick={() => handleDelete(project.id)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "rgba(255,82,82,0.3)",
                  color: "#ff5252",
                  border: "1px solid rgba(255,82,82,0.5)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginTop: "1rem",
                }}
              >
                Fshi
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Projekti;