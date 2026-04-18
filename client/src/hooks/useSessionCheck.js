import { useEffect, useCallback, useRef } from 'react';
import { isTokenExpired, getToken, clearSession } from '../utils/authUtils';

export const useSessionCheck = (onSessionExpired) => {
  const intervalRef = useRef(null);

  const checkSession = useCallback(() => {
    const token = getToken();
    
    if (token && isTokenExpired(token)) {
      clearSession();
      if (onSessionExpired) {
        onSessionExpired();
      }
      return true;
    }
    return false;
  }, [onSessionExpired]);

  useEffect(() => {
    // Check immediately on mount
    checkSession();
    
    // Check every 30 seconds
    intervalRef.current = setInterval(checkSession, 30000);
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkSession]);

  return { checkSession };
};