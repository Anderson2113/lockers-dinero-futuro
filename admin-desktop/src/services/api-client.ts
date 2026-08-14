const API_URL = 'https://lockers-dinero-futuro-1.onrender.com/api';
const API_SECRET = 'dev-secret-key-123';

const authHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_SECRET}`,
};

export const apiClient = {
  async get(endpoint: string) {
    const url = `${API_URL}${endpoint}`;
    console.log("🚀 URL GET:", url);
    const res = await fetch(url, { headers: authHeaders });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async post(endpoint: string, body: any) {
    const url = `${API_URL}${endpoint}`;
    console.log("🚀 URL POST:", url);
    const res = await fetch(url, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error(data.error || 'Unknown error');
    return data;
  },

  async patch(endpoint: string, body: any) {
    const url = `${API_URL}${endpoint}`;
    console.log("🚀 URL PATCH:", url);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error(data.error || 'Unknown error');
    return data;
  },

  async delete(endpoint: string) {
    const url = `${API_URL}${endpoint}`;
    console.log("🚀 URL DELETE:", url);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: authHeaders,
    });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error(data.error || 'Unknown error');
    return data;
  }
};