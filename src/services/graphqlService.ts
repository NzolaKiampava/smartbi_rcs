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

interface UploadAndAnalyzeFileResponse {
  uploadAndAnalyzeFile: AnalysisReport;
}

interface GetAnalysisReportResponse {
  getAnalysisReport: AnalysisReport;
}

interface ListFileUploadsResponse {
  listFileUploads: FileUpload[];
}

interface ManagementUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  companyId?: string | null;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ManagementUserList {
  users: ManagementUser[];
  total: number;
  hasMore: boolean;
}

interface ManagementUserListResponse {
  success: boolean;
  data?: ManagementUserList;
  message?: string;
  errors?: string[];
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

  // Public delete for demo/dev connections (no auth required on backend)
  async deleteConnectionPublic(id: string): Promise<boolean> {
    const mutation = `
      mutation DeleteConnectionPublic($id: ID!) {
        deleteDataConnectionPublic(id: $id)
      }
    `;
    const variables = { id };
    const response = await this.makeRequest<{ deleteDataConnectionPublic: boolean }>(mutation, variables);
    return response.deleteDataConnectionPublic;
  }

  private endpoint: string;

  constructor() {
    this.endpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';
    console.log('🔗 GraphQL Endpoint configurado:', this.endpoint);
  }

  private async makeRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const maxRetries = 1;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
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

        console.log(`📡 GraphQL Request (tentativa ${attempt + 1}/${maxRetries + 1}):`, {
          endpoint: this.endpoint,
          hasAuth: !!token,
          queryType: query.includes('mutation') ? 'mutation' : 'query'
        });

        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query,
            variables,
          }),
        });

        console.log(`📥 GraphQL Response:`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Sem detalhes do erro');
          console.error('❌ Erro HTTP:', { status: response.status, errorText });
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const result: GraphQLResponse<T> = await response.json();

        // Log detalhado da resposta GraphQL
        console.log('📦 Resposta GraphQL completa:', {
          hasData: !!result.data,
          hasErrors: !!result.errors,
          dataKeys: result.data ? Object.keys(result.data) : [],
          errorCount: result.errors?.length || 0
        });

        if (result.errors && result.errors.length > 0) {
          console.error('❌ Erros GraphQL:', result.errors);
          throw new Error(result.errors[0].message);
        }

        if (!result.data) {
          console.error('❌ Nenhum dado recebido do servidor');
          console.error('Resposta completa:', result);
          throw new Error('No data received from server');
        }

        console.log('✅ GraphQL Request bem-sucedida');
        return result.data;
      } catch (error) {
        lastError = error as Error;
        
        // Detecta erro CORS especificamente
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          console.error('🚫 ERRO CORS DETECTADO!');
          console.error('⚠️ O backend no Vercel não permite requisições do navegador');
          console.error('💡 Solução: Configure CORS no backend ou use endpoint localhost');
          console.error(`📍 Endpoint atual: ${this.endpoint}`);
          
          // Cria erro mais descritivo
          lastError = new Error(
            'CORS Error: O backend não permite requisições do navegador. ' +
            'Verifique as configurações CORS do backend ou use http://localhost:4000/graphql'
          );
          
          // Não tenta novamente em caso de CORS (não adianta)
          break;
        }
        
        console.error(`❌ Tentativa ${attempt + 1} falhou:`, error);
        
        // Se não for a última tentativa, aguarda antes de tentar novamente
        if (attempt < maxRetries) {
          console.log('⏳ Aguardando antes de nova tentativa...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // Se todas as tentativas falharam
    console.error('❌ Todas as tentativas falharam. Último erro:', lastError);
    throw lastError || new Error('Request failed after all retries');
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
    const response = await this.makeRequest<{ getDataConnectionsPublic: Connection[] }>(query);
    const connections = response.getDataConnectionsPublic;
    
    console.log('🔌 Connections recebidas:', {
      totalItems: connections?.length || 0,
      isEmpty: !connections || connections.length === 0,
      firstItem: connections?.[0] ? {
        id: connections[0].id,
        name: connections[0].name,
        type: connections[0].type
      } : null
    });
    
    return connections || [];
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

    const response = await this.makeRequest<{ executeAIQueryPublic: AIQueryResult }>(mutation, variables);
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
    const history = response.getAIQueryHistoryPublic;
    
    console.log('📊 Query History recebido:', {
      totalItems: history?.length || 0,
      isEmpty: !history || history.length === 0,
      firstItem: history?.[0] ? {
        id: history[0].id,
        naturalQuery: history[0].naturalQuery,
        status: history[0].status
      } : null
    });
    
    return history || [];
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

  // ==================== NEW FILE UPLOAD METHODS (2-Step Architecture) ====================
  
  /**
   * Helper: Convert mimeType to FileType enum expected by backend
   */
  private mimeTypeToFileType(mimeType: string, fileName: string): string {
    // Check by mime type first
    if (mimeType.includes('csv') || mimeType === 'text/csv') return 'CSV';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'EXCEL';
    if (mimeType === 'application/json') return 'JSON';
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType === 'application/sql' || mimeType === 'text/sql') return 'SQL';
    if (mimeType.includes('text/plain')) return 'TXT';
    if (mimeType.includes('xml')) return 'XML';
    
    // Fallback: check by file extension
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'csv': return 'CSV';
      case 'xls':
      case 'xlsx': return 'EXCEL';
      case 'json': return 'JSON';
      case 'pdf': return 'PDF';
      case 'sql': return 'SQL';
      case 'txt': return 'TXT';
      case 'xml': return 'XML';
      default: return 'OTHER';
    }
  }
  
  /**
   * Step 1: Upload file to REST API endpoint
   * Returns fileId to be used in Step 2
   */
  async uploadFile(file: File): Promise<{
    success: boolean;
    fileId: string;
    fileName: string;
    originalName: string;
    size: number;
    url: string;
    message: string;
  }> {
    try {
      console.log('📤 Step 1: Uploading file to REST API...');
      
      // Convert file to base64
      const base64Content = await this.fileToBase64(file);
      
      // Get REST API endpoint
      // Handle both localhost (http://localhost:4000/graphql) and Vercel (https://.../api/graphql)
      let uploadEndpoint: string;
      if (this.endpoint.includes('/api/graphql')) {
        // Vercel: replace /api/graphql with /api/upload
        uploadEndpoint = this.endpoint.replace('/api/graphql', '/api/upload');
      } else {
        // Localhost: replace /graphql with /api/upload
        uploadEndpoint = this.endpoint.replace('/graphql', '/api/upload');
      }
      console.log('🔗 Upload endpoint:', uploadEndpoint);
      
      // Convert mimeType to FileType enum
      const fileType = this.mimeTypeToFileType(file.type, file.name);
      console.log('📝 File type detected:', fileType);
      
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          fileContent: base64Content,
          fileName: file.name,
          mimeType: file.type,
          fileType: fileType  // Add FileType enum for backend
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ File uploaded successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw error;
    }
  }

  /**
   * Step 2: Analyze uploaded file via GraphQL
   * Uses fileId from Step 1
   */
  async analyzeUploadedFile(
    fileId: string, 
    options?: AnalysisOptionsInput
  ): Promise<AnalysisReport> {
    console.log('🔍 Step 2: Analyzing file via GraphQL...');
    
    const mutation = `
      mutation AnalyzeFile($fileId: ID!, $options: AnalysisOptionsInput) {
        analyzeUploadedFile(fileId: $fileId, options: $options) {
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

    const variables = {
      fileId,
      options: options || {
        analyzeRevenue: true,
        analyzeTrends: true,
        analyzeComparisons: true
      }
    };

    try {
      const response = await this.makeRequest<{ analyzeUploadedFile: AnalysisReport }>(
        mutation, 
        variables
      );
      
      console.log('✅ File analysis completed:', response.analyzeUploadedFile);
      return response.analyzeUploadedFile;
    } catch (error) {
      console.error('❌ File analysis failed:', error);
      throw error;
    }
  }

  /**
   * Complete 2-step upload and analysis process
   * Combines uploadFile + analyzeUploadedFile
   */
  async uploadAndAnalyzeFileV2(input: FileUploadInput): Promise<AnalysisReport> {
    console.log('🚀 Starting 2-step file upload and analysis...');
    
    try {
      // Step 1: Upload file
      const uploadResult = await this.uploadFile(input.file);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'File upload failed');
      }

      // Step 2: Analyze file
      const analysisResult = await this.analyzeUploadedFile(
        uploadResult.fileId,
        input.analysisOptions
      );

      return analysisResult;
    } catch (error) {
      console.error('❌ Upload and analysis process failed:', error);
      throw error;
    }
  }

  /**
   * Helper: Convert File to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  }

  // ==================== LEGACY FILE UPLOAD METHOD ====================
  
  /**
   * @deprecated Use uploadAndAnalyzeFileV2 instead for Vercel deployment
   * This method still works for local development with multipart upload support
   */
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
          files {
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
          total
          limit
          offset
          hasMore
        }
      }
    `;

    const variables = { limit, offset };
    const response = await this.makeRequest<{ listFileUploads: { files: FileUpload[]; total: number; limit: number; offset: number; hasMore: boolean } }>(query, variables);
    console.log('📊 Files loaded:', {
      count: response.listFileUploads.files.length,
      total: response.listFileUploads.total,
      limit: response.listFileUploads.limit,
      offset: response.listFileUploads.offset,
      hasMore: response.listFileUploads.hasMore
    });
    return response.listFileUploads.files;
  }

  async getUsers(options: {
    companyId?: string;
    pagination?: {
      limit?: number;
      offset?: number;
      search?: string;
    };
  } = {}): Promise<ManagementUserList> {
    const { companyId, pagination } = options;

    const selectionSet = `
      success
      message
      errors
      data {
        total
        hasMore
        users {
          id
          email
          firstName
          lastName
          role
          companyId
          isActive
          emailVerified
          lastLoginAt
          createdAt
          updatedAt
        }
      }
    `;

    const query = companyId
      ? `
        query UsersByCompany($companyId: ID!, $pagination: PaginationInput) {
          usersByCompany(companyId: $companyId, pagination: $pagination) {
            ${selectionSet}
          }
        }
      `
      : `
        query Users($pagination: PaginationInput) {
          users(pagination: $pagination) {
            ${selectionSet}
          }
        }
      `;

    const variables: Record<string, unknown> = {};
    const paginationInput: Record<string, unknown> = {};

    const effectiveLimit = pagination?.limit ?? 50;
    if (typeof effectiveLimit === 'number') {
      paginationInput.limit = effectiveLimit;
    }

    if (typeof pagination?.offset === 'number') {
      paginationInput.offset = pagination.offset;
    }

    if (pagination?.search) {
      paginationInput.search = pagination.search;
    }

    if (Object.keys(paginationInput).length > 0) {
      variables.pagination = paginationInput;
    }

    if (companyId) {
      variables.companyId = companyId;
    }

    let payload: ManagementUserListResponse | undefined;

    if (companyId) {
      const response = await this.makeRequest<{ usersByCompany: ManagementUserListResponse }>(query, variables);
      payload = response.usersByCompany;
    } else {
      const response = await this.makeRequest<{ users: ManagementUserListResponse }>(query, variables);
      payload = response.users;
    }

    if (!payload?.success || !payload.data) {
      const errorMessage = payload?.message || 'Failed to fetch users.';
      console.error('❌ GraphQL users query failed:', payload?.errors || errorMessage);
      throw new Error(errorMessage);
    }

    return {
      users: payload.data.users ?? [],
      total: payload.data.total ?? payload.data.users?.length ?? 0,
      hasMore: payload.data.hasMore ?? false,
    };
  }

  // Fetch overview/dashboard data (KPIs, revenue series, categories, performance, recent activities, insights)
  // This endpoint may not exist on all backends; callers should handle errors and fall back to local mocks.
  async getOverview(): Promise<any> {
    const query = `
      query GetOverview {
        getOverviewPublic {
          kpis {
            id
            title
            value
            change
            trend
            target
            progress
          }
          revenueData {
            month
            revenue
            orders
            users
            profit
          }
          categoryData {
            name
            value
            revenue
            color
          }
          performanceMetrics {
            metric
            value
            target
            status
          }
          recentActivities {
            id
            user
            action
            details
            timestamp
            type
            status
          }
          topInsights {
            id
            title
            description
            impact
            category
            confidence
          }
        }
      }
    `;

    const response = await this.makeRequest<{ getOverviewPublic: any }>(query);
    return response.getOverviewPublic;
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

  async downloadFile(fileId: string, fileName: string): Promise<void> {
    try {
      // Get REST API endpoint for download
      let downloadEndpoint: string;
      if (this.endpoint.includes('/api/graphql')) {
        // Vercel: replace /api/graphql with /api/files/:id/download
        downloadEndpoint = this.endpoint.replace('/api/graphql', `/api/files/${fileId}/download`);
      } else {
        // Localhost: replace /graphql with /api/files/:id/download
        downloadEndpoint = this.endpoint.replace('/graphql', `/api/files/${fileId}/download`);
      }

      console.log('📥 Downloading file from:', downloadEndpoint);
      console.log('📥 File ID:', fileId);
      console.log('📥 File Name:', fileName);

      const token = localStorage.getItem('accessToken');
      console.log('📥 Has Auth Token:', !!token);
      
      const response = await fetch(downloadEndpoint, {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      console.log('📥 Download Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Array.from(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        console.error('❌ Download failed:', errorText);
        throw new Error(`Download failed: ${response.status} - ${errorText}`);
      }

      // Get blob from response
      const blob = await response.blob();
      console.log('📦 Blob created:', { size: blob.size, type: blob.type });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ File downloaded successfully:', fileName);
    } catch (error) {
      console.error('❌ File download failed:', error);
      throw error;
    }
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