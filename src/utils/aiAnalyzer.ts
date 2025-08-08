import { AnalysisResult, KeyMetric, ChartVisualization, TableVisualization } from '../types/analysis';

// Simulated AI analysis - in production, this would call your AI service
export const analyzeFile = async (file: File): Promise<AnalysisResult> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

  const fileName = file.name.toLowerCase();
  const isInvoice = fileName.includes('invoice') || fileName.includes('factura') || fileName.includes('bill');
  const isSales = fileName.includes('sales') || fileName.includes('revenue') || fileName.includes('ventas');
  
  // Generate realistic analysis based on file type
  if (isInvoice || fileName.includes('pdf')) {
    return generateInvoiceAnalysis(file);
  } else if (isSales || fileName.includes('csv')) {
    return generateSalesAnalysis(file);
  } else {
    return generateGeneralAnalysis(file);
  }
};

const generateInvoiceAnalysis = (file: File): AnalysisResult => {
  const totalAmount = 2397.53;
  const itemCount = 15;
  const taxAmount = 397.53;
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    fileName: file.name,
    fileType: 'invoice',
    analysisType: 'invoice',
    insights: {
      summary: `Invoice analysis reveals a total amount of €${totalAmount.toFixed(2)} across ${itemCount} line items. The document shows a well-structured billing format with detailed product information and tax calculations.`,
      keyMetrics: [
        {
          label: 'Total Amount',
          value: `€${totalAmount.toFixed(2)}`,
          icon: 'Euro',
          color: 'bg-green-500'
        },
        {
          label: 'Line Items',
          value: itemCount,
          icon: 'FileText',
          color: 'bg-blue-500'
        },
        {
          label: 'Tax Amount',
          value: `€${taxAmount.toFixed(2)}`,
          icon: 'Calculator',
          color: 'bg-purple-500'
        },
        {
          label: 'Net Amount',
          value: `€${(totalAmount - taxAmount).toFixed(2)}`,
          icon: 'TrendingUp',
          color: 'bg-orange-500'
        }
      ],
      trends: [
        {
          category: 'Invoice Value',
          direction: 'up',
          percentage: 12.5,
          description: 'Above average invoice amount'
        },
        {
          category: 'Item Diversity',
          direction: 'up',
          percentage: 8.3,
          description: 'Good product variety'
        }
      ],
      recommendations: [
        'Consider bulk discounts for high-value orders',
        'Implement automated invoice processing',
        'Track payment terms compliance',
        'Monitor product performance trends'
      ]
    },
    visualizations: {
      charts: [
        {
          id: 'invoice-breakdown',
          type: 'pie',
          title: 'Invoice Amount Breakdown',
          description: 'Distribution of costs across different categories',
          data: [
            { name: 'Products', value: 1800, color: '#3B82F6' },
            { name: 'Services', value: 200, color: '#10B981' },
            { name: 'Tax', value: 397.53, color: '#F59E0B' }
          ],
          config: { colors: ['#3B82F6', '#10B981', '#F59E0B'] }
        },
        {
          id: 'item-values',
          type: 'bar',
          title: 'Top Items by Value',
          description: 'Highest value items in the invoice',
          data: [
            { name: 'Premium Service', value: 447.50 },
            { name: 'Consulting', value: 397.32 },
            { name: 'Software License', value: 324.75 },
            { name: 'Support Package', value: 267.45 },
            { name: 'Training', value: 198.20 }
          ],
          config: { xAxis: 'name', yAxis: 'value' }
        }
      ],
      tables: [
        {
          id: 'invoice-items',
          title: 'Invoice Line Items',
          description: 'Detailed breakdown of all items',
          headers: ['Item Code', 'Description', 'Quantity', 'Unit Price', 'Total'],
          rows: [
            ['TEST01', 'Premium Service Package', '1.00', '€447.50', '€447.50'],
            ['TEST02', 'Consulting Hours', '8.00', '€49.67', '€397.32'],
            ['TEST03', 'Software License', '1.00', '€324.75', '€324.75'],
            ['TEST04', 'Support Package', '1.00', '€267.45', '€267.45'],
            ['TEST05', 'Training Session', '2.00', '€99.10', '€198.20']
          ],
          summary: {
            totalRows: 15,
            keyInsights: [
              'Services represent 65% of total value',
              'Average item value: €159.84',
              'Highest margin item: Premium Service Package'
            ]
          }
        }
      ]
    },
    confidence: 94,
    processingTime: 3200,
    createdAt: new Date().toISOString()
  };
};

const generateSalesAnalysis = (file: File): AnalysisResult => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    fileName: file.name,
    fileType: 'sales',
    analysisType: 'sales',
    insights: {
      summary: 'Sales data analysis shows strong performance with consistent growth trends across multiple product categories and regions.',
      keyMetrics: [
        {
          label: 'Total Revenue',
          value: '$1,234,567',
          change: 15.3,
          changeType: 'increase',
          icon: 'DollarSign',
          color: 'bg-green-500'
        },
        {
          label: 'Units Sold',
          value: '45,678',
          change: 8.7,
          changeType: 'increase',
          icon: 'Package',
          color: 'bg-blue-500'
        },
        {
          label: 'Avg Order Value',
          value: '$127.45',
          change: 6.2,
          changeType: 'increase',
          icon: 'TrendingUp',
          color: 'bg-purple-500'
        },
        {
          label: 'Conversion Rate',
          value: '3.45%',
          change: -2.1,
          changeType: 'decrease',
          icon: 'Target',
          color: 'bg-orange-500'
        }
      ],
      trends: [
        {
          category: 'Revenue Growth',
          direction: 'up',
          percentage: 15.3,
          description: 'Strong quarterly performance'
        },
        {
          category: 'Customer Acquisition',
          direction: 'up',
          percentage: 12.8,
          description: 'New customer growth accelerating'
        },
        {
          category: 'Market Share',
          direction: 'stable',
          percentage: 2.1,
          description: 'Maintaining competitive position'
        }
      ],
      recommendations: [
        'Focus on improving conversion rates',
        'Expand high-performing product lines',
        'Invest in customer retention programs',
        'Optimize pricing strategy for premium products'
      ]
    },
    visualizations: {
      charts: [
        {
          id: 'revenue-trend',
          type: 'line',
          title: 'Revenue Trend Analysis',
          description: 'Monthly revenue performance over the past year',
          data: [
            { month: 'Jan', revenue: 85000, units: 680 },
            { month: 'Feb', revenue: 92000, units: 720 },
            { month: 'Mar', revenue: 78000, units: 620 },
            { month: 'Apr', revenue: 95000, units: 750 },
            { month: 'May', revenue: 110000, units: 880 },
            { month: 'Jun', revenue: 125000, units: 980 }
          ],
          config: { xAxis: 'month', yAxis: 'revenue' }
        },
        {
          id: 'category-performance',
          type: 'bar',
          title: 'Category Performance',
          description: 'Sales performance by product category',
          data: [
            { category: 'Electronics', sales: 450000, margin: 25 },
            { category: 'Clothing', sales: 320000, margin: 45 },
            { category: 'Home & Garden', sales: 280000, margin: 35 },
            { category: 'Sports', sales: 184567, margin: 30 }
          ],
          config: { xAxis: 'category', yAxis: 'sales' }
        }
      ],
      tables: [
        {
          id: 'top-products',
          title: 'Top Performing Products',
          description: 'Best selling products by revenue and units',
          headers: ['Product', 'Category', 'Revenue', 'Units Sold', 'Avg Price'],
          rows: [
            ['Wireless Headphones', 'Electronics', '$125,000', '2,500', '$50.00'],
            ['Running Shoes', 'Sports', '$98,000', '1,400', '$70.00'],
            ['Smart Watch', 'Electronics', '$87,500', '875', '$100.00'],
            ['Yoga Mat', 'Sports', '$45,000', '1,500', '$30.00'],
            ['Coffee Maker', 'Home & Garden', '$67,500', '450', '$150.00']
          ],
          summary: {
            totalRows: 156,
            keyInsights: [
              'Electronics category leads in revenue',
              'Sports products have highest volume',
              'Premium items show strong margins'
            ]
          }
        }
      ]
    },
    confidence: 96,
    processingTime: 2800,
    createdAt: new Date().toISOString()
  };
};

const generateGeneralAnalysis = (file: File): AnalysisResult => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    fileName: file.name,
    fileType: 'general',
    analysisType: 'general',
    insights: {
      summary: 'General data analysis completed. The file contains structured information with identifiable patterns and trends suitable for business intelligence insights.',
      keyMetrics: [
        {
          label: 'Data Points',
          value: '1,247',
          icon: 'Database',
          color: 'bg-blue-500'
        },
        {
          label: 'Categories',
          value: '8',
          icon: 'Grid',
          color: 'bg-green-500'
        },
        {
          label: 'Quality Score',
          value: '92%',
          icon: 'CheckCircle',
          color: 'bg-purple-500'
        },
        {
          label: 'Completeness',
          value: '87%',
          icon: 'PieChart',
          color: 'bg-orange-500'
        }
      ],
      trends: [
        {
          category: 'Data Quality',
          direction: 'up',
          percentage: 92,
          description: 'High data integrity detected'
        },
        {
          category: 'Pattern Recognition',
          direction: 'up',
          percentage: 78,
          description: 'Clear patterns identified'
        }
      ],
      recommendations: [
        'Consider data enrichment for missing fields',
        'Implement regular data quality checks',
        'Explore advanced analytics opportunities',
        'Set up automated reporting workflows'
      ]
    },
    visualizations: {
      charts: [
        {
          id: 'data-distribution',
          type: 'pie',
          title: 'Data Distribution',
          description: 'Distribution of data across different categories',
          data: [
            { name: 'Category A', value: 35 },
            { name: 'Category B', value: 28 },
            { name: 'Category C', value: 18 },
            { name: 'Category D', value: 12 },
            { name: 'Other', value: 7 }
          ],
          config: { colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] }
        }
      ],
      tables: [
        {
          id: 'data-summary',
          title: 'Data Summary',
          description: 'Overview of analyzed data structure',
          headers: ['Field', 'Type', 'Count', 'Completeness'],
          rows: [
            ['ID', 'Numeric', '1,247', '100%'],
            ['Name', 'Text', '1,247', '98%'],
            ['Category', 'Text', '1,247', '95%'],
            ['Value', 'Numeric', '1,247', '87%'],
            ['Date', 'Date', '1,247', '92%']
          ],
          summary: {
            totalRows: 8,
            keyInsights: [
              'All records have unique identifiers',
              'Text fields show high completeness',
              'Numeric data needs validation'
            ]
          }
        }
      ]
    },
    confidence: 89,
    processingTime: 2100,
    createdAt: new Date().toISOString()
  };
};