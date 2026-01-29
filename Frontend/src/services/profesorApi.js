const API_BASE_URL = (import.meta.env?.VITE_API_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');

// Helper function to convert academic year format
// Converts 23/24 to 2023/2024, 24/25 to 2024/2025, etc.
const convertAcademicYearFormat = (shortFormat) => {
  if (!shortFormat || !shortFormat.includes('/')) return shortFormat;
  const [start, end] = shortFormat.split('/');
  const startYear = parseInt(start, 10);
  const endYear = parseInt(end, 10);
  // Assume years are in 20xx century
  const fullStartYear = startYear < 100 ? 2000 + startYear : startYear;
  const fullEndYear = endYear < 100 ? 2000 + endYear : endYear;
  return `${fullStartYear}/${fullEndYear}`;
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  const payload = contentType && contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'string'
      ? payload
      : payload?.message ?? 'Kerkesa deshtoi';
    throw new Error(message);
  }

  return payload;
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  return handleResponse(response);
};

export const getProfesorDashboard = (profesorId, academicYear) => {
  const fullYearFormat = convertAcademicYearFormat(academicYear);
  const url = `/profesoret/${profesorId}/dashboard${fullYearFormat ? `?academicYear=${encodeURIComponent(fullYearFormat)}` : ''}`;
  return request(url);
};

export const getProfesorYearData = (profesorId, yearId, academicYear) => {
  const fullYearFormat = convertAcademicYearFormat(academicYear);
  console.log(`[API] Fetching year data - profesorId: ${profesorId}, yearId: ${yearId}, academicYear: ${academicYear} -> ${fullYearFormat}`);
  const url = `/profesoret/${profesorId}/lendet/${yearId}${fullYearFormat ? `?academicYear=${encodeURIComponent(fullYearFormat)}` : ''}`;
  console.log(`[API] Request URL: ${url}`);
  return request(url);
};

export const getProfesorIdeas = (profesorId, lendaId) => {
  const params = new URLSearchParams();
  if (lendaId) {
    params.set('lendaId', lendaId);
  }
  const query = params.toString();
  return request(`/profesoret/${profesorId}/idet${query ? `?${query}` : ''}`);
};

export const createProfesorIdea = (profesorId, payload) =>
  request(`/profesoret/${profesorId}/idet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const getProfesorProfile = (profesorId) =>
  request(`/profesoret/${profesorId}`);

export const uploadProfesorDorezim = async (profesorId, { lendaId, file, isShabllon = false }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('lendaId', String(lendaId));
  formData.append('isShabllon', String(isShabllon));

  const response = await fetch(`${API_BASE_URL}/profesoret/${profesorId}/dorezime`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(response);
};

export const getProfesorIdeaSubmission = (profesorId, lendaId) =>
  request(`/profesoret/${profesorId}/dorezime?lendaId=${lendaId}`);

export const getProfesorTemplate = (profesorId, lendaId) =>
  request(`/profesoret/${profesorId}/dorezime/shabllon?lendaId=${lendaId}`);

export const getStudentSubmissions = (profesorId, lendaId) =>
  request(`/profesoret/${profesorId}/dorezime-studentesh/${lendaId}`);

export const getStudentProjectSubmissions = (profesorId, lendaId) =>
  request(`/profesoret/${profesorId}/projekte-studentesh/${lendaId}`);

export const updateProjectGrade = (profesorId, projectId, piket) =>
  request(`/profesoret/${profesorId}/projekte/${projectId}/piket`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ piket }),
  });

export const updateProjectMaxPoints = (profesorId, lendaId, projectMaxPoints) =>
  request(`/profesoret/${profesorId}/lendet/${lendaId}/project-max`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ projectMaxPoints }),
  });

export const updateProjectDeadline = (profesorId, lendaId, payload) =>
  request(`/profesoret/${profesorId}/lendet/${lendaId}/project-deadline`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const getIdeaDeadline = (profesorId, lendaId) =>
  request(`/profesoret/${profesorId}/lendet/${lendaId}/idea-deadline`);

export const updateIdeaDeadline = (profesorId, lendaId, payload) =>
  request(`/profesoret/${profesorId}/lendet/${lendaId}/idea-deadline`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const getProfesorProjects = (profesorId) =>
  request(`/projektip/${profesorId}`);

export const getProfesorProject = (profesorId, projectId) =>
  request(`/projektip/${profesorId}/${projectId}`);

export const createProfesorProject = (profesorId, payload) =>
  request(`/projektip/${profesorId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const updateProfesorProject = (profesorId, projectId, payload) =>
  request(`/projektip/${profesorId}/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const deleteProfesorProject = (profesorId, projectId) =>
  request(`/projektip/${profesorId}/${projectId}`, {
    method: 'DELETE',
  });

// Ngarko template për një lëndë
export const uploadLendaTemplate = async (profesorId, lendaId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/profesoret/${profesorId}/lendet/${lendaId}/template`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(response);
};

// Merr informacionin e template-it për një lëndë
export const getLendaTemplateInfo = (profesorId, lendaId) =>
  request(`/profesoret/${profesorId}/lendet/${lendaId}/template`);

// Fshij template-in për një lëndë
export const deleteLendaTemplate = (profesorId, lendaId) =>
  request(`/profesoret/${profesorId}/lendet/${lendaId}/template`, {
    method: 'DELETE',
  });

// Shto feedback për një dorëzim studenti
export const addFeedbackToSubmission = (profesorId, dorezimId, feedbackData) =>
  request(`/profesoret/${profesorId}/dorezime/${dorezimId}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(feedbackData),
  });

export default {
  getProfesorDashboard,
  getProfesorYearData,
  getProfesorIdeas,
  createProfesorIdea,
  getProfesorProfile,
  uploadProfesorDorezim,
  getProfesorIdeaSubmission,
  getProfesorTemplate,
  getStudentSubmissions,
  getStudentProjectSubmissions,
  updateProjectGrade,
  updateProjectMaxPoints,
  updateProjectDeadline,
  getIdeaDeadline,
  updateIdeaDeadline,
  getProfesorProjects,
  getProfesorProject,
  createProfesorProject,
  updateProfesorProject,
  deleteProfesorProject,
  uploadLendaTemplate,
  getLendaTemplateInfo,
  deleteLendaTemplate,
  addFeedbackToSubmission,
};
