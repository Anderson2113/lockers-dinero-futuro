const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_SECRET = import.meta.env.VITE_API_SECRET || 'dev-secret-key-123';

const authHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_SECRET}`,
};

export const apiClient = {
  async get(endpoint: string) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: authHeaders,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async post(endpoint: string, body: any) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error(data.error || 'Unknown error');
    return data;
  },

  async patch(endpoint: string, body: any) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error(data.error || 'Unknown error');
    return data;
  },

  async delete(endpoint: string) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error(data.error || 'Unknown error');
    return data;
  }
};
