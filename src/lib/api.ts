const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export async function api<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    },
    ...options,
  });

  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Sessão expirada');
  }

  if (response.status === 204) return null as T;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.erro?.mensagem || data?.message || `Erro ${response.status}`);
  }

  return data as T;
}
