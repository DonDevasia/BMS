import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      return null;
    }
  });

  const login = (userData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (e) {
      console.error('Failed to save user in localStorage', e);
    }
    setUser(userData);
  };

  const logout = () => {
    try {
      localStorage.removeItem('user');
    } catch (e) {
      console.error('Failed to remove user from localStorage', e);
    }
    setUser(null);
  };

  const userName = user?.full_name || user?.name || (user?.role === 'admin' ? 'Nexus Administrator' : 'Customer');
  const userFirstName = userName.split(' ')[0];
  const userEmail = user?.email || '';
  const userRole = user?.role || 'customer';
  const isAdmin = userRole === 'admin';
  const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=${isAdmin ? '4f46e5' : '2563eb'}&color=fff&bold=true`;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        userName,
        userFirstName,
        userEmail,
        userRole,
        isAdmin,
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
