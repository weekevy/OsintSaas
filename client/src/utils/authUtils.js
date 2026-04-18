// Token validation and session management utilities

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const hasValidSession = () => {
  const token = getToken();
  const user = getUser();
  return token && user && !isTokenExpired(token);
};