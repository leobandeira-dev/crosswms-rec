
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';

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
  const [, setLocation] = useLocation();
  
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
      className={`crosswms-card p-6 ${navigateTo ? 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105' : ''}`}
      onClick={handleClick}
    >
      <div className="bg-[#0098DA]/5 px-4 py-2 -mx-6 -mt-6 mb-4 border-b border-[#0098DA]/10">
        <p className="text-sm font-medium text-gray-600">{title}</p>
      </div>
      <div className="flex items-baseline mb-2">
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        {unit && <span className="ml-2 text-lg text-gray-500">{unit}</span>}
      </div>
      
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
  );
};

export default KPICard;
