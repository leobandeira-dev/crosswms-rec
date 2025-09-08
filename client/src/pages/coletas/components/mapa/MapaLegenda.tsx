
import React from 'react';

const MapaLegenda: React.FC = () => {
  return (
    <div className="mt-4 text-sm text-muted-foreground">
      <p>Clique nos botões acima para abrir a localização no Google Maps.</p>
      <p>
        <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span> Coletas entregues
        <span className="inline-block w-3 h-3 rounded-full bg-red-500 mx-1 ml-3"></span> Coletas com problema
        <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mx-1 ml-3"></span> Coletas pendentes
      </p>
    </div>
  );
};

export default MapaLegenda;
