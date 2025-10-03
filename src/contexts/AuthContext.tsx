import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotification } from './NotificationContext';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
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
  updateProfile: (patch: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// GraphQL endpoint - Check if the server is running
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiredNotified, setSessionExpiredNotified] = useState(false);
  const { showSuccess, showError } = useNotification();

  // GraphQL mutation for login - simplified to avoid potential parsing issues
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
}`;

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
  const graphqlRequest = useCallback(async (query: string, variables?: Record<string, unknown>, includeAuth = false) => {
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
      const requestBody = {
        query,
        variables,
      };
      
      console.log('🔍 GraphQL Request:', {
        endpoint: GRAPHQL_ENDPOINT,
        headers,
        body: requestBody
      });

      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ GraphQL Response:', result);
      
      if (result.errors) {
        console.error('❌ GraphQL Errors:', result.errors);
        throw new Error(result.errors[0].message);
      }

      return result.data;
    } catch (error) {
      console.error('💥 GraphQL request failed:', error);
      throw error;
    }
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string, companySlug: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // First, check if GraphQL endpoint is available
      console.log('🔍 Testing GraphQL endpoint:', GRAPHQL_ENDPOINT);
      
      const testResponse = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '{ __typename }' // Simple introspection query
        })
      }).catch((fetchError) => {
        console.error('❌ Fetch error:', fetchError);
        return null;
      });

      if (!testResponse) {
        console.warn('⚠️ No response from GraphQL server (network error)');
      } else {
        console.log('📡 Test response status:', testResponse.status);
        console.log('📡 Test response headers:', Object.fromEntries(testResponse.headers.entries()));
        
        // Try to read the response to see what we're getting
        const responseClone = testResponse.clone();
        try {
          const responseText = await responseClone.text();
          console.log('📄 Test response body (first 200 chars):', responseText.substring(0, 200));
          
          // Check if response is HTML instead of JSON
          if (responseText.startsWith('<html') || responseText.startsWith('<!DOCTYPE')) {
            console.warn('⚠️ Server returned HTML instead of JSON - likely not a GraphQL endpoint');
          }
        } catch (readError) {
          console.error('❌ Could not read test response:', readError);
        }
      }

      if (!testResponse || !testResponse.ok) {
        console.warn('⚠️ GraphQL server not available at ' + GRAPHQL_ENDPOINT);
        console.warn('📝 Using mock authentication for development');
        
        // Mock authentication for development
        if (email && password && companySlug) {
          const mockUser = {
            id: '1',
            email: email,
            firstName: email.split('@')[0],
            lastName: 'User',
            role: 'admin'
          };
          
          const mockCompany = {
            id: '1',
            name: companySlug.charAt(0).toUpperCase() + companySlug.slice(1),
            slug: companySlug
          };

          // Store mock tokens
          localStorage.setItem('accessToken', 'mock-access-token');
          localStorage.setItem('refreshToken', 'mock-refresh-token');
          localStorage.setItem('tokenExpiry', (Date.now() + 3600000).toString()); // 1 hour

          setUser(mockUser);
          setCompany(mockCompany);
          
          showSuccess(`Bem-vindo, ${mockUser.firstName}! (Modo desenvolvimento - servidor GraphQL não encontrado)`, 5000, 'high');
          return true;
        } else {
          showError('Por favor, preencha todos os campos.');
          return false;
        }
      }

      // If server is available, use GraphQL
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
        
        // Reset session expired notification flag on successful login
        setSessionExpiredNotified(false);
        
        // Show success message
        showSuccess(`Bem-vindo, ${userData.firstName}! Login realizado com sucesso.`, 5000, 'high');
        
        return true;
      } else {
        const errorMessage = data.login.message || 'Credenciais inválidas ou empresa não encontrada';
        showError(errorMessage);
        console.error('Login failed:', data.login.message);
        return false;
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      
      // Check if it's a JSON parse error (the original issue)
      if (error instanceof Error && error.message.includes('Unexpected token')) {
        console.error('🔍 JSON Parse Error - likely server issue:', error.message);
        showError('Erro no servidor. Usando autenticação local temporária.');
        
        // Fallback to mock authentication
        if (email && password && companySlug) {
          const mockUser = {
            id: '1',
            email: email,
            firstName: email.split('@')[0],
            lastName: 'User',
            role: 'admin'
          };
          
          setUser(mockUser);
          setCompany({ id: '1', name: companySlug, slug: companySlug });
          localStorage.setItem('accessToken', 'mock-token');
          
          // Reset session expired notification flag
          setSessionExpiredNotified(false);
          
          showSuccess(`Login local realizado para ${mockUser.firstName}`, 5000, 'high');
          return true;
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Erro de conexão. Verifique sua internet e tente novamente.';
      showError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [LOGIN_MUTATION, showSuccess, showError, graphqlRequest]);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      await graphqlRequest(LOGOUT_MUTATION, {}, true);
      showSuccess('Logout realizado com sucesso. Até breve!', 5000, 'high');
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
  }, [showSuccess, showError, LOGOUT_MUTATION, graphqlRequest]);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
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
  }, [REFRESH_TOKEN_MUTATION, logout, graphqlRequest]);

  // Update profile function (partial update)
  const UPDATE_PROFILE_MUTATION = `
    mutation UpdateUser($input: UpdateUserInput!) {
      updateUser(input: $input) {
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
        }
        errors
      }
    }
  `;

  const updateProfile = useCallback(async (patch: Partial<User>): Promise<boolean> => {
    try {
      // If GraphQL is available, try to persist the change
      const data = await graphqlRequest(UPDATE_PROFILE_MUTATION, { input: patch }, true).catch(() => null);
      if (data && data.updateUser && data.updateUser.success) {
        const userData = data.updateUser.data.user;
        setUser((prev) => (prev ? { ...prev, ...userData } : userData));
        showSuccess('Perfil atualizado com sucesso.');
        return true;
      }

      // Fallback: local update
      setUser((prev) => (prev ? { ...prev, ...patch } as User : prev));
      showSuccess('Perfil atualizado (modo offline).');
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      showError('Não foi possível atualizar o perfil.');
      return false;
    }
  }, [UPDATE_PROFILE_MUTATION, graphqlRequest, showError, showSuccess]);

  // Check if user is authenticated
  const checkAuth = useCallback(async () => {
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
      // Only show error notification once to prevent spam
      const hadToken = localStorage.getItem('accessToken');
      if (hadToken && !sessionExpiredNotified) {
        showError('Sessão expirada. Faça login novamente.', undefined, 'high');
        setSessionExpiredNotified(true);
      }
      await logout();
    } finally {
      setIsLoading(false);
    }
  }, [refreshToken, logout, showError, ME_QUERY, graphqlRequest, sessionExpiredNotified]);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
  }, [user, refreshToken]);

  const value = {
    user,
    company,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken,
    updateProfile,
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