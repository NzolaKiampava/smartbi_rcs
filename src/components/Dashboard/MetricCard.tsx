import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart } from 'lucide-react';
import { MetricCard as MetricCardType } from '../../types';

interface MetricCardProps {
  metric: MetricCardType;
}

const iconMap = {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp
};

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const Icon = iconMap[metric.icon as keyof typeof iconMap] || TrendingUp;
  const isPositive = metric.changeType === 'increase';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`${metric.color} p-3 rounded-lg`}>
            <Icon size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
          </div>
        </div>
        
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
          isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{Math.abs(metric.change)}%</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            {isPositive ? '+' : ''}{metric.change}%
          </span>
          {' '}from last month
        </p>
      </div>
    </div>
  );
};

export default MetricCard;