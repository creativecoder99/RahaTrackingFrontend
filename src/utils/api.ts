const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('raha_auth_token') : null;
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('raha_auth_token');
    // If the token expires, reload to trigger redirect to login in layouts/guards
    window.location.href = '/login';
  }

  return response;
}
