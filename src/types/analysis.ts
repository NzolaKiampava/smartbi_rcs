export interface AnalysisResult {
  id: string;
  fileName: string;
  fileType: string;
  analysisType: 'invoice' | 'sales' | 'financial' | 'general';
  insights: {
    summary: string;
    keyMetrics: KeyMetric[];
    trends: Trend[];
    recommendations: string[];
  };
  visualizations: {
    charts: ChartVisualization[];
    tables: TableVisualization[];
  };
  confidence: number;
  processingTime: number;
  createdAt: string;
}

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
  data: any[];
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