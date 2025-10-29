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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers, options.body ?? null),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || res.statusText);
  }

  if (res.status === 204) return undefined as T;

  const ct = res.headers.get('content-type') || '';

  if (ct.includes('application/json')) {
    return (await res.json()) as T;
  }
  const txt = await res.text();
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
