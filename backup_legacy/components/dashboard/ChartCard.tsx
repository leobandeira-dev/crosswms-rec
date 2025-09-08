
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface ChartData {
  name: string;
  value: number;
}

interface ChartCardProps {
  title: string;
  data: ChartData[];
  color?: string;
  navigateTo?: string;
  filterParams?: Record<string, string>;
}

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  data,
  color = '#0098DA',
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
      className={navigateTo ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={navigateTo ? handleClick : undefined}
    >
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ChartCard;
