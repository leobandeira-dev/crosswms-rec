import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Truck, Building, Package, Crown } from 'lucide-react';

interface ProfileBadgeProps {
  userType?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const ProfileBadge: React.FC<ProfileBadgeProps> = ({ 
  userType, 
  size = 'md', 
  showIcon = true 
}) => {
  const getProfileConfig = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'super_admin':
        return {
          label: 'Super Admin',
          color: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white',
          icon: Crown,
          description: 'Administrador do Sistema'
        };
      case 'transportador':
        return {
          label: 'Transportador',
          color: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
          icon: Truck,
          description: 'Operador Logístico'
        };
      case 'cliente':
        return {
          label: 'Cliente',
          color: 'bg-gradient-to-r from-green-600 to-green-700 text-white',
          icon: Building,
          description: 'Empresa Cliente'
        };
      case 'fornecedor':
        return {
          label: 'Fornecedor',
          color: 'bg-gradient-to-r from-orange-600 to-orange-700 text-white',
          icon: Package,
          description: 'Empresa Fornecedora'
        };
      default:
        return {
          label: 'Usuário',
          color: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white',
          icon: Shield,
          description: 'Usuário do Sistema'
        };
    }
  };

  const config = getProfileConfig(userType);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <Badge 
      className={`${config.color} ${sizeClasses[size]} font-medium shadow-sm hover:shadow-md transition-all duration-200 border-0`}
      title={config.description}
    >
      {showIcon && <Icon size={iconSizes[size]} className="mr-1.5" />}
      {config.label}
    </Badge>
  );
};