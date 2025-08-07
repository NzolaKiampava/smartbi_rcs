import { MetricCard, ChartData, TableData } from '../types';

export const metricsData: MetricCard[] = [
  {
    id: '1',
    title: 'Total Revenue',
    value: '$1,234,567',
    change: 12.5,
    changeType: 'increase',
    icon: 'DollarSign',
    color: 'bg-blue-500'
  },
  {
    id: '2',
    title: 'Active Users',
    value: '45,678',
    change: 8.2,
    changeType: 'increase',
    icon: 'Users',
    color: 'bg-green-500'
  },
  {
    id: '3',
    title: 'Total Orders',
    value: '12,890',
    change: -3.1,
    changeType: 'decrease',
    icon: 'ShoppingCart',
    color: 'bg-purple-500'
  },
  {
    id: '4',
    title: 'Conversion Rate',
    value: '3.45%',
    change: 15.3,
    changeType: 'increase',
    icon: 'TrendingUp',
    color: 'bg-orange-500'
  }
];

export const revenueData: ChartData[] = [
  { name: 'Jan', value: 85000, revenue: 85000, users: 4200 },
  { name: 'Feb', value: 92000, revenue: 92000, users: 4500 },
  { name: 'Mar', value: 78000, revenue: 78000, users: 3900 },
  { name: 'Apr', value: 95000, revenue: 95000, users: 4800 },
  { name: 'May', value: 110000, revenue: 110000, users: 5200 },
  { name: 'Jun', value: 125000, revenue: 125000, users: 5800 },
  { name: 'Jul', value: 135000, revenue: 135000, users: 6100 },
  { name: 'Aug', value: 142000, revenue: 142000, users: 6400 },
  { name: 'Sep', value: 138000, revenue: 138000, users: 6200 },
  { name: 'Oct', value: 155000, revenue: 155000, users: 6900 },
  { name: 'Nov', value: 165000, revenue: 165000, users: 7200 },
  { name: 'Dec', value: 178000, revenue: 178000, users: 7600 }
];

export const categoryData: ChartData[] = [
  { name: 'E-commerce', value: 35 },
  { name: 'SaaS', value: 28 },
  { name: 'Consulting', value: 18 },
  { name: 'Digital Marketing', value: 12 },
  { name: 'Other', value: 7 }
];

export const tableData: TableData[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    status: 'active',
    revenue: 25000,
    lastActive: '2024-01-15'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    status: 'active',
    revenue: 18000,
    lastActive: '2024-01-14'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    status: 'pending',
    revenue: 32000,
    lastActive: '2024-01-13'
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    status: 'inactive',
    revenue: 15000,
    lastActive: '2024-01-10'
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david.brown@example.com',
    status: 'active',
    revenue: 28000,
    lastActive: '2024-01-15'
  }
];