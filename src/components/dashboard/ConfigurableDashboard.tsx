import React, { useEffect, useCallback } from 'react';
import { Layout } from 'react-grid-layout';
import { useDashboardState } from '@/hooks/useDashboardState';
import DashboardControls from './DashboardControls';
import DashboardGrid from './DashboardGrid';
import { WidgetType, WidgetConfig } from '@/types/dashboard';
import { useToast } from '@/hooks/use-toast';

interface ConfigurableDashboardProps {
  className?: string;
}

const ConfigurableDashboard: React.FC<ConfigurableDashboardProps> = ({ className }) => {
  const { dashboardState, actions } = useDashboardState();
  const { toast } = useToast();

  // Auto-refresh widget data
  useEffect(() => {
    const refreshWidget = async (widget: WidgetConfig) => {
      if (!widget.refreshInterval || widget.refreshInterval === 0) return;

      try {
        actions.setWidgetLoading(widget.id, true);
        
        // Simulate API call - in real app, this would fetch actual data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data based on widget type
        const mockData = generateMockData(widget.type);
        actions.updateWidgetData(widget.id, mockData);
      } catch (error) {
        actions.updateWidgetData(widget.id, null, error instanceof Error ? error.message : 'Unknown error');
      }
    };

    const intervals: NodeJS.Timeout[] = [];

    dashboardState.currentLayout.widgets.forEach(widget => {
      if (widget.isVisible && widget.refreshInterval) {
        // Initial load
        refreshWidget(widget);
        
        // Set up interval
        const interval = setInterval(() => refreshWidget(widget), widget.refreshInterval);
        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, []); // Remove dependencies to prevent infinite loop

  const handleLayoutChange = useCallback((layout: Layout[], layouts: { [key: string]: Layout[] }) => {
    layout.forEach(item => {
      actions.updateWidgetPosition(item.i, {
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h
      });
    });
  }, [actions]);

  const handleAddWidget = useCallback((widgetType: WidgetType) => {
    const newWidget: WidgetConfig = {
      id: `${widgetType}_${Date.now()}`,
      title: getWidgetTitle(widgetType),
      type: widgetType,
      size: { minW: 1, maxW: 4, minH: 1, maxH: 3 },
      position: { x: 0, y: 0, w: 2, h: 2 },
      isVisible: true,
      refreshInterval: 60000
    };

    actions.addWidget(newWidget);
    
    toast({
      title: "Widget Adicionado",
      description: `${newWidget.title} foi adicionado ao dashboard.`,
    });
  }, [actions, toast]);

  const handleSaveLayout = useCallback(async (name: string) => {
    try {
      await actions.saveLayout(name);
      toast({
        title: "Layout Salvo",
        description: `Layout "${name}" foi salvo com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o layout.",
        variant: "destructive",
      });
    }
  }, [actions, toast]);

  const handleRefreshAll = useCallback(async () => {
    const refreshPromises = dashboardState.currentLayout.widgets
      .filter(widget => widget.isVisible)
      .map(async widget => {
        actions.setWidgetLoading(widget.id, true);
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          const mockData = generateMockData(widget.type);
          actions.updateWidgetData(widget.id, mockData);
        } catch (error) {
          actions.updateWidgetData(widget.id, null, error instanceof Error ? error.message : 'Unknown error');
        }
      });

    await Promise.all(refreshPromises);
    
    toast({
      title: "Dashboard Atualizado",
      description: "Todos os widgets foram atualizados.",
    });
  }, [dashboardState.currentLayout.widgets, actions, toast]);

  const handleWidgetRemove = useCallback((widgetId: string) => {
    actions.removeWidget(widgetId);
    toast({
      title: "Widget Removido",
      description: "O widget foi removido do dashboard.",
    });
  }, [actions, toast]);

  const handleWidgetRefresh = useCallback(async (widgetId: string) => {
    const widget = dashboardState.currentLayout.widgets.find(w => w.id === widgetId);
    if (!widget) return;

    actions.setWidgetLoading(widgetId, true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockData = generateMockData(widget.type);
      actions.updateWidgetData(widgetId, mockData);
    } catch (error) {
      actions.updateWidgetData(widgetId, null, error instanceof Error ? error.message : 'Unknown error');
    }
  }, [dashboardState.currentLayout.widgets, actions]);

  const handleWidgetVisibilityToggle = useCallback((widgetId: string) => {
    const widget = dashboardState.currentLayout.widgets.find(w => w.id === widgetId);
    if (widget) {
      actions.updateWidgetVisibility(widgetId, !widget.isVisible);
    }
  }, [dashboardState.currentLayout.widgets, actions]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <DashboardControls
        isEditMode={dashboardState.isEditMode}
        currentLayout={dashboardState.currentLayout}
        availableLayouts={dashboardState.availableLayouts}
        onToggleEditMode={actions.toggleEditMode}
        onAddWidget={handleAddWidget}
        onSaveLayout={handleSaveLayout}
        onLoadLayout={actions.loadLayout}
        onRefreshAll={handleRefreshAll}
      />
      
      <div className="flex-1 overflow-auto">
        <DashboardGrid
          widgets={dashboardState.currentLayout.widgets.filter(w => w.isVisible)}
          widgetData={dashboardState.widgetData}
          isEditMode={dashboardState.isEditMode}
          onLayoutChange={handleLayoutChange}
          onWidgetRemove={handleWidgetRemove}
          onWidgetRefresh={handleWidgetRefresh}
          onWidgetVisibilityToggle={handleWidgetVisibilityToggle}
          className="p-4"
        />
      </div>
    </div>
  );
};

// Helper functions
const getWidgetTitle = (type: WidgetType): string => {
  const titles: Record<WidgetType, string> = {
    stat_card: 'Cartões de Estatística',
    kpi_chart: 'Gráficos KPI',
    process_timeline: 'Timeline de Processos',
    pending_approvals: 'Aprovações Pendentes',
    operational_metrics: 'Métricas Operacionais',
    recent_activities: 'Atividades Recentes',
    logistics_overview: 'Visão Geral Logística',
    warehouse_status: 'Status do Armazém',
    fleet_management: 'Gestão de Frota',
    gamification_summary: 'Gamificação'
  };
  return titles[type] || 'Widget';
};

const generateMockData = (type: WidgetType) => {
  // Generate realistic mock data based on widget type
  const baseData = {
    timestamp: new Date().toISOString(),
    status: 'success'
  };

  switch (type) {
    case 'stat_card':
      return {
        ...baseData,
        stats: [
          { label: 'Pedidos Hoje', value: 142, change: '+12%' },
          { label: 'Volume Total', value: '2.8m³', change: '+5%' },
          { label: 'Entregas', value: 89, change: '+8%' }
        ]
      };
    
    case 'kpi_chart':
      return {
        ...baseData,
        metrics: [
          { name: 'Eficiência', value: 87, target: 90 },
          { name: 'Qualidade', value: 94, target: 95 },
          { name: 'Pontualidade', value: 91, target: 88 }
        ]
      };
    
    default:
      return baseData;
  }
};

export default ConfigurableDashboard;