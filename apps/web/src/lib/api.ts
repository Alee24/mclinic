const API_URL = '/api';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');

    const headers: HeadersInit = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
        // @ts-ignore
        headers['Content-Type'] = 'application/json';
    }

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (res.status === 401) {
            // Clear invalid session to prevent reload loops
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Only redirect if NOT already on login page to avoid self-referential loops
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
            return null;
        }

        return res;
    } catch (err: any) {
        console.error('API Fetch Error:', err);
        // Throw a descriptive error that can be caught by the UI
        throw new Error(`Connection Error: ${err.message || 'Unable to reach server'}. Please ensure the backend is running.`);
    }
}

export const api = {
    get: (endpoint: string, params?: Record<string, any>) => {
        let url = endpoint;
        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    searchParams.append(key, value.toString());
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                url += (url.includes('?') ? '&' : '?') + queryString;
            }
        }
        return fetchWithAuth(url, { method: 'GET' });
    },
    post: (endpoint: string, body: any) => fetchWithAuth(endpoint, {
        method: 'POST',
        body: body instanceof FormData ? body : JSON.stringify(body)
    }),
    patch: (endpoint: string, body: any) => fetchWithAuth(endpoint, {
        method: 'PATCH',
        body: body instanceof FormData ? body : JSON.stringify(body)
    }),
    delete: (endpoint: string) => fetchWithAuth(endpoint, { method: 'DELETE' }),
};

export function getApiBaseUrl(): string {
    if (typeof window === 'undefined') {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3434';
    }
    
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && envUrl.startsWith('http')) {
        return envUrl;
    }
    
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:3434';
    }
    
    return `${window.location.origin}/api`;
}

