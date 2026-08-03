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

        // Safely override res.json to handle non-JSON or HTML error responses gracefully
        const originalJson = res.json.bind(res);
        res.json = async () => {
            const contentType = res.headers.get('content-type') || '';
            const text = await res.text();

            if (!text || text.trim().length === 0) {
                return {};
            }

            const isHtml = text.trim().startsWith('<') || text.trim().toLowerCase().startsWith('<!doctype');
            if (isHtml || (contentType && !contentType.includes('application/json') && !contentType.includes('text/json') && isHtml)) {
                console.error(`[API Error] Received non-JSON HTML response for ${endpoint} (Status: ${res.status}):`, text.substring(0, 300));
                let userMessage = 'The server returned an unexpected response. Please try again.';
                if (res.status === 404) {
                    userMessage = 'The requested service endpoint was not found (404). Please check server connectivity.';
                } else if (res.status >= 500) {
                    userMessage = 'Server encountered an error (500). Please ensure backend service is active.';
                } else if (res.status === 403) {
                    userMessage = 'You do not have authorization to perform this operation.';
                } else if (res.status === 400) {
                    userMessage = 'Invalid request parameters. Please verify input data.';
                }
                return {
                    error: true,
                    statusCode: res.status,
                    message: userMessage,
                };
            }

            try {
                return JSON.parse(text);
            } catch (parseErr) {
                console.error(`[API JSON Parse Error] ${endpoint}:`, parseErr);
                return {
                    error: true,
                    statusCode: res.status,
                    message: 'Server returned an invalid JSON response structure.',
                };
            }
        };

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
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7899';
    }
    
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && envUrl.startsWith('http')) {
        return envUrl;
    }
    
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:7899';
    }
    
    return `${window.location.origin}/api`;
}

