
import React from 'react';
import { Package, Archive } from 'lucide-react';
import ModuleCard from './ModuleCard';

const MovimentacoesTabContent: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <ModuleCard
        title="Unitização de Paletes"
        description="Organize e unitize volumes em paletes"
        icon={Package}
        link="/armazenagem/movimentacoes/unitizacao"
      />
      
      <ModuleCard
        title="Cancelar Unitização"
        description="Desfaça unitizações e reorganize volumes"
        icon={Package}
        link="/armazenagem/movimentacoes/cancelar-unitizacao"
      />
      
      <ModuleCard
        title="Endereçamento de Volumes"
        description="Defina o endereçamento de volumes no armazém"
        icon={Archive}
        link="/armazenagem/movimentacoes/enderecamento"
      />
    </div>
  );
};

export default MovimentacoesTabContent;
