
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high';
  className?: string;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  const priorityConfig = {
    low: {
      label: 'Baixa',
      className: 'bg-green-500 hover:bg-green-600'
    },
    medium: {
      label: 'Média',
      className: 'bg-amber-500 hover:bg-amber-600'
    },
    high: {
      label: 'Alta',
      className: 'bg-red-500 hover:bg-red-600'
    }
  };

  const { label, className: badgeClassName } = priorityConfig[priority];

  return (
    <Badge 
      className={cn(badgeClassName, "font-normal", className)}
    >
      {label}
    </Badge>
  );
};

export default PriorityBadge;
