
import React from 'react';
import { Box, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ModuleCard from './ModuleCard';
import PendingReceipts from './PendingReceipts';

const RecebimentoTabContent: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ModuleCard
          title="Ordem de Recebimento"
          description="Crie ordens de recebimento de mercadorias com classificação de documentos"
          icon={Box}
          link="/armazenagem/recebimento/ordemrecebimento"
        />
        
        <ModuleCard
          title="Recebimento Entre Filiais"
          description="Processe transferências e recebimentos entre filiais da empresa"
          icon={Box}
          link="/armazenagem/recebimento/filiais"
        />
        
        <ModuleCard
          title="Entrada de Notas Fiscais"
          description="Registre e processe notas fiscais de entrada de mercadorias"
          icon={FileText}
          link="/armazenagem/recebimento/notas"
        />
        
        <ModuleCard
          title="Geração de Etiquetas"
          description="Gere etiquetas de identificação única para volumes"
          icon={FileText}
          link="/armazenagem/recebimento/etiquetas"
        />
      </div>
      
      <PendingReceipts />
    </>
  );
};

export default RecebimentoTabContent;
