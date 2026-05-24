import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Handle real-time token updates
  useEffect(() => {
    // Note: Since SocketProvider is a child of AuthProvider in App.js,
    // we should ideally use a custom event or check for socket availability.
    // For now, we'll use a window event as a bridge or refactor the provider order.
    const handleTokenUpdate = (event) => {
      if (event.detail && typeof event.detail.credits === 'number') {
        setUser(prev => prev ? { ...prev, credits: event.detail.credits } : null);
      }
    };

    window.addEventListener('token_sync', handleTokenUpdate);
    return () => window.removeEventListener('token_sync', handleTokenUpdate);
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/check-auth', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        // If on protected route and not authenticated, redirect to home
        if (window.location.pathname.startsWith('/home') || 
            window.location.pathname.startsWith('/dashboard') ||
            window.location.pathname.startsWith('/profile')) {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (response.ok) {
        // Set user but DON'T set isAuthenticated yet - wait for OTP
        setUser(data.user);
        // Return success with user data without redirecting
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // New function to finalize login after OTP verification
  const finalizeLogin = () => {
    setIsAuthenticated(true);
    navigate('/home');
  };

  const register = async (email, password, username, firstName, lastName) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, username, firstName, lastName }),
      });

      const data = await response.json();

      if (response.ok) {
        // Set user but wait for OTP to set isAuthenticated
        setUser(data.user);
        // Don't redirect immediately for registration either
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      navigate('/');
    }
  };

  const updateCredits = (newCredits) => {
    setUser(prev => prev ? { ...prev, credits: newCredits } : null);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    finalizeLogin,
    updateCredits
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};