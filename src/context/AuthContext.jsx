import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('nexus_token') || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Authenticated fetch helper
  const authFetch = useCallback(async (url, options = {}) => {
    const currentToken = token || localStorage.getItem('nexus_token');
    const headers = {
      ...(options.headers || {}),
    };

    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      // Token expired or invalid - clear session
      logout();
    }

    return response;
  }, [token]);

  // Verify session on initial load
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('nexus_token');
      if (savedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setUser(data.user);
              localStorage.setItem('user', JSON.stringify(data.user));
            }
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session verification error:', err);
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = (newTokenOrUser, maybeUser) => {
    try {
      let activeToken = null;
      let activeUser = null;

      if (typeof newTokenOrUser === 'string') {
        activeToken = newTokenOrUser;
        activeUser = maybeUser;
      } else {
        // Fallback for login(user)
        activeUser = newTokenOrUser;
        activeToken = activeUser?.token || null;
      }

      if (activeToken) {
        localStorage.setItem('nexus_token', activeToken);
        setToken(activeToken);
      }
      if (activeUser) {
        localStorage.setItem('user', JSON.stringify(activeUser));
        setUser(activeUser);
      }
    } catch (e) {
      console.error('Failed to save session in localStorage', e);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('nexus_token');
      localStorage.removeItem('user');
    } catch (e) {
      console.error('Failed to remove session from localStorage', e);
    }
    setToken(null);
    setUser(null);
  };

  const userName = user?.full_name || user?.name || (user?.role === 'admin' ? 'Nexus Administrator' : 'Customer');
  const userFirstName = userName.split(' ')[0];
  const userEmail = user?.email || '';
  const userRole = user?.role || 'customer';
  const isAdmin = userRole === 'admin';
  const isCustomer = userRole === 'customer';
  const customerId = user?.customer_id || null;
  const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=${isAdmin ? '4f46e5' : '2563eb'}&color=fff&bold=true`;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        authFetch,
        userName,
        userFirstName,
        userEmail,
        userRole,
        isAdmin,
        isCustomer,
        customerId,
        userAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
