import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Company {
  id: string;
  name: string;
  slug: string;
}

interface AuthContextType {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, companySlug: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// GraphQL endpoint
const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess, showError } = useNotification();

  // GraphQL mutation for login
  const LOGIN_MUTATION = `
    mutation LoginUser($input: LoginInput!) {
      login(input: $input) {
        success
        message
        data {
          user {
            id
            email
            firstName
            lastName
            role
          }
          company {
            id
            name
            slug
          }
          tokens {
            accessToken
            refreshToken
            expiresIn
          }
        }
        errors
      }
    }
  `;

  // GraphQL query for getting current user
  const ME_QUERY = `
    query GetMe {
      me {
        user {
          id
          email
          firstName
          lastName
          role
        }
        company {
          id
          name
          slug
        }
      }
    }
  `;

  // GraphQL mutation for logout
  const LOGOUT_MUTATION = `
    mutation Logout {
      logout {
        success
        message
      }
    }
  `;

  // GraphQL mutation for refresh token
  const REFRESH_TOKEN_MUTATION = `
    mutation RefreshToken($input: RefreshTokenInput!) {
      refreshToken(input: $input) {
        success
        message
        data {
          tokens {
            accessToken
            refreshToken
            expiresIn
          }
        }
        errors
      }
    }
  `;

  // Helper function to make GraphQL requests
  const graphqlRequest = async (query: string, variables?: any, includeAuth = false) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data;
    } catch (error) {
      console.error('GraphQL request failed:', error);
      throw error;
    }
  };

  // Login function
  const login = async (email: string, password: string, companySlug: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await graphqlRequest(LOGIN_MUTATION, {
        input: { email, password, companySlug }
      });

      if (data.login.success) {
        const { user: userData, company: companyData, tokens } = data.login.data;
        
        // Store tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('tokenExpiry', (Date.now() + tokens.expiresIn * 1000).toString());

        // Set user and company state
        setUser(userData);
        setCompany(companyData);
        
        // Show success message
        showSuccess(`Bem-vindo, ${userData.firstName}! Login realizado com sucesso.`);
        
        return true;
      } else {
        const errorMessage = data.login.message || 'Credenciais inválidas ou empresa não encontrada';
        showError(errorMessage);
        console.error('Login failed:', data.login.message);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro de conexão. Verifique sua internet e tente novamente.';
      showError(errorMessage);
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await graphqlRequest(LOGOUT_MUTATION, {}, true);
      showSuccess('Logout realizado com sucesso. Até breve!');
    } catch (error) {
      console.error('Logout error:', error);
      showError('Erro ao fazer logout, mas você foi desconectado localmente.');
    } finally {
      // Clear local storage and state regardless of API response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
      setUser(null);
      setCompany(null);
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
      return false;
    }

    try {
      const data = await graphqlRequest(REFRESH_TOKEN_MUTATION, {
        input: { refreshToken: refreshTokenValue }
      });

      if (data.refreshToken.success) {
        const { tokens } = data.refreshToken.data;
        
        // Update tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('tokenExpiry', (Date.now() + tokens.expiresIn * 1000).toString());
        
        return true;
      } else {
        console.error('Token refresh failed:', data.refreshToken.message);
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      return false;
    }
  };

  // Check if user is authenticated
  const checkAuth = async () => {
    setIsLoading(true);
    
    const token = localStorage.getItem('accessToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Check if token is expired
    if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
      console.log('Token expired, attempting refresh...');
      const refreshed = await refreshToken();
      if (!refreshed) {
        setIsLoading(false);
        return;
      }
    }

    try {
      const data = await graphqlRequest(ME_QUERY, {}, true);
      
      if (data.me) {
        setUser(data.me.user);
        setCompany(data.me.company);
      } else {
        await logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      showError('Sessão expirada. Faça login novamente.');
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!user) return;

    const tokenExpiry = localStorage.getItem('tokenExpiry');
    if (!tokenExpiry) return;

    const expiryTime = parseInt(tokenExpiry);
    const refreshTime = expiryTime - Date.now() - 60000; // Refresh 1 minute before expiry

    if (refreshTime > 0) {
      const timeoutId = setTimeout(() => {
        refreshToken();
      }, refreshTime);

      return () => clearTimeout(timeoutId);
    }
  }, [user]);

  const value = {
    user,
    company,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};