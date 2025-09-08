
import React from 'react';
import KPICard from '../../../components/dashboard/KPICard';

const KPICardsSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <KPICard 
        title="Tempo Médio Aprovação" 
        value="1,2" 
        unit="dias"
        trend={{ value: 10, positive: true }}
        navigateTo="/coletas/aprovacoes"
        filterParams={{ status: "pending", sort: "oldest" }}
      />
      <KPICard 
        title="Tempo Médio Coleta" 
        value="1,5" 
        unit="dias"
        trend={{ value: 5, positive: true }}
        navigateTo="/coletas/alocacao"
        filterParams={{ type: "pending" }}
      />
      <KPICard 
        title="Tempo Médio em Galpão" 
        value="2,1" 
        unit="dias"
        trend={{ value: 3, positive: false }}
        navigateTo="/armazenagem"
        filterParams={{ storage: "active" }}
      />
      <KPICard 
        title="Atrasos em Entregas" 
        value="8%" 
        unit=""
        trend={{ value: 2, positive: true }}
        navigateTo="/motoristas/cargas"
        filterParams={{ status: "delayed" }}
      />
    </div>
  );
};

export default KPICardsSection;
