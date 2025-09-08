
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface KPICardProps {
  title: string;
  value: string;
  unit?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  navigateTo?: string;
  filterParams?: Record<string, string>;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  unit = '', 
  trend,
  navigateTo,
  filterParams = {}
}) => {
  const navigate = useNavigate();
  
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
    <Card 
      className={`overflow-hidden ${navigateTo ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
        <div className="p-4">
          <div className="flex items-baseline">
            <h3 className="text-2xl font-bold">{value}</h3>
            {unit && <span className="ml-1 text-sm text-gray-500">{unit}</span>}
          </div>
          
          {trend && (
            <p className={`text-xs flex items-center mt-2 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              <span className="text-gray-500 ml-1">vs. último período</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;
