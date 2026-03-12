const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...fetchOptions, headers });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || 'Request failed');
  }
  return json.data ?? json;
}

export function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}
