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
  const res = await fetch(`${import.meta.env.VITE_URL_API}`, {
    ...options,
    headers: buildHeaders(options.headers, options.body ?? null),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || res.statusText);
  }
  return res.status === 204 ? (undefined as T) : await res.json();
}

export const http = {
  get:  <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put:  <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT',  body: body instanceof FormData ? body : JSON.stringify(body) }),
  del:  <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
