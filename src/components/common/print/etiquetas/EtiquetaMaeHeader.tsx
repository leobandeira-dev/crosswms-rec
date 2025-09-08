
import React from 'react';

interface EtiquetaMaeHeaderProps {
  etiquetaMaeId?: string;
  descricao?: string;
}

const EtiquetaMaeHeader: React.FC<EtiquetaMaeHeaderProps> = ({ etiquetaMaeId, descricao }) => {
  return (
    <div className="mb-2 text-center bg-red-500 text-white p-1 rounded">
      <div className="font-bold text-lg">ETIQUETA MÃE</div>
      <div className="text-sm">ID: {etiquetaMaeId}</div>
      {descricao && <div className="text-sm">{descricao}</div>}
    </div>
  );
};

export default EtiquetaMaeHeader;
