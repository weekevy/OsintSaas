import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      const socketInstance = io(import.meta.env.VITE_WS_URL || 'http://localhost:4005', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });

      socketInstance.on('connect', () => {
        console.log('Connected to WebSocket server');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });

      setSocket(socketInstance);

      socketInstance.on('scan_failed', (data) => {
        if (window.showToast) {
          window.showToast(data.message || 'Scan failed', 'error');
        }
      });

      socketInstance.on('token_update', (data) => {
        window.dispatchEvent(new CustomEvent('token_sync', { detail: data }));
      });

      return () => {
        socketInstance.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  const joinProject = useCallback((projectId) => {
    if (socket && isConnected) {
      socket.emit('join_project', projectId);
    }
  }, [socket, isConnected]);

  const value = {
    socket,
    isConnected,
    joinProject,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
