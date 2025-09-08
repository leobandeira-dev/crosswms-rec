
import React from 'react';
import { Loader2 } from 'lucide-react';

const MapLoading: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mt-2 text-sm text-muted-foreground">Carregando mapa...</span>
      </div>
    </div>
  );
};

export default MapLoading;
