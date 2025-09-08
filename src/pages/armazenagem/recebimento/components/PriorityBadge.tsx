
import React from 'react';
import { Badge } from '@/components/ui/badge';

export const priorityConfig = {
  'normal': { color: 'bg-gray-100 text-gray-800', text: 'Normal' },
  'prioridade': { color: 'bg-yellow-100 text-yellow-800', text: 'Prioridade' },
  'expressa': { color: 'bg-red-100 text-red-800', text: 'Expressa' },
  'bloqueada': { color: 'bg-gray-100 text-gray-800 line-through', text: 'Bloqueada' }
};

interface PriorityBadgeProps {
  priority: string;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig['normal'];

  return (
    <Badge variant="outline" className={`${config.color}`}>{config.text}</Badge>
  );
};

export default PriorityBadge;
