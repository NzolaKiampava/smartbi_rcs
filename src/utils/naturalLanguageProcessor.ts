import { NaturalLanguageQuery, QueryResult, QueryVisualization } from '../types/query';

// Simulated natural language processing - in production, this would call your NLP service
export const processNaturalLanguageQuery = async (input: string): Promise<NaturalLanguageQuery> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

  const queryId = Math.random().toString(36).substr(2, 9);
  const timestamp = new Date().toISOString();

  // Parse the natural language input and generate appropriate SQL/API calls
  const parsedQuery = parseQuery(input.toLowerCase());

  return {
    id: queryId,
    input,
    sqlQuery: parsedQuery.sql,
    apiEndpoint: parsedQuery.api,
    timestamp,
    status: 'completed',
    results: await generateMockResults(parsedQuery)
  };
};

const parseQuery = (input: string) => {
  // Detect query patterns and generate appropriate SQL
  if (input.includes('primavera') && input.includes('orders')) {
    if (input.includes('pending') && input.includes('days')) {
      return {
        sql: `SELECT 
  order_id,
  customer_name,
  order_date,
  status,
  total_amount,
  days_pending,
  priority
FROM primavera_orders 
WHERE status = 'pending' 
  AND DATEDIFF(CURRENT_DATE, order_date) > 5
ORDER BY days_pending DESC;`,
        api: '/api/primavera/orders?status=pending&days_pending_gt=5',
        type: 'orders_pending'
      };
    }
  }

  if (input.includes('sales') && input.includes('revenue')) {
    return {
      sql: `SELECT 
  DATE_FORMAT(sale_date, '%Y-%m') as month,
  SUM(amount) as total_revenue,
  COUNT(*) as total_orders,
  AVG(amount) as avg_order_value
FROM sales 
WHERE sale_date >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
ORDER BY month DESC;`,
      api: '/api/sales/revenue?period=12months&group_by=month',
      type: 'sales_revenue'
    };
  }

  if (input.includes('customers') && input.includes('active')) {
    return {
      sql: `SELECT 
  customer_id,
  customer_name,
  email,
  last_order_date,
  total_orders,
  total_spent,
  status
FROM customers 
WHERE status = 'active' 
  AND last_order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
ORDER BY total_spent DESC;`,
      api: '/api/customers?status=active&last_order_within=30days',
      type: 'customers_active'
    };
  }

  // Default generic query
  return {
    sql: `SELECT * FROM data_table 
WHERE created_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
ORDER BY created_date DESC
LIMIT 100;`,
    api: '/api/data?limit=100&sort=created_date_desc',
    type: 'generic'
  };
};

const generateMockResults = async (parsedQuery: any): Promise<QueryResult> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));

  switch (parsedQuery.type) {
    case 'orders_pending':
      return generatePendingOrdersResults();
    case 'sales_revenue':
      return generateSalesRevenueResults();
    case 'customers_active':
      return generateActiveCustomersResults();
    default:
      return generateGenericResults();
  }
};

const generatePendingOrdersResults = (): QueryResult => {
  const data = [
    { order_id: 'ORD-2024-001', customer_name: 'Acme Corp', order_date: '2024-01-10', status: 'pending', total_amount: 15750, days_pending: 8, priority: 'High' },
    { order_id: 'ORD-2024-002', customer_name: 'TechStart Ltd', order_date: '2024-01-12', status: 'pending', total_amount: 8900, days_pending: 6, priority: 'Medium' },
    { order_id: 'ORD-2024-003', customer_name: 'Global Industries', order_date: '2024-01-08', status: 'pending', total_amount: 23400, days_pending: 10, priority: 'High' },
    { order_id: 'ORD-2024-004', customer_name: 'StartupXYZ', order_date: '2024-01-14', status: 'pending', total_amount: 5200, days_pending: 4, priority: 'Low' },
    { order_id: 'ORD-2024-005', customer_name: 'Enterprise Solutions', order_date: '2024-01-09', status: 'pending', total_amount: 18600, days_pending: 9, priority: 'High' },
  ];

  const statusData = [
    { status: 'High Priority', count: 3, value: 3 },
    { status: 'Medium Priority', count: 1, value: 1 },
    { status: 'Low Priority', count: 1, value: 1 }
  ];

  return {
    data,
    totalRows: data.length,
    columns: [
      { key: 'order_id', label: 'Order ID', type: 'string', sortable: true, filterable: true },
      { key: 'customer_name', label: 'Customer', type: 'string', sortable: true, filterable: true },
      { key: 'order_date', label: 'Order Date', type: 'date', sortable: true, filterable: true },
      { key: 'status', label: 'Status', type: 'string', sortable: true, filterable: true },
      { key: 'total_amount', label: 'Amount', type: 'number', sortable: true, filterable: false },
      { key: 'days_pending', label: 'Days Pending', type: 'number', sortable: true, filterable: true },
      { key: 'priority', label: 'Priority', type: 'string', sortable: true, filterable: true }
    ],
    executionTime: 245,
    visualizations: [
      {
        id: 'status-chart',
        type: 'bar',
        title: 'Orders by Priority Level',
        description: 'Distribution of pending orders by priority',
        data: statusData,
        config: { xAxis: 'status', yAxis: 'count', colors: ['#EF4444', '#F59E0B', '#10B981'] }
      }
    ]
  };
};

const generateSalesRevenueResults = (): QueryResult => {
  const data = [
    { month: '2024-01', total_revenue: 125000, total_orders: 450, avg_order_value: 278 },
    { month: '2023-12', total_revenue: 118000, total_orders: 420, avg_order_value: 281 },
    { month: '2023-11', total_revenue: 132000, total_orders: 480, avg_order_value: 275 },
    { month: '2023-10', total_revenue: 145000, total_orders: 520, avg_order_value: 279 },
    { month: '2023-09', total_revenue: 138000, total_orders: 495, avg_order_value: 279 },
    { month: '2023-08', total_revenue: 142000, total_orders: 510, avg_order_value: 278 }
  ];

  return {
    data,
    totalRows: data.length,
    columns: [
      { key: 'month', label: 'Month', type: 'string', sortable: true, filterable: true },
      { key: 'total_revenue', label: 'Revenue', type: 'number', sortable: true, filterable: false },
      { key: 'total_orders', label: 'Orders', type: 'number', sortable: true, filterable: false },
      { key: 'avg_order_value', label: 'Avg Order Value', type: 'number', sortable: true, filterable: false }
    ],
    executionTime: 180,
    visualizations: [
      {
        id: 'revenue-trend',
        type: 'line',
        title: 'Revenue Trend Over Time',
        description: 'Monthly revenue performance',
        data,
        config: { xAxis: 'month', yAxis: 'total_revenue' }
      }
    ]
  };
};

const generateActiveCustomersResults = (): QueryResult => {
  const data = [
    { customer_id: 'CUST-001', customer_name: 'Acme Corp', email: 'contact@acme.com', last_order_date: '2024-01-15', total_orders: 24, total_spent: 45600, status: 'active' },
    { customer_id: 'CUST-002', customer_name: 'TechStart Ltd', email: 'info@techstart.com', last_order_date: '2024-01-14', total_orders: 18, total_spent: 32400, status: 'active' },
    { customer_id: 'CUST-003', customer_name: 'Global Industries', email: 'orders@global.com', last_order_date: '2024-01-13', total_orders: 31, total_spent: 67800, status: 'active' }
  ];

  return {
    data,
    totalRows: data.length,
    columns: [
      { key: 'customer_id', label: 'Customer ID', type: 'string', sortable: true, filterable: true },
      { key: 'customer_name', label: 'Name', type: 'string', sortable: true, filterable: true },
      { key: 'email', label: 'Email', type: 'string', sortable: false, filterable: true },
      { key: 'last_order_date', label: 'Last Order', type: 'date', sortable: true, filterable: true },
      { key: 'total_orders', label: 'Total Orders', type: 'number', sortable: true, filterable: false },
      { key: 'total_spent', label: 'Total Spent', type: 'number', sortable: true, filterable: false },
      { key: 'status', label: 'Status', type: 'string', sortable: true, filterable: true }
    ],
    executionTime: 156,
    visualizations: []
  };
};

const generateGenericResults = (): QueryResult => {
  const data = [
    { id: 1, name: 'Sample Data 1', value: 100, date: '2024-01-15', category: 'A' },
    { id: 2, name: 'Sample Data 2', value: 150, date: '2024-01-14', category: 'B' },
    { id: 3, name: 'Sample Data 3', value: 200, date: '2024-01-13', category: 'A' }
  ];

  return {
    data,
    totalRows: data.length,
    columns: [
      { key: 'id', label: 'ID', type: 'number', sortable: true, filterable: false },
      { key: 'name', label: 'Name', type: 'string', sortable: true, filterable: true },
      { key: 'value', label: 'Value', type: 'number', sortable: true, filterable: false },
      { key: 'date', label: 'Date', type: 'date', sortable: true, filterable: true },
      { key: 'category', label: 'Category', type: 'string', sortable: true, filterable: true }
    ],
    executionTime: 120,
    visualizations: []
  };
};