
import React from 'react';
import { FileText, Truck } from 'lucide-react';
import ModuleCard from './ModuleCard';

const CarregamentoTabContent: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <ModuleCard
        title="Ordem de Carregamento (OC)"
        description="Crie e gerencie ordens de carregamento"
        icon={FileText}
        link="/armazenagem/carregamento/ordem"
      />
      
      <ModuleCard
        title="Conferência de Carga"
        description="Confira volumes, notas fiscais ou etiquetas mãe"
        icon={FileText}
        link="/armazenagem/carregamento/conferencia"
      />
      
      <ModuleCard
        title="Endereçamento no Caminhão"
        description="Organize o layout de carregamento no caminhão"
        icon={Truck}
        link="/armazenagem/carregamento/enderecamento"
      />
      
      <ModuleCard
        title="Checklist com Registro Fotográfico"
        description="Documente o carregamento com checklist e fotos"
        icon={FileText}
        link="/armazenagem/carregamento/checklist"
      />
    </div>
  );
};

export default CarregamentoTabContent;
