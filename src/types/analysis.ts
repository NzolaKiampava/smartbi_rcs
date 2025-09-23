// Updated to match backend GraphQL schema
export interface AnalysisResult {
  id: string;
  fileUploadId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  title: string;
  summary: string;
  executionTime?: number;
  insights: Insight[];
  recommendations: string[];
  dataQuality?: DataQuality;
  visualizations: Visualization[];
  rawAnalysis?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  error?: string;
  fileUpload?: FileUpload;
}

export interface FileUpload {
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
}

export interface Insight {
  id: string;
  reportId: string;
  type: InsightType;
  title: string;
  description: string;
  value?: string;
  confidence?: number;
  importance?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type InsightType = 
  | 'DATA_PATTERN'
  | 'REVENUE_TREND'
  | 'TABLE_STRUCTURE'
  | 'PERFORMANCE_METRIC'
  | 'ANOMALY_DETECTION'
  | 'RECOMMENDATION'
  | 'SUMMARY'
  | 'CORRELATION'
  | 'STATISTICAL'
  | 'BUSINESS_INSIGHT';

export interface DataQuality {
  score: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  issues: DataQualityIssue[];
}

export interface DataQualityIssue {
  type: string;
  description: string;
  severity: string;
  count: number;
  examples: string[];
}

export interface Visualization {
  id: string;
  type: string;
  title: string;
  description?: string;
  data: Record<string, unknown>;
  config?: Record<string, unknown>;
}

// Legacy interfaces for backward compatibility
export interface KeyMetric {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
}

export interface Trend {
  category: string;
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  description: string;
}

export interface ChartVisualization {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  description: string;
  data: Record<string, unknown>[];
  config: {
    xAxis?: string;
    yAxis?: string;
    colors?: string[];
  };
}

export interface TableVisualization {
  id: string;
  title: string;
  description: string;
  headers: string[];
  rows: (string | number)[][];
  summary?: {
    totalRows: number;
    keyInsights: string[];
  };
}