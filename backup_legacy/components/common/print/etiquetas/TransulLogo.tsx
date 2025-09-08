
import React from 'react';

interface TransulLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

const TransulLogo: React.FC<TransulLogoProps> = ({ 
  className = "object-contain", 
  style 
}) => {
  return (
    <img 
      src="/lovable-uploads/13af900a-78bf-4738-9fba-8ecbd36e6021.png" 
      alt="Transul Transporte" 
      className={className}
      style={style}
      onError={(e) => {
        console.warn('Erro ao carregar logo da Transul');
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};

export default TransulLogo;
