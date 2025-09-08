
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface TimelineData {
  name: string;
  value: number;
}

interface TimelineChartProps {
  data: TimelineData[];
  navigateTo?: string;
  filterParams?: Record<string, string>;
}

const TimelineChart: React.FC<TimelineChartProps> = ({ data, navigateTo, filterParams = {} }) => {
  // Calculate the maximum value for setting the domain
  const maxValue = Math.max(...data.map(item => item.value)) * 1.2;
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
    <div 
      className={`h-64 w-full ${navigateTo ? 'cursor-pointer' : ''}`} 
      onClick={navigateTo ? handleClick : undefined}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis 
            type="number" 
            axisLine={false}
            tickLine={false}
            domain={[0, maxValue]}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false}
            tickLine={false}
            width={150}
          />
          <Tooltip 
            formatter={(value) => [`${value} dias`, 'Tempo médio']}
            contentStyle={{ 
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          />
          <Bar 
            dataKey="value" 
            fill="#0098DA" 
            barSize={20} 
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimelineChart;
