import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '../utils/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithPhone: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_URL = 'https://auth.emergentagent.com';
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://rentalfleet-9.preview.emergentagent.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const extractSessionId = (url: string): string | null => {
    if (!url) return null;
    
    // Check hash fragment
    const hashMatch = url.match(/#session_id=([^&]+)/);
    if (hashMatch) return hashMatch[1];
    
    // Check query params
    const queryMatch = url.match(/[?&]session_id=([^&]+)/);
    if (queryMatch) return queryMatch[1];
    
    return null;
  };

  const processSessionId = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const result = await api.exchangeSession(sessionId);
      if (result.session_token) {
        await setAuthToken(result.session_token);
      }
      if (result.user) {
        setUser(result.user);
      }
    } catch (error) {
      console.error('Failed to process session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingSession = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        const userData = await api.getMe();
        setUser(userData);
      }
    } catch (error) {
      await removeAuthToken();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      // Check for session_id from cold start (deep link)
      if (Platform.OS !== 'web') {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          const sessionId = extractSessionId(initialUrl);
          if (sessionId) {
            await processSessionId(sessionId);
            return;
          }
        }
      } else {
        // Web: check hash
        if (typeof window !== 'undefined' && window.location.hash) {
          const sessionId = extractSessionId(window.location.hash);
          if (sessionId) {
            window.history.replaceState(null, '', window.location.pathname);
            await processSessionId(sessionId);
            return;
          }
        }
      }
      
      // No session_id, check existing session
      await checkExistingSession();
    };

    init();

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', async (event) => {
      const sessionId = extractSessionId(event.url);
      if (sessionId) {
        await processSessionId(sessionId);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      const redirectUrl = Platform.OS === 'web'
        ? `${BACKEND_URL}/`
        : Linking.createURL('/');
      
      const authUrl = `${AUTH_URL}/?redirect=${encodeURIComponent(redirectUrl)}`;
      
      if (Platform.OS === 'web') {
        window.location.href = authUrl;
      } else {
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
        
        if (result.type === 'success' && result.url) {
          const sessionId = extractSessionId(result.url);
          if (sessionId) {
            await processSessionId(sessionId);
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPhone = async (phone: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await api.login({ phone, password });
      if (result.session_token) {
        await setAuthToken(result.session_token);
      }
      if (result.user) {
        setUser(result.user);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (phone: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const result = await api.register({ phone, password, name });
      if (result.session_token) {
        await setAuthToken(result.session_token);
      }
      if (result.user) {
        setUser(result.user);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await removeAuthToken();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        loginWithGoogle,
        loginWithPhone,
        register,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
