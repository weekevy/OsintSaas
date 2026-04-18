// API temporarily disabled - UI only mode (no backend connection)
export const api = {
  base: '/api/modules/linkedin-investigation',
  
  async create(data, files = []) {
    // Mock response - NO API CALL
    console.log('🔵 LinkedIn UI Mode - Data that would be saved:', data);
    console.log('🔵 LinkedIn UI Mode - Files that would be uploaded:', files.length);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return success without making any real API call
    return { 
      success: true, 
      message: '✅ LinkedIn investigation saved (UI Mode - API coming soon)',
      scan: {
        id: Math.floor(Math.random() * 10000),
        status: 'queued'
      }
    };
  },
  
  async update(id, data) {
    console.log('🔵 LinkedIn UI Mode - Would update scan:', id, data);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { 
      success: true, 
      message: '✅ LinkedIn investigation updated (UI Mode - API coming soon)' 
    };
  },
  
  async delete(id) {
    console.log('🔵 LinkedIn UI Mode - Would delete scan:', id);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { 
      success: true, 
      message: '✅ LinkedIn investigation deleted (UI Mode - API coming soon)' 
    };
  },
  
  async getAll() {
    console.log('🔵 LinkedIn UI Mode - Would fetch all scans');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { 
      success: true, 
      scans: [] 
    };
  }
};

export default api;