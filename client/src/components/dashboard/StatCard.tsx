
import React from 'react';
import { useLocation } from 'wouter';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  color?: 'blue' | 'gray' | 'green' | 'amber' | 'red';
  navigateTo?: string;
  filterParams?: Record<string, string>;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  color = 'blue',
  navigateTo,
  filterParams = {}
}) => {
  const [, setLocation] = useLocation();
  
  const getColorClass = () => {
    switch (color) {
      case 'blue': return 'border-l-[#0098DA]';
      case 'gray': return 'border-l-gray-400';
      case 'green': return 'border-l-green-500';
      case 'amber': return 'border-l-amber-500';
      case 'red': return 'border-l-red-500';
      default: return 'border-l-[#0098DA]';
    }
  };

  const getIconBgClass = () => {
    switch (color) {
      case 'blue': return 'bg-[#0098DA]/10 text-[#0098DA]';
      case 'gray': return 'bg-gray-100 text-gray-600';
      case 'green': return 'bg-green-100 text-green-600';
      case 'amber': return 'bg-amber-100 text-amber-600';
      case 'red': return 'bg-red-100 text-red-600';
      default: return 'bg-[#0098DA]/10 text-[#0098DA]';
    }
  };

  const handleClick = () => {
    if (navigateTo) {
      // Create URL search params for filtering
      const searchParams = new URLSearchParams();
      
      // Add all filter parameters
      Object.entries(filterParams).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      
      // Navigate with query params
      setLocation(`${navigateTo}?${searchParams.toString()}`);
    }
  };

  return (
    <div 
      className={`crosswms-card p-6 border-l-4 ${getColorClass()} ${navigateTo ? 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105' : ''}`}
      onClick={navigateTo ? handleClick : undefined}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">{value}</h3>
          
          {trend && (
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              trend.positive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {trend.positive ? '↗' : '↘'} {Math.abs(trend.value)}%
              <span className="text-gray-500 ml-1">vs. período anterior</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl ${getIconBgClass()}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
