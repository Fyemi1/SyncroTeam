const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3000/api');

const getHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const api = {
    get: async (endpoint) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw { message: 'Session expired' };
        }
        if (!response.ok) throw await response.json();
        return response.json();
    },

    post: async (endpoint, body) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        if (!response.ok) throw await response.json();
        return response.json();
    },

    put: async (endpoint, body) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        if (!response.ok) throw await response.json();
        return response.json();
    },

    patch: async (endpoint, body) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        if (!response.ok) throw await response.json();
        return response.json();
    },

    delete: async (endpoint) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) throw await response.json();
        return response.json();
    },
};
