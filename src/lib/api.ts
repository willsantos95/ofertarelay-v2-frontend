/**
 * Endereço da API.
 * Em produção o nginx do próprio frontend repassa /api/ para o backend, então a API é chamada
 * no mesmo domínio da página (ofertarelay.com.br ou o domínio do Easypanel). Assim não há CORS
 * e o cookie de login é do próprio site. VITE_API_URL só vale em desenvolvimento, ou em produção
 * quando VITE_API_MESMA_ORIGEM=false.
 */
export const BASE_URL =
  import.meta.env.PROD && import.meta.env.VITE_API_MESMA_ORIGEM !== 'false'
    ? '/api/v1'
    : (import.meta.env.VITE_API_URL || '/api/v1');

export class ErroNaoAutorizado extends Error {
  constructor() { super('Não autorizado'); this.name = 'ErroNaoAutorizado'; }
}

export async function api<T = unknown>(
  path: string,
  options?: RequestInit,
  redirecionar401 = true
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    },
    ...options,
  });

  if (response.status === 401) {
    if (redirecionar401) {
      window.location.href = '/login';
    }
    throw new ErroNaoAutorizado();
  }

  if (response.status === 204) return null as T;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.erro?.mensagem || data?.message || `Erro ${response.status}`);
  }

  return data as T;
}
