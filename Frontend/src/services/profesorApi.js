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

export const getProfesorDashboard = (profesorId) => {
  const url = `/profesoret/${profesorId}/dashboard`;
  return request(url);
};

export const getProfesorYearData = (profesorId, yearId) => {
  console.log(`[API] Fetching year data - profesorId: ${profesorId}, yearId: ${yearId}`);
  const url = `/profesoret/${profesorId}/lendet/${yearId}`;
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

export const addFeedbackToIdea = (profesorId, ideaId, feedbackData) =>
  request(`/studentet/idet/${ideaId}/feedback`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(feedbackData),
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

// Shto instruksione për një lëndë
export const addInstructionTemplate = async (profesorId, lendaId, instructionData) => {
  const formData = new FormData();

  formData.append('title', instructionData.title);
  formData.append('content', instructionData.content);

  // Add files if any
  if (instructionData.files && instructionData.files.length > 0) {
    instructionData.files.forEach((file, index) => {
      formData.append(`files`, file.data, file.name);
    });
  }

  const response = await fetch(`${API_BASE_URL}/profesoret/${profesorId}/lendet/${lendaId}/instructions`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(response);
};

// Merr instruksionet për një lëndë
export const getInstructionTemplates = (profesorId, lendaId) =>
  request(`/profesoret/${profesorId}/lendet/${lendaId}/instructions`);

// Modifiko instruksionet për një lëndë
export const updateInstructionTemplate = async (profesorId, lendaId, instructionId, instructionData) => {
  const formData = new FormData();

  formData.append('title', instructionData.title);
  formData.append('content', instructionData.content);

  // Add files if any
  if (instructionData.files && instructionData.files.length > 0) {
    instructionData.files.forEach((file, index) => {
      formData.append(`files`, file.data || file, file.name);
    });
  }

  const response = await fetch(`${API_BASE_URL}/profesoret/${profesorId}/lendet/${lendaId}/instructions/${instructionId}`, {
    method: 'PUT',
    body: formData,
  });

  return handleResponse(response);
};

// Fshij instruksionet për një lëndë
export const deleteInstructionTemplate = (profesorId, lendaId, instructionId) =>
  request(`/profesoret/${profesorId}/lendet/${lendaId}/instructions/${instructionId}`, {
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

// Eksporto rezultatet e projekteve në CSV
export const exportProjectResults = async (profesorId, lendaId = null, selectedPeriod = null, deadlineInfo = null) => {
  // Build query params
  const params = new URLSearchParams();
  if (lendaId) params.append('lendaId', lendaId);
  if (selectedPeriod) params.append('selectedPeriod', selectedPeriod);
  if (deadlineInfo) {
    params.append('deadlineStartDate', deadlineInfo.deadlineStartDate || '');
    params.append('deadlineStartHour', deadlineInfo.deadlineStartHour || '');
    params.append('deadlineStartMinute', deadlineInfo.deadlineStartMinute || '');
    params.append('deadlineStartSecond', deadlineInfo.deadlineStartSecond || '');
    params.append('deadlineEndDate', deadlineInfo.deadlineEndDate || '');
    params.append('deadlineEndHour', deadlineInfo.deadlineEndHour || '');
    params.append('deadlineEndMinute', deadlineInfo.deadlineEndMinute || '');
    params.append('deadlineEndSecond', deadlineInfo.deadlineEndSecond || '');
  }
  
  const apiUrl = `${API_BASE_URL}/profesoret/${profesorId}/projekti/export-results${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(apiUrl, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error exporting results' }));
    throw new Error(error.message || 'Error exporting results');
  }

  // Shkarko file-in
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rezultate-projektet-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export default {
  getProfesorDashboard,
  getProfesorYearData,
  getProfesorIdeas,
  createProfesorIdea,
  addFeedbackToIdea,
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
  addInstructionTemplate,
  getInstructionTemplates,
  updateInstructionTemplate,
  deleteInstructionTemplate,
  addFeedbackToSubmission,
  exportProjectResults,
};
