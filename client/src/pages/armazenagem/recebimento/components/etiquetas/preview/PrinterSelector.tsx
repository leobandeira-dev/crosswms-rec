
import React from 'react';

const PrinterSelector: React.FC = () => {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Impressoras Disponíveis</h3>
      <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2">
        <option value="">Selecionar impressora</option>
        <option value="zebra">Zebra ZT410</option>
        <option value="datamax">Datamax E-4205</option>
        <option value="brother">Brother QL-820NWB</option>
      </select>
    </div>
  );
};

export default PrinterSelector;
