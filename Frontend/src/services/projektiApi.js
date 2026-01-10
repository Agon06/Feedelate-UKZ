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

// Shkarko projektin (shkarkim me emrin origjinal nga serveri)
export const shkarkoProjektin = async (studentId, lendaId, fallbackName = "projekti") => {
  const response = await fetch(`${API_BASE_URL}/studentet/${studentId}/projekti/${lendaId}/download`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Shkarkimi deshtoi');
  }

  // Merr emrin nga Content-Disposition nëse ekziston
  const disposition = response.headers.get('content-disposition');
  let filename = fallbackName;
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    filename = decodeURIComponent(match?.[1] || match?.[2] || fallbackName);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// Merr informacionin nëse ka template për një lëndë
export const getTemplateInfo = async (studentId, lendaId) => {
  const response = await fetch(`${API_BASE_URL}/studentet/${studentId}/projekti/${lendaId}/template`);
  return handleResponse(response);
};

// Shkarko template-in për një lëndë
export const shkarkoTemplate = async (studentId, lendaId, fallbackName = "template") => {
  const response = await fetch(`${API_BASE_URL}/studentet/${studentId}/projekti/${lendaId}/template/download`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Shkarkimi i template deshtoi');
  }

  // Merr emrin nga Content-Disposition
  const disposition = response.headers.get('content-disposition');
  let filename = fallbackName;
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    filename = decodeURIComponent(match?.[1] || match?.[2] || fallbackName);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

