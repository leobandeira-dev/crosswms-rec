
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CargasTable from './CargasTable';

interface CargasFinalizadasCardProps {
  filteredCargas: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const CargasFinalizadasCard: React.FC<CargasFinalizadasCardProps> = ({
  filteredCargas,
  currentPage,
  setCurrentPage
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargas Finalizadas</CardTitle>
      </CardHeader>
      <CardContent>
        <CargasTable 
          cargas={filteredCargas}
          pagination={{
            totalPages: Math.max(1, Math.ceil(filteredCargas.length / 10)),
            currentPage: currentPage,
            onPageChange: setCurrentPage
          }}
        />
      </CardContent>
    </Card>
  );
};

export default CargasFinalizadasCard;
