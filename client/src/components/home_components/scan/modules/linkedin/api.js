const BASE = '/api/modules/linkedin-investigation';

// Track requests in progress to prevent duplicates
let _isCreating = false;
let _lastRequestTime = 0;
let _lastRequestData = null;

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(response) {
  const text = await response.text();
  if (!text || text.trim().charAt(0) !== '{') {
    throw new Error(`Server error (status ${response.status})`);
  }
  const data = JSON.parse(text);
  if (!response.ok || !data.success) {
    throw new Error(data.error || data.details || `Request failed (${response.status})`);
  }
  return data;
}

export const api = {
  async getAll() {
    const res = await fetch(BASE, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  
  async create(data) {
    console.log('🟣 API CREATE called at:', new Date().toISOString());
    
    // Block duplicate requests within 2 seconds with same profile URL
    const now = Date.now();
    const requestKey = JSON.stringify({ 
      profile_url: data.profile_url, 
      project_id: data.project_id 
    });
    
    if (_isCreating) {
      console.log('⛔ API BLOCKED - Request already in progress');
      throw new Error('Request already in progress - please wait');
    }
    
    if (_lastRequestData === requestKey && (now - _lastRequestTime) < 2000) {
      console.log('⛔ API BLOCKED - Duplicate request within 2 seconds');
      throw new Error('Duplicate request blocked - please wait');
    }
    
    _isCreating = true;
    _lastRequestTime = now;
    _lastRequestData = requestKey;
    
    try {
      const res = await fetch(BASE, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    } finally {
      // Reset after 2 seconds
      setTimeout(() => {
        _isCreating = false;
      }, 2000);
    }
  },
  
  async update(id, data) {
    const res = await fetch(`${BASE}?id=${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  
  async delete(id) {
    const res = await fetch(`${BASE}?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

export default api;