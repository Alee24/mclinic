const API_URL = 'http://localhost:3001';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        // Redirect to login if unauthorized
        window.location.href = '/login';
        return null;
    }

    return res;
}

export const api = {
    get: (endpoint: string) => fetchWithAuth(endpoint, { method: 'GET' }),
    post: (endpoint: string, body: any) => fetchWithAuth(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    patch: (endpoint: string, body: any) => fetchWithAuth(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (endpoint: string) => fetchWithAuth(endpoint, { method: 'DELETE' }),
};
