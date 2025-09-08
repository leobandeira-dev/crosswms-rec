import { useState, useEffect, useCallback } from 'react';
import { DashboardState, DashboardLayout, WidgetConfig, WidgetData } from '@/types/dashboard';

const defaultLayout: DashboardLayout = {
  id: 'default',
  name: 'Layout Padrão',
  isDefault: true,
  widgets: [
    {
      id: 'stat_cards',
      title: 'Estatísticas Gerais',
      type: 'stat_card',
      size: { minW: 2, maxW: 4, minH: 1, maxH: 2 },
      position: { x: 0, y: 0, w: 4, h: 1 },
      isVisible: true,
      refreshInterval: 30000
    },
    {
      id: 'kpi_charts',
      title: 'Indicadores de Performance',
      type: 'kpi_chart',
      size: { minW: 2, maxW: 4, minH: 2, maxH: 3 },
      position: { x: 0, y: 1, w: 2, h: 2 },
      isVisible: true,
      refreshInterval: 60000
    },
    {
      id: 'logistics_overview',
      title: 'Visão Geral Logística',
      type: 'logistics_overview',
      size: { minW: 2, maxW: 4, minH: 2, maxH: 3 },
      position: { x: 2, y: 1, w: 2, h: 2 },
      isVisible: true,
      refreshInterval: 60000
    },
    {
      id: 'warehouse_status',
      title: 'Status do Armazém',
      type: 'warehouse_status',
      size: { minW: 2, maxW: 3, minH: 2, maxH: 3 },
      position: { x: 0, y: 3, w: 2, h: 2 },
      isVisible: true,
      refreshInterval: 45000
    },
    {
      id: 'recent_activities',
      title: 'Atividades Recentes',
      type: 'recent_activities',
      size: { minW: 2, maxW: 3, minH: 2, maxH: 4 },
      position: { x: 2, y: 3, w: 2, h: 2 },
      isVisible: true,
      refreshInterval: 30000
    }
  ]
};

export const useDashboardState = () => {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    currentLayout: defaultLayout,
    availableLayouts: [defaultLayout],
    widgetData: {},
    isEditMode: false,
    isDragging: false
  });

  const updateWidgetPosition = useCallback((widgetId: string, position: any) => {
    setDashboardState(prev => ({
      ...prev,
      currentLayout: {
        ...prev.currentLayout,
        widgets: prev.currentLayout.widgets.map(widget =>
          widget.id === widgetId
            ? { ...widget, position: { ...widget.position, ...position } }
            : widget
        )
      }
    }));
  }, []);

  const updateWidgetVisibility = useCallback((widgetId: string, isVisible: boolean) => {
    setDashboardState(prev => ({
      ...prev,
      currentLayout: {
        ...prev.currentLayout,
        widgets: prev.currentLayout.widgets.map(widget =>
          widget.id === widgetId
            ? { ...widget, isVisible }
            : widget
        )
      }
    }));
  }, []);

  const addWidget = useCallback((widget: WidgetConfig) => {
    setDashboardState(prev => ({
      ...prev,
      currentLayout: {
        ...prev.currentLayout,
        widgets: [...prev.currentLayout.widgets, widget]
      }
    }));
  }, []);

  const removeWidget = useCallback((widgetId: string) => {
    setDashboardState(prev => ({
      ...prev,
      currentLayout: {
        ...prev.currentLayout,
        widgets: prev.currentLayout.widgets.filter(widget => widget.id !== widgetId)
      }
    }));
  }, []);

  const toggleEditMode = useCallback(() => {
    setDashboardState(prev => ({
      ...prev,
      isEditMode: !prev.isEditMode
    }));
  }, []);

  const setDragging = useCallback((isDragging: boolean) => {
    setDashboardState(prev => ({
      ...prev,
      isDragging
    }));
  }, []);

  const updateWidgetData = useCallback((widgetId: string, data: any, error?: string) => {
    setDashboardState(prev => ({
      ...prev,
      widgetData: {
        ...prev.widgetData,
        [widgetId]: {
          id: widgetId,
          data,
          lastUpdated: new Date(),
          isLoading: false,
          error
        }
      }
    }));
  }, []);

  const setWidgetLoading = useCallback((widgetId: string, isLoading: boolean) => {
    setDashboardState(prev => ({
      ...prev,
      widgetData: {
        ...prev.widgetData,
        [widgetId]: {
          ...prev.widgetData[widgetId],
          id: widgetId,
          isLoading,
          lastUpdated: prev.widgetData[widgetId]?.lastUpdated || new Date(),
          data: prev.widgetData[widgetId]?.data || null
        }
      }
    }));
  }, []);

  const saveLayout = useCallback(async (layoutName: string) => {
    try {
      // In a real app, this would save to backend
      const newLayout: DashboardLayout = {
        ...dashboardState.currentLayout,
        id: Date.now().toString(),
        name: layoutName,
        isDefault: false
      };

      setDashboardState(prev => ({
        ...prev,
        availableLayouts: [...prev.availableLayouts, newLayout]
      }));

      return newLayout;
    } catch (error) {
      console.error('Error saving layout:', error);
      throw error;
    }
  }, [dashboardState.currentLayout]);

  const loadLayout = useCallback((layoutId: string) => {
    const layout = dashboardState.availableLayouts.find(l => l.id === layoutId);
    if (layout) {
      setDashboardState(prev => ({
        ...prev,
        currentLayout: layout,
        isEditMode: false
      }));
    }
  }, [dashboardState.availableLayouts]);

  return {
    dashboardState,
    actions: {
      updateWidgetPosition,
      updateWidgetVisibility,
      addWidget,
      removeWidget,
      toggleEditMode,
      setDragging,
      updateWidgetData,
      setWidgetLoading,
      saveLayout,
      loadLayout
    }
  };
};