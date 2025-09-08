import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusType = 
  | 'pendente' 
  | 'em_transito' 
  | 'entregue' 
  | 'disponivel' 
  | 'ocupado' 
  | 'manutencao' 
  | 'urgente' 
  | 'normal' 
  | 'baixo' 
  | 'critico' 
  | 'aprovado' 
  | 'rejeitado' 
  | 'processando'
  | 'gerada'
  | 'impressa'
  | 'expedida'
  | 'recebida'
  | 'armazenada'
  | 'produto_perigoso'
  | 'fragil'
  | 'perecivel';

export interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dot' | 'badge' | 'pill';
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, {
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon?: string;
  pulse?: boolean;
}> = {
  // Status de Transporte
  pendente: {
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    icon: '⏳',
    pulse: true
  },
  em_transito: {
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    icon: '🚛',
    pulse: true
  },
  entregue: {
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    icon: '✅'
  },
  
  // Status de Área/Espaço
  disponivel: {
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    icon: '✅'
  },
  ocupado: {
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    icon: '🔒'
  },
  manutencao: {
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    icon: '🔧',
    pulse: true
  },
  
  // Prioridades
  urgente: {
    color: 'bg-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    textColor: 'text-red-900',
    icon: '🚨',
    pulse: true
  },
  normal: {
    color: 'bg-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-800',
    icon: '📋'
  },
  baixo: {
    color: 'bg-green-400',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    icon: '📝'
  },
  critico: {
    color: 'bg-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-400',
    textColor: 'text-red-900',
    icon: '⚠️',
    pulse: true
  },
  
  // Status de Aprovação
  aprovado: {
    color: 'bg-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    icon: '✅'
  },
  rejeitado: {
    color: 'bg-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    icon: '❌'
  },
  processando: {
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    icon: '⚙️',
    pulse: true
  },
  
  // Status de Etiquetas
  gerada: {
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    icon: '📄'
  },
  impressa: {
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    icon: '🖨️'
  },
  expedida: {
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-800',
    icon: '📦'
  },
  recebida: {
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    icon: '📥'
  },
  armazenada: {
    color: 'bg-cyan-500',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-800',
    icon: '🏪'
  },
  
  // Tipos de Produto
  produto_perigoso: {
    color: 'bg-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-400',
    textColor: 'text-red-900',
    icon: '⚠️',
    pulse: true
  },
  fragil: {
    color: 'bg-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    textColor: 'text-yellow-800',
    icon: '🔍'
  },
  perecivel: {
    color: 'bg-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    textColor: 'text-orange-800',
    icon: '🧊',
    pulse: true
  }
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
  variant = 'badge',
  showIcon = true,
  className
}) => {
  const config = statusConfig[status];
  const displayLabel = label || status.replace('_', ' ').toUpperCase();

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  if (variant === 'dot') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div 
          className={cn(
            'rounded-full',
            config.color,
            dotSizeClasses[size],
            config.pulse && 'animate-pulse'
          )}
        />
        {label && (
          <span className={cn('text-sm font-medium', config.textColor)}>
            {displayLabel}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <div 
        className={cn(
          'inline-flex items-center gap-1 rounded-full border',
          config.bgColor,
          config.borderColor,
          config.textColor,
          sizeClasses[size],
          config.pulse && 'animate-pulse',
          className
        )}
      >
        {showIcon && config.icon && (
          <span className="text-xs">{config.icon}</span>
        )}
        <span className="font-medium">{displayLabel}</span>
      </div>
    );
  }

  // Default badge variant
  return (
    <Badge 
      className={cn(
        'inline-flex items-center gap-1 border',
        config.bgColor,
        config.borderColor,
        config.textColor,
        sizeClasses[size],
        config.pulse && 'animate-pulse',
        className
      )}
      variant="outline"
    >
      {showIcon && config.icon && (
        <span className="text-xs">{config.icon}</span>
      )}
      <span className="font-medium">{displayLabel}</span>
    </Badge>
  );
};

export default StatusIndicator;