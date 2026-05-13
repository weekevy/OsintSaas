import { useEffect, useCallback, useRef } from 'react';
import { isTokenExpired, getToken, clearSession } from '../utils/authUtils';

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity
// const IDLE_TIMEOUT = 10 * 1000; // 10 seconds of inactivity
export const useSessionCheck = (onSessionExpired) => {
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const handleExpiry = useCallback(() => {
    clearSession();
    if (onSessionExpired) {
      onSessionExpired();
    }
  }, [onSessionExpired]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(handleExpiry, IDLE_TIMEOUT);
  }, [handleExpiry]);

  const checkSession = useCallback(() => {
    const token = getToken();
    
    if (token && isTokenExpired(token)) {
      handleExpiry();
      return true;
    }
    return false;
  }, [handleExpiry]);

  useEffect(() => {
    if (!onSessionExpired) return;

    // Initial check
    checkSession();
    resetTimer();

    // Check token expiration periodically
    intervalRef.current = setInterval(checkSession, 30000);

    // Activity listeners
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => resetTimer();
    
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [checkSession, resetTimer, onSessionExpired]);

  return { checkSession, resetTimer };
};