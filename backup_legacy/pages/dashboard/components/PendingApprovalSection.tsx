
import React from 'react';
import ChartCard from '../../../components/dashboard/ChartCard';
import { tempoPendentesAprovacao, tempoColetaAposAprovacao } from '../data/dashboardData';

const PendingApprovalSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <ChartCard 
        title="Solicitações Pendentes de Aprovação" 
        data={tempoPendentesAprovacao} 
        color="#0098DA"
        navigateTo="/coletas/aprovacoes"
        filterParams={{ status: "pending" }}
      />
      <ChartCard 
        title="Tempo de Coleta Após Aprovação" 
        data={tempoColetaAposAprovacao} 
        color="#2D363F"
        navigateTo="/coletas/alocacao"
        filterParams={{ status: "approved", sort: "pending_collection" }}
      />
    </div>
  );
};

export default PendingApprovalSection;
