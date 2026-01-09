const API_BASE_URL = (import.meta.env?.VITE_API_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');

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

export const getStudentDashboard = (studentId) =>
  request(`/studentet/${studentId}/dashboard`);

export const getStudentYearData = (studentId, yearId) =>
  request(`/studentet/${studentId}/lendet/${yearId}`);

export const getStudentIdeas = (studentId, lendaId) => {
  const params = new URLSearchParams();
  if (lendaId) {
    params.set('lendaId', lendaId);
  }
  const query = params.toString();
  return request(`/studentet/${studentId}/idet${query ? `?${query}` : ''}`);
};

export const createStudentIdea = (studentId, payload) =>
  request(`/studentet/${studentId}/idet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const getStudentProfile = (studentId) =>
  request(`/studentet/${studentId}`);

export const uploadStudentDorezim = async (studentId, { lendaId, file }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('lendaId', String(lendaId));
  
  const response = await fetch(`${API_BASE_URL}/studentet/${studentId}/dorezime`, {
    method: 'POST',
    body: formData,
  });
  
  return handleResponse(response);
};

export const getStudentIdeaSubmission = (studentId, lendaId) =>
  request(`/studentet/${studentId}/dorezime?lendaId=${lendaId}`);

export const getStudentTemplate = (studentId, lendaId) =>
  request(`/studentet/${studentId}/dorezime/shabllon?lendaId=${lendaId}`);

export const getStudentProjects = (studentId) =>
  request(`/projekti/${studentId}`);

export const getStudentProject = (studentId, projectId) =>
  request(`/projekti/${studentId}/${projectId}`);

export const createStudentProject = (studentId, payload) =>
  request(`/projekti/${studentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const updateStudentProject = (studentId, projectId, payload) =>
  request(`/projekti/${studentId}/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const deleteStudentProject = (studentId, projectId) =>
  request(`/projekti/${studentId}/${projectId}`, {
    method: 'DELETE',
  });

export const deleteStudentDorezim = (studentId, dorezimId) =>
  request(`/studentet/${studentId}/dorezime/${dorezimId}`, {
    method: 'DELETE',
  });

export default {
  getStudentDashboard,
  getStudentYearData,
  getStudentIdeas,
  createStudentIdea,
  getStudentProfile,
  uploadStudentDorezim,
  getStudentIdeaSubmission,
  getStudentTemplate,
  deleteStudentDorezim,
  getStudentProjects,
  getStudentProject,
  createStudentProject,
  updateStudentProject,
  deleteStudentProject,
};
