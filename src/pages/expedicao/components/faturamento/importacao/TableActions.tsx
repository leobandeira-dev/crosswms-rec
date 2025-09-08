
import React from 'react';
import { Button } from '@/components/ui/button';

interface TableActionsProps {
  notasCount: number;
  onClearAll: () => void;
  onImportNotas: () => void;
}

const TableActions: React.FC<TableActionsProps> = ({ notasCount, onClearAll, onImportNotas }) => {
  if (notasCount === 0) return null;

  return (
    <div className="flex justify-end space-x-2 mt-4">
      <Button variant="outline" onClick={onClearAll}>Limpar Tudo</Button>
      <Button onClick={onImportNotas}>
        Importar {notasCount} {notasCount === 1 ? 'Nota' : 'Notas'}
      </Button>
    </div>
  );
};

export default TableActions;
