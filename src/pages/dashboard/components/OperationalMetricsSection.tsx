
import React from 'react';
import ChartCard from '../../../components/dashboard/ChartCard';
import { 
  coletasNaoEfetuadas, 
  tempoNotasSemEmbarque,
  collectRequestsChart,
  driverPerformanceChart 
} from '../data/dashboardData';

const OperationalMetricsSection = () => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard 
          title="Coletas Não Efetuadas" 
          data={coletasNaoEfetuadas} 
          color="#EF4444"
          navigateTo="/coletas/alocacao"
          filterParams={{ status: "failed" }}
        />
        <ChartCard 
          title="Notas Fiscais Sem Embarque" 
          data={tempoNotasSemEmbarque} 
          color="#F59E0B"
          navigateTo="/armazenagem/recebimento/notas"
          filterParams={{ status: "without_shipment" }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard 
          title="Solicitações de Coleta (Últimos 7 dias)" 
          data={collectRequestsChart} 
          color="#0098DA"
          navigateTo="/coletas/solicitacoes"
          filterParams={{ period: "7d" }}
        />
        <ChartCard 
          title="Desempenho de Motoristas" 
          data={driverPerformanceChart} 
          color="#2D363F"
          navigateTo="/motoristas/cadastro"
          filterParams={{ sort: "performance" }}
        />
      </div>
    </>
  );
};

export default OperationalMetricsSection;
