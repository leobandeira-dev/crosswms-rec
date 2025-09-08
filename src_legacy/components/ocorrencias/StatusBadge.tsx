
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusConfig = {
    open: {
      label: 'Aberta',
      className: 'bg-red-500 hover:bg-red-600 text-white'
    },
    in_progress: {
      label: 'Em Andamento',
      className: 'bg-amber-500 hover:bg-amber-600 text-white'
    },
    resolved: {
      label: 'Resolvida',
      className: 'bg-green-500 hover:bg-green-600 text-white'
    },
    closed: {
      label: 'Fechada',
      className: 'bg-gray-500 hover:bg-gray-600 text-white'
    }
  };

  const { label, className: badgeClassName } = statusConfig[status];

  return (
    <Badge 
      variant="default"
      className={cn(badgeClassName, "font-normal", className)}
    >
      {label}
    </Badge>
  );
};

export default StatusBadge;
