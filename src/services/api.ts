export const API_URL = `${import.meta.env.VITE_URL_API}`;

const getToken = () => localStorage.getItem('token') || '';

function buildHeaders(init?: HeadersInit, body?: BodyInit | null): HeadersInit {
  const isForm = body instanceof FormData;
  return {
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    Authorization: `Bearer ${getToken()}`,
    ...(init || {}),
  };
}

export async function logServer(path: string, method: string, other: string = '') {
  const usuario = localStorage.getItem('usuario');
  if (!usuario) return;

  const fmtMethod = (method || '').toUpperCase().padEnd(6); // e.g. "GET   ", "DELETE"
  const accion = `${fmtMethod} :${path} [ ${other} ]`;

  try {
    const dataToSend = {
      accion,
      id_usuario: JSON.parse(usuario).id,
    };

    const response = await fetch(`${API_URL}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.info('[ logs ] :Activity logged successfully');
  } catch (error) {
    console.error('[logs ] :Failed to log activity:', error);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers, options.body ?? null),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    logServer(path, options.method || 'GET', `Error ${res.status}`);
    throw new Error(text || res.statusText);
  }

  if (res.status === 204) {
    logServer(path, options.method || 'GET', 'No Content');
    return undefined as T;
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    logServer(path, options.method || 'GET', 'Response: JSON');
    return (await res.json()) as T;
  }
  const txt = await res.text();

  logServer(path, options.method || 'GET', `Response: ${txt}`);
  return txt as unknown as T;
}


export const api = {
  get:   <T>(path: string) => request<T>(path),
  post:  <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put:   <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT',  body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) }),
  del:   <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export default api;
