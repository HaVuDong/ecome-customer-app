import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { LoginRequest, RegisterRequest, User } from '../../core/services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user & token khi app khởi động
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      console.log('🔐 Loading stored auth...');
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('customer_token'),
        AsyncStorage.getItem('customer_user'),
      ]);

      console.log('🔐 Stored token exists:', !!storedToken);
      console.log('🔐 Stored user exists:', !!storedUser);

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('🔐 User role:', parsedUser.role);
        
        // Kiểm tra role phải là CUSTOMER
        if (parsedUser.role === 'CUSTOMER') {
          setToken(storedToken);
          setUser(parsedUser);
          console.log('🔐 Auth loaded successfully');
        } else {
          // Nếu không phải CUSTOMER, xóa token
          console.log('🔐 Invalid role, clearing auth');
          await AsyncStorage.removeItem('customer_token');
          await AsyncStorage.removeItem('customer_user');
        }
      } else {
        console.log('🔐 No stored auth found - will show login screen');
      }
    } catch (error) {
      console.error('🔐 Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    try {
      console.log('🔐 Attempting login for:', data.email);
      const response = await authService.login(data);
      console.log('🔐 Login response:', { token: !!response.token, user: response.user });
      
      // Kiểm tra role phải là CUSTOMER
      if (response.user.role !== 'CUSTOMER') {
        throw new Error('Tài khoản này không phải là tài khoản khách hàng. Vui lòng sử dụng app dành cho người bán.');
      }
      
      // Save to state
      setToken(response.token);
      setUser(response.user);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('customer_token', response.token);
      await AsyncStorage.setItem('customer_user', JSON.stringify(response.user));
      console.log('🔐 Login successful, token saved');
    } catch (error: any) {
      console.error('🔐 Login error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Đăng nhập thất bại');
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data);
      
      setToken(response.token);
      setUser(response.user);
      
      await AsyncStorage.setItem('customer_token', response.token);
      await AsyncStorage.setItem('customer_user', JSON.stringify(response.user));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Đăng ký thất bại');
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem('customer_token');
      await AsyncStorage.removeItem('customer_user');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const updatedUser = await authService.getCurrentUser();
      setUser(updatedUser);
      await AsyncStorage.setItem('customer_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
