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

// Merr projektin e dorëzuar për një lëndë
export const getProjektiDorezuar = async (studentId, lendaId) => {
  const response = await fetch(`${API_BASE_URL}/studentet/${studentId}/projekti/${lendaId}`);
  return handleResponse(response);
};

// Dorëzo projektin
export const dorezoProjektin = async (studentId, lendaId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('lendaId', lendaId);

  const response = await fetch(`${API_BASE_URL}/studentet/${studentId}/projekti/dorezo`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(response);
};

// Fshij projektin e dorëzuar
export const fshijProjektin = async (studentId, lendaId) => {
  const response = await fetch(`${API_BASE_URL}/studentet/${studentId}/projekti/${lendaId}`, {
    method: 'DELETE',
  });

  return handleResponse(response);
};

// Shkarko projektin
export const shkarkoProjektin = (fileDorezimi, fileName) => {
  const API_BASE = API_BASE_URL.replace('/api', '');
  const url = `${API_BASE}/${fileDorezimi}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
