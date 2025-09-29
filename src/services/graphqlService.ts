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

interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  encoding: string;
  size: number;
  path: string;
  fileType: string;
  uploadedAt: string;
  metadata?: Record<string, unknown>;
  analysisReport?: AnalysisReport;
}

interface AnalysisReport {
  id: string;
  fileUploadId: string;
  fileUpload: FileUpload;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  title: string;
  summary: string;
  executionTime?: number;
  insights: Insight[];
  recommendations: string[];
  dataQuality?: DataQuality;
  visualizations: Visualization[];
  extractedText?: string;
  rawAnalysis?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

interface Insight {
  id: string;
  reportId: string;
  type: string;
  title: string;
  description: string;
  value?: string;
  confidence?: number;
  importance?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface DataQuality {
  score: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  issues: DataQualityIssue[];
}

interface DataQualityIssue {
  type: string;
  description: string;
  severity: string;
  count: number;
  examples: string[];
}

interface Visualization {
  id: string;
  type: string;
  title: string;
  description?: string;
  data: Record<string, unknown>;
  config?: Record<string, unknown>;
}

interface FileUploadInput {
  file: File;
  description?: string;
  tags?: string[];
  analysisOptions?: AnalysisOptionsInput;
}

interface AnalysisOptionsInput {
  analyzeRevenue?: boolean;
  analyzeTables?: boolean;
  generateInsights?: boolean;
  checkDataQuality?: boolean;
  generateVisualizations?: boolean;
  customPrompts?: string[];
}

interface GetConnectionsResponse {
  getDataConnectionsPublic: Connection[];
}

interface ExecuteAIQueryResponse {
  executeAIQueryPublic: AIQueryResult;
}

interface UploadAndAnalyzeFileResponse {
  uploadAndAnalyzeFile: AnalysisReport;
}

interface GetAnalysisReportResponse {
  getAnalysisReport: AnalysisReport;
}

interface ListFileUploadsResponse {
  listFileUploads: FileUpload[];
}

class GraphQLService {
  async updateApiConnection(id: string, input: {
    name: string;
    type: string;
    config: {
      host?: string;
      port?: number;
      database?: string;
      username?: string;
      password?: string;
      apiUrl?: string;
      apiKey?: string;
      headers?: { key: string; value: string }[];
      timeout?: number;
    };
    isDefault?: boolean;
  }): Promise<Connection> {
    const mutation = `
      mutation UpdateApiConnection($id: ID!, $input: DataConnectionInput!) {
        updateDataConnection(id: $id, input: $input) {
          id
          name
          type
          status
          isDefault
          createdAt
          updatedAt
        }
      }
    `;
    const variables = { id, input };
    const response = await this.makeRequest<{ updateDataConnection: Connection }>(mutation, variables);
    return response.updateDataConnection;
  }

  async deleteConnection(id: string): Promise<boolean> {
    const mutation = `
      mutation DeleteConnection($id: ID!) {
        deleteDataConnection(id: $id)
      }
    `;
    const variables = { id };
    const response = await this.makeRequest<{ deleteDataConnection: boolean }>(mutation, variables);
    return response.deleteDataConnection;
  }
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

  async deleteQueryHistory(id: string): Promise<boolean> {
    const mutation = `
      mutation DeleteAIQuery($id: ID!) {
        deleteAIQueryPublic(id: $id)
      }
    `;

    const variables = { id };
    const response = await this.makeRequest<{ deleteAIQueryPublic: boolean }>(mutation, variables);
    return response.deleteAIQueryPublic;
  }

  async deleteMultipleQueryHistory(ids: string[]): Promise<{ deletedCount: number; errors: string[] }> {
    const mutation = `
      mutation DeleteMultipleAIQueries($ids: [ID!]!) {
        deleteMultipleAIQueriesPublic(ids: $ids) {
          deletedCount
          errors
        }
      }
    `;

    const variables = { ids };
    const response = await this.makeRequest<{ deleteMultipleAIQueriesPublic: { deletedCount: number; errors: string[] } }>(mutation, variables);
    return response.deleteMultipleAIQueriesPublic;
  }

  async clearAllQueryHistory(): Promise<{ deletedCount: number; message: string }> {
    const mutation = `
      mutation ClearAIQueryHistory {
        clearAIQueryHistoryPublic {
          deletedCount
          message
        }
      }
    `;

    const response = await this.makeRequest<{ clearAIQueryHistoryPublic: { deletedCount: number; message: string } }>(mutation);
    return response.clearAIQueryHistoryPublic;
  }

  // File Upload and Analysis Methods
  async uploadAndAnalyzeFile(input: FileUploadInput): Promise<AnalysisReport> {
    const formData = new FormData();
    
    // Create GraphQL operation for file upload
    const operations = JSON.stringify({
      query: `
        mutation UploadAndAnalyzeFile($input: FileUploadInput!) {
          uploadAndAnalyzeFile(input: $input) {
            id
            fileUploadId
            status
            title
            summary
            executionTime
            extractedText
            insights {
              id
              type
              title
              description
              value
              confidence
              importance
              createdAt
            }
            recommendations
            dataQuality {
              score
              completeness
              accuracy
              consistency
              validity
              issues {
                type
                description
                severity
                count
                examples
              }
            }
            visualizations {
              id
              type
              title
              description
              data
              config
            }
            fileUpload {
              id
              filename
              originalName
              mimetype
              size
              fileType
              uploadedAt
            }
            createdAt
            updatedAt
            error
          }
        }
      `,
      variables: {
        input: {
          description: input.description,
          tags: input.tags,
          analysisOptions: input.analysisOptions
        }
      }
    });

    // Create map for file upload
    const map = JSON.stringify({
      "0": ["variables.input.file"]
    });

    // Add to FormData
    formData.append('operations', operations);
    formData.append('map', map);
    formData.append('0', input.file);

    try {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<UploadAndAnalyzeFileResponse> = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL error occurred');
      }

      if (!result.data) {
        throw new Error('No data returned from GraphQL query');
      }

      return result.data.uploadAndAnalyzeFile;
    } catch (error) {
      console.error('File upload and analysis failed:', error);
      throw error;
    }
  }

  async getAnalysisReport(id: string): Promise<AnalysisReport | null> {
    const query = `
      query GetAnalysisReport($id: ID!) {
        getAnalysisReport(id: $id) {
          id
          fileUploadId
          status
          title
          summary
          executionTime
          extractedText
          insights {
            id
            type
            title
            description
            value
            confidence
            importance
            createdAt
          }
          recommendations
          dataQuality {
            score
            completeness
            accuracy
            consistency
            validity
            issues {
              type
              description
              severity
              count
              examples
            }
          }
          visualizations {
            id
            type
            title
            description
            data
            config
          }
          fileUpload {
            id
            filename
            originalName
            mimetype
            size
            fileType
            uploadedAt
          }
          createdAt
          updatedAt
          error
        }
      }
    `;

    const variables = { id };
    const response = await this.makeRequest<GetAnalysisReportResponse>(query, variables);
    return response.getAnalysisReport;
  }

  async listFileUploads(limit: number = 20, offset: number = 0): Promise<FileUpload[]> {
    const query = `
      query ListFileUploads($limit: Int, $offset: Int) {
        listFileUploads(limit: $limit, offset: $offset) {
          id
          filename
          originalName
          mimetype
          size
          fileType
          uploadedAt
          metadata
          analysisReport {
            id
            status
            title
            summary
            createdAt
          }
        }
      }
    `;

    const variables = { limit, offset };
    const response = await this.makeRequest<ListFileUploadsResponse>(query, variables);
    return response.listFileUploads;
  }

  async deleteFileUpload(id: string): Promise<boolean> {
    const mutation = `
      mutation DeleteFileUpload($id: ID!) {
        deleteFileUpload(id: $id)
      }
    `;

    const variables = { id };
    const response = await this.makeRequest<{ deleteFileUpload: boolean }>(mutation, variables);
    return response.deleteFileUpload;
  }

    async createApiConnection(input: {
      name: string;
      type: string;
      config: {
        host?: string;
        port?: number;
        database?: string;
        username?: string;
        password?: string;
        apiUrl?: string;
        apiKey?: string;
        headers?: { key: string; value: string }[];
        timeout?: number;
      };
      isDefault?: boolean;
    }): Promise<Connection> {
      const mutation = `
        mutation CreateApiConnection($input: DataConnectionInput!) {
          createDataConnectionPublic(input: $input) {
            id
            name
            type
            status
            isDefault
            createdAt
          }
        }
      `;
      const variables = { input };
      const response = await this.makeRequest<{ createDataConnectionPublic: Connection }>(mutation, variables);
      return response.createDataConnectionPublic;
    }
}

export const graphqlService = new GraphQLService();
export type { 
  Connection, 
  AIQueryResult, 
  FileUpload, 
  AnalysisReport, 
  Insight, 
  DataQuality, 
  Visualization,
  FileUploadInput,
  AnalysisOptionsInput
};