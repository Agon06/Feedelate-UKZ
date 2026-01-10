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

export const getProfesorDashboard = (profesorId) =>
  request(`/profesoret/${profesorId}/dashboard`);

export const getProfesorYearData = async (profesorId, yearId) => {
  try {
    return await request(`/profesoret/${profesorId}/lendet/${yearId}`);
  } catch (error) {
    // Fallback to local mock data in dev when backend is unavailable
    try {
      const mockUrl = `/mock/profesor_lendet_${yearId}.json`;
      const response = await fetch(mockUrl, { headers: { Accept: 'application/json' } });
      if (response.ok) {
        const payload = await response.json();
        return payload;
      }
    } catch (_) {
      // ignore, will rethrow original error
    }
    throw error;
  }
};

export const getProfesorIdeas = async (profesorId, lendaId) => {
  const params = new URLSearchParams();
  if (lendaId) {
    params.set('lendaId', lendaId);
  }
  const query = params.toString();
  try {
    return await request(`/profesoret/${profesorId}/idet${query ? `?${query}` : ''}`);
  } catch (error) {
    // Fallback to local mock data in dev when backend is unavailable
    try {
      const mockUrl = `/mock/profesor_idet.json`;
      const response = await fetch(mockUrl, { headers: { Accept: 'application/json' } });
      if (response.ok) {
        const payload = await response.json();
        // If lendaId is specified, filter the mock data
        if (lendaId) {
          const filtered = payload.filter(idea => idea.subject?.id === Number(lendaId));
          return filtered;
        }
        return payload;
      }
    } catch (_) {
      // ignore, will rethrow original error
    }
    throw error;
  }
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

export const uploadProfesorDorezim = async (profesorId, { lendaId, file }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('lendaId', String(lendaId));
  
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

export const getStudentSubmissions = async (profesorId, lendaId) => {
  try {
    return await request(`/profesoret/${profesorId}/dorezime-studentesh/${lendaId}`);
  } catch (error) {
    // Fallback to local mock data in dev when backend is unavailable
    try {
      const mockUrl = `/mock/profesor_dorezime_studentesh.json`;
      const response = await fetch(mockUrl, { headers: { Accept: 'application/json' } });
      if (response.ok) {
        const payload = await response.json();
        return payload;
      }
    } catch (_) {
      // ignore, will rethrow original error
    }
    throw error;
  }
};

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
  getProfesorProjects,
  getProfesorProject,
  createProfesorProject,
  updateProfesorProject,
  deleteProfesorProject,
  uploadLendaTemplate,
  getLendaTemplateInfo,
  deleteLendaTemplate,
};
