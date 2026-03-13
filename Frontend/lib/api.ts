const API_BASE = process.env.NEXT_PUBLIC_API_URL
  || (typeof window !== 'undefined' ? '/api/v1' : 'http://localhost:3001/api/v1');

type JsonBody = Record<string, unknown> | unknown[];

type ApiFetchOptions = Omit<RequestInit, 'body' | 'headers'> & {
  token?: string;
  body?: BodyInit | JsonBody | null;
  headers?: HeadersInit;
};

function isJsonBody(body: ApiFetchOptions['body']): body is JsonBody {
  if (body == null || typeof body === 'string') return false;
  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) return false;
  if (body instanceof Blob || body instanceof FormData || body instanceof URLSearchParams) return false;
  return typeof body === 'object';
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, body, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resolvedBody = isJsonBody(body) ? JSON.stringify(body) : body;
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, { ...fetchOptions, headers, body: resolvedBody });
  } catch (error: any) {
    throw new Error(
      `Network error: cannot reach API at ${API_BASE}. Check backend status, CORS, and NEXT_PUBLIC_API_URL.`,
    );
  }

  const raw = await res.text();
  let json: any = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(json?.message || `Request failed (${res.status})`);
  }
  return (json?.data ?? json ?? {}) as T;
}

export function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}
