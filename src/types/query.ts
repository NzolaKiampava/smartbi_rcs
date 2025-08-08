export interface NaturalLanguageQuery {
  id: string;
  input: string;
  sqlQuery: string;
  apiEndpoint?: string;
  timestamp: string;
  status: 'processing' | 'completed' | 'error';
  results?: QueryResult;
}

export interface QueryResult {
  data: any[];
  totalRows: number;
  columns: ColumnDefinition[];
  executionTime: number;
  visualizations: QueryVisualization[];
}

export interface ColumnDefinition {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sortable: boolean;
  filterable: boolean;
}

export interface QueryVisualization {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'table';
  title: string;
  description: string;
  data: any[];
  config: {
    xAxis?: string;
    yAxis?: string;
    groupBy?: string;
    colors?: string[];
  };
}

export interface QueryFilter {
  column: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: any;
}