// Shared types used by backend services in `backend files`
export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  JSON = 'JSON',
  HTML = 'HTML',
}

export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimetype?: string;
  encoding?: string;
  size: number;
  path?: string;
  fileType?: string;
  uploadedAt: string | Date;
  metadata?: Record<string, unknown>;
}

export interface Insight {
  id: string;
  reportId?: string;
  type: string;
  title: string;
  description: string;
  value?: string | number | null;
  confidence?: number | null;
  importance?: number;
  metadata?: Record<string, unknown>;
  createdAt: string | Date;
}

export interface DataQualityIssue {
  type: string;
  description: string;
  severity: string;
  count: number;
  examples: string[];
}

export interface DataQuality {
  score: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  issues: DataQualityIssue[];
}

export interface Visualization {
  id?: string;
  type: string;
  title: string;
  description?: string;
  data?: Record<string, unknown> | unknown[];
  config?: Record<string, unknown>;
}

export interface AnalysisReport {
  id: string;
  fileUploadId?: string;
  fileUpload: FileUpload;
  status: string;
  title: string;
  summary: string;
  executionTime?: number;
  insights: Insight[];
  recommendations: string[];
  dataQuality?: DataQuality;
  visualizations: Visualization[];
  extractedText?: string;
  rawAnalysis?: Record<string, unknown>;
  createdAt: string | Date;
  updatedAt: string | Date;
  error?: string;
}

export interface ReportExportInput {
  format: ReportFormat;
  includeVisualizations?: boolean;
  includeRawData?: boolean;
  customizations?: Record<string, unknown>;
}

export interface ReportExport {
  url: string;
  filename: string;
  format: ReportFormat;
  size: number;
  expiresAt: Date;
}
