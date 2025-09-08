
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SearchFilter from '@/components/common/SearchFilter';
import { Package, FileText } from 'lucide-react';
import ColetaTable from './ColetaTable';

interface ColetaContentProps {
  selectedTab: string;
  filterConfig: any[];
  recebimentosColeta: any[];
  onAcceptColeta: (coletaId: string) => void;
}

const ColetaContent: React.FC<ColetaContentProps> = ({
  selectedTab,
  filterConfig,
  recebimentosColeta,
  onAcceptColeta
}) => {
  const isTabPendentes = selectedTab === 'pendentes';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          {isTabPendentes ? (
            <Package className="mr-2 text-cross-blue" size={20} />
          ) : (
            <FileText className="mr-2 text-cross-blue" size={20} />
          )}
          {isTabPendentes 
            ? 'Coletas Aguardando Recebimento' 
            : 'Coletas Recebidas'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SearchFilter 
          placeholder="Buscar por cliente ou número de coleta..." 
          filters={filterConfig}
        />
        
        <ColetaTable 
          data={recebimentosColeta}
          filter={selectedTab}
          onAcceptColeta={onAcceptColeta}
        />
      </CardContent>
    </Card>
  );
};

export default ColetaContent;
