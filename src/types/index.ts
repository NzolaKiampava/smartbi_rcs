export interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
  color: string;
}

export interface ChartData {
  name: string;
  value: number;
  revenue?: number;
  users?: number;
  orders?: number;
  conversion?: number;
}

export interface TableData {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  revenue: number;
  lastActive: string;
}