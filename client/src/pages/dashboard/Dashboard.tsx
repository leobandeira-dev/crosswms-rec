
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import MainLayout from '../../components/layout/MainLayout';
import DateRangeSelector from '../../components/dashboard/DateRangeSelector';
import ConfigurableDashboard from '../../components/dashboard/ConfigurableDashboard';
import { InlineHelp, QuickHelp } from '@/components/help/InlineHelp';
import { useLocation } from 'wouter';

const Dashboard = () => {
  const [, setLocation] = useLocation();
  
  // Initialize with the last 30 days as the default date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  // Quick help suggestions for dashboard
  const quickHelpSuggestions = [
    {
      title: "Personalizar Widgets",
      description: "Configure seu dashboard com os widgets mais importantes para seu trabalho diário",
      action: () => {
        // Trigger edit mode in ConfigurableDashboard
        console.log('Activating widget customization mode');
      }
    },
    {
      title: "Entrada de Notas Fiscais",
      description: "Acesse rapidamente o módulo para processar novas NFes",
      action: () => setLocation('/armazenagem/notas-fiscais-entrada')
    },
    {
      title: "Nova Ordem de Carga",
      description: "Crie uma nova ordem de carregamento para suas operações",
      action: () => setLocation('/coletas/nova-ordem')
    },
    {
      title: "Relatórios de Performance",
      description: "Visualize métricas e KPIs do seu sistema logístico",
      action: () => setLocation('/relatorios')
    }
  ];

  return (
    <MainLayout title="Dashboard">
      {/* Sistema de Ajuda Contextual para Dashboard */}
      <div className="mb-6">
        <InlineHelp
          title="Centro de Controle CrossWMS"
          description="Monitore todas as operações logísticas em tempo real e acesse rapidamente as funcionalidades principais"
          videoUrl="https://www.youtube.com/watch?v=demo-dashboard-overview"
          duration="Tutorial"
          tips={[
            "Personalize widgets arrastando e redimensionando conforme sua necessidade",
            "Use os filtros de data para análises específicas de período",
            "Widgets são atualizados automaticamente em intervalos configuráveis",
            "Acesse qualquer módulo diretamente através das sugestões rápidas"
          ]}
          variant="compact"
          defaultOpen={false}
        />
      </div>

      {/* Date Range Selector */}
      <DateRangeSelector dateRange={dateRange} onDateRangeChange={setDateRange} />
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Dashboard Area */}
        <div className="xl:col-span-3">
          <ConfigurableDashboard className="flex-1" />
        </div>
        
        {/* Sidebar with Quick Help */}
        <div className="space-y-6">
          <QuickHelp suggestions={quickHelpSuggestions} />
          
          {/* Additional contextual tips */}
          <InlineHelp
            title="Dica: Atalhos do Teclado"
            description="Use atalhos para navegação mais rápida"
            tips={[
              "Ctrl + N: Nova ordem de carga",
              "Ctrl + F: Buscar NFe",
              "Ctrl + D: Dashboard",
              "Ctrl + R: Relatórios"
            ]}
            variant="tip"
            dismissible={true}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
