import React, { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSessionCheck } from '../../hooks/useSessionCheck';
import SessionExpiredModal from './SessionExpiredModal';

const SessionManager = () => {
  const { logout, isAuthenticated } = useAuth();
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  const handleSessionExpired = useCallback(() => {
    if (isAuthenticated) {
      setShowExpiredModal(true);
      // We don't call logout immediately because we want to show the modal first
      // The modal will handle the redirect after 3 seconds
    }
  }, [isAuthenticated]);

  const handleCloseExpiredModal = useCallback(() => {
    setShowExpiredModal(false);
    logout();
  }, [logout]);

  // Only check session if authenticated
  useSessionCheck(isAuthenticated ? handleSessionExpired : null);

  return (
    <SessionExpiredModal 
      isOpen={showExpiredModal} 
      onClose={handleCloseExpiredModal}
    />
  );
};

export default SessionManager;