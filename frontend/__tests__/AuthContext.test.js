import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Test bileşeni
const TestComponent = () => {
  const { user, login, logout, loading } = useAuth();
  
  return {
    user,
    login,
    logout,
    loading
  };
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
  });

  it('should provide initial auth state', async () => {
    let authState;

    const TestWrapper = () => {
      authState = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestWrapper />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authState.user).toBeNull();
      expect(authState.loading).toBe(false);
    });
  });

  it('should handle successful login', async () => {
    const mockResponse = {
      token: 'test-token',
      user: {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com'
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    let authState;

    const TestWrapper = () => {
      authState = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestWrapper />
      </AuthProvider>
    );

    await act(async () => {
      const result = await authState.login('test@example.com', 'password');
      expect(result.success).toBe(true);
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
    expect(authState.user).toEqual(mockResponse.user);
  });

  it('should handle login failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Geçersiz kimlik bilgileri' }),
    });

    let authState;

    const TestWrapper = () => {
      authState = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestWrapper />
      </AuthProvider>
    );

    await act(async () => {
      const result = await authState.login('test@example.com', 'wrongpassword');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Geçersiz kimlik bilgileri');
    });

    expect(authState.user).toBeNull();
  });

  it('should handle logout', async () => {
    // İlk olarak login ol
    const mockResponse = {
      token: 'test-token',
      user: {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com'
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    let authState;

    const TestWrapper = () => {
      authState = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestWrapper />
      </AuthProvider>
    );

    // Login
    await act(async () => {
      await authState.login('test@example.com', 'password');
    });

    expect(authState.user).toEqual(mockResponse.user);

    // Logout
    await act(async () => {
      await authState.logout();
    });

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
    expect(authState.user).toBeNull();
  });

  it('should restore user from stored token', async () => {
    const mockToken = 'stored-token';
    const mockUser = {
      id: 1,
      first_name: 'Stored',
      last_name: 'User',
      email: 'stored@example.com'
    };

    AsyncStorage.getItem.mockResolvedValue(mockToken);
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, user: mockUser }),
    });

    let authState;

    const TestWrapper = () => {
      authState = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestWrapper />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authState.user).toEqual(mockUser);
      expect(authState.loading).toBe(false);
    });
  });
}); 