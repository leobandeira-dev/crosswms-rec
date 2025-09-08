
import React from 'react';
import { useEmpresaLogo } from '@/hooks/useEmpresaLogo';
import { useAuth } from '@/hooks/useAuth';

interface EmpresaLogoProps {
  className?: string;
  fallbackText?: string;
}

const EmpresaLogo: React.FC<EmpresaLogoProps> = ({ 
  className = "max-h-8 object-contain", 
  fallbackText = "EMPRESA" 
}) => {
  const { user } = useAuth();
  const { logoUrl, isLoading } = useEmpresaLogo(user?.empresa_id);

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse rounded`}>
        <div className="h-full w-16 bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt="Logo da Empresa" 
        className={className}
        onError={(e) => {
          console.warn('Erro ao carregar logo da empresa:', logoUrl);
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  // Fallback quando não há logo
  return (
    <div className={`${className} flex items-center justify-center bg-gray-100 border rounded px-2`}>
      <span className="text-xs font-bold text-gray-600">{fallbackText}</span>
    </div>
  );
};

export default EmpresaLogo;
