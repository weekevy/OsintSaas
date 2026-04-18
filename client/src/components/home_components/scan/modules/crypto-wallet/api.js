export const api = {
  base: '/api/modules/crypto-wallet',
  
  async create(data, files = []) {
    try {
      if (files.length > 0) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
          if (data[key]) formData.append(key, data[key]);
        });
        files.forEach((file, index) => {
          formData.append(`evidence_${index}`, file);
        });
        const response = await fetch(this.base, { method: 'POST', body: formData });
        return await response.json();
      } else {
        const response = await fetch(this.base, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return await response.json();
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  async update(id, data) {
    try {
      const response = await fetch(`${this.base}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  async delete(id) {
    try {
      const response = await fetch(`${this.base}?id=${id}`, { method: 'DELETE' });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  async getAll() {
    try {
      const response = await fetch(this.base);
      return await response.json();
    } catch (error) {
      return { success: false, scans: [] };
    }
  }
};

export default api;