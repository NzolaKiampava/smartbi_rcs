interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: Record<string, unknown>;
  }>;
}

interface Connection {
  id: string;
  name: string;
  type: string;
  status: string;
  isDefault: boolean;
  createdAt: string;
}

interface AIQueryResult {
  id: string;
  naturalQuery: string;
  generatedQuery: string;
  results: Record<string, unknown>[];
  executionTime: number;
  status: string;
  error?: string;
  createdAt: string;
}

interface GetConnectionsResponse {
  getDataConnectionsPublic: Connection[];
}

interface ExecuteAIQueryResponse {
  executeAIQueryPublic: AIQueryResult;
}

class GraphQLService {
  private endpoint: string;

  constructor() {
    this.endpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';
  }

  private async makeRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('accessToken');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      if (!result.data) {
        throw new Error('No data received from server');
      }

      return result.data;
    } catch (error) {
      console.error('GraphQL request failed:', error);
      throw error;
    }
  }

  async getConnections(): Promise<Connection[]> {
    const query = `
      query GetConnections {
        getDataConnectionsPublic {
          id
          name
          type
          status
          isDefault
          createdAt
        }
      }
    `;

    const response = await this.makeRequest<GetConnectionsResponse>(query);
    return response.getDataConnectionsPublic;
  }

  async executeNaturalQuery(connectionId: string, naturalQuery: string): Promise<AIQueryResult> {
    const mutation = `
      mutation ExecuteNaturalQuery($input: AIQueryInput!) {
        executeAIQueryPublic(input: $input) {
          id
          naturalQuery
          generatedQuery
          results {
            data
          }
          executionTime
          status
          error
          createdAt
        }
      }
    `;

    const variables = {
      input: {
        connectionId,
        naturalQuery,
      },
    };

    const response = await this.makeRequest<ExecuteAIQueryResponse>(mutation, variables);
    return response.executeAIQueryPublic;
  }

  async getQueryHistory(): Promise<AIQueryResult[]> {
    const query = `
      query GetAllQueryHistory {
        getAIQueryHistoryPublic {
          id
          naturalQuery
          generatedQuery
          status
          executionTime
          error
          createdAt
          results {
            data
          }
        }
      }
    `;

    const response = await this.makeRequest<{ getAIQueryHistoryPublic: AIQueryResult[] }>(query);
    return response.getAIQueryHistoryPublic;
  }
}

export const graphqlService = new GraphQLService();
export type { Connection, AIQueryResult };