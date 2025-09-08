
import React from 'react';
import { Separator } from '@/components/ui/separator';

interface RotaInfoProps {
  showInfo: boolean;
  cargasCount: number;
}

const RotaInfo: React.FC<RotaInfoProps> = ({ showInfo, cargasCount }) => {
  if (!showInfo) return null;

  return (
    <div className="mt-4 p-3 bg-muted/30 rounded-md">
      <h3 className="text-sm font-medium mb-1">Informações da Rota</h3>
      <Separator className="my-2" />
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Cargas:</span> {cargasCount}
        </div>
        <div>
          <span className="text-muted-foreground">Tipo:</span> Rota otimizada
        </div>
      </div>
    </div>
  );
};

export default RotaInfo;
