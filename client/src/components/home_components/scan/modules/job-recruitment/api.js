export const api = {
  base: '/api/modules/company-jobscam',
  
  // Track requests in progress
  _isCreating: false,
  _lastRequestTime: 0,
  _lastRequestData: null,
  
  async create(data, files = []) {
    console.log('🟣🟣🟣 API CREATE CALLED at:', new Date().toISOString());
    console.log('📦 API Request data:', { company: data.company_name, job: data.job_title, files: files.length });
    console.trace();
    
    // Block duplicate requests within 2 seconds with same data
    const now = Date.now();
    const requestKey = JSON.stringify({
      company: data.company_name,
      job: data.job_title,
      files: files.length
    });
    
    if (this._isCreating) {
      console.log('⛔ API BLOCKED - Request already in progress');
      return { success: false, error: 'Request already in progress' };
    }
    
    if (this._lastRequestData === requestKey && (now - this._lastRequestTime) < 2000) {
      console.log('⛔ API BLOCKED - Duplicate request within 2 seconds');
      return { success: false, error: 'Duplicate request blocked' };
    }
    
    this._isCreating = true;
    this._lastRequestTime = now;
    this._lastRequestData = requestKey;
    
    try {
      let response;
      
      // Clean data - remove moduleType and empty values
      const { moduleType, ...cleanData } = data;
      
      // Remove empty strings
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '') {
          delete cleanData[key];
        }
      });
      
      console.log('📤 Sending to server:', cleanData);
      
      if (files && files.length > 0) {
        const formData = new FormData();
        Object.keys(cleanData).forEach(key => {
          if (cleanData[key]) formData.append(key, cleanData[key]);
        });
        files.forEach((file, index) => {
          formData.append(`evidence_${index}`, file);
        });
        
        response = await fetch(this.base, { 
          method: 'POST', 
          body: formData,
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
      } else {
        response = await fetch(this.base, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify(cleanData)
        });
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ API Success:', result.message);
      } else {
        console.error('❌ API Error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    } finally {
      // Reset after 2 seconds
      setTimeout(() => {
        this._isCreating = false;
      }, 2000);
    }
  },
  
  async update(id, data) {
    try {
      console.log(`🔄 Attempting to update scan with ID: ${id}`);
      
      if (!id) {
        console.error('❌ No ID provided for update');
        return { success: false, error: 'No scan ID provided' };
      }
      
      const response = await fetch(`${this.base}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅', result.message);
      } else {
        console.error('❌ Update failed:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  },
  
  async delete(id) {
    try {
      console.log(`🗑️ Attempting to delete scan with ID: ${id}`);
      
      if (!id) {
        console.error('❌ No ID provided for delete');
        return { success: false, error: 'No scan ID provided' };
      }
      
      const response = await fetch(`${this.base}?id=${id}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅', result.message);
      } else {
        console.error('❌ Delete failed:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  },
  
  async getAll() {
    try {
      console.log('📡 Fetching all scans from:', this.base);
      
      const response = await fetch(this.base, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Retrieved ${result.scans?.length || 0} scans`);
        if (result.scans && result.scans.length > 0) {
          console.log('📋 Available scan IDs:', result.scans.map(s => ({ 
            id: s.id, 
            company: s.assets?.company_name,
            type: s.scan_type
          })));
        }
      } else {
        console.error('❌ Failed to fetch scans:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, scans: [] };
    }
  }
};

export default api;