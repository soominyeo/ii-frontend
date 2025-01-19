import apiClient from 'api/apiClient';
import Cookies from 'js-cookie';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { UserAuthData, UserData } from 'types/auth';

interface AuthContextType {
  login: (_userData: UserAuthData) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('context not provided by AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
}: AuthProviderProps) => {
  const login = async ({ username, password }: UserAuthData) => {
    const response = await apiClient.post('/auth/login', {
      username,
      password,
    });
    if (response.status !== 200) {
      throw Error('failed to login');
    }
    const accessToken = response.headers.Authorization
      ?.toString()
      .replace('Bearer: ', '')
      .trim();
    console.log('Authorization: ' + response.headers) 
    console.log('accessToken: ' + accessToken);
    if (!accessToken) {
      throw Error('Access token not provided');
    }
    Cookies.set('accessToken', accessToken, { expires: 4 });
  };

  const logout = async () => {
    await apiClient.get('/auth/logout');
  };

  const refresh = async () => {
    await apiClient.post('/auth/refresh');
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
