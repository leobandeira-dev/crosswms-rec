
import React from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  const getColorClass = () => {
    switch (color) {
      case 'blue': return 'border-l-cross-blue';
      case 'gray': return 'border-l-cross-gray';
      case 'green': return 'border-l-cross-success';
      case 'amber': return 'border-l-cross-warning';
      case 'red': return 'border-l-cross-error';
      default: return 'border-l-cross-blue';
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
      navigate(`${navigateTo}?${searchParams.toString()}`);
    }
  };

  return (
    <div 
      className={`card-dashboard border-l-4 ${getColorClass()} ${navigateTo ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={navigateTo ? handleClick : undefined}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-heading mt-1">{value}</h3>
          
          {trend && (
            <p className={`text-xs flex items-center mt-2 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              <span className="text-gray-500 ml-1">vs. último período</span>
            </p>
          )}
        </div>
        
        <div className="p-2 rounded-lg bg-gray-50">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
