export interface WidgetConfig {
  id: string;
  title: string;
  type: WidgetType;
  size: WidgetSize;
  position: WidgetPosition;
  isVisible: boolean;
  refreshInterval?: number;
  settings?: Record<string, any>;
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetSize {
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
}

export type WidgetType = 
  | 'stat_card'
  | 'kpi_chart'
  | 'process_timeline'
  | 'pending_approvals'
  | 'operational_metrics'
  | 'recent_activities'
  | 'logistics_overview'
  | 'warehouse_status'
  | 'fleet_management'
  | 'gamification_summary';

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  isDefault: boolean;
  userId?: string;
}

export interface WidgetData {
  id: string;
  data: any;
  lastUpdated: Date;
  isLoading: boolean;
  error?: string;
}

export interface DashboardState {
  currentLayout: DashboardLayout;
  availableLayouts: DashboardLayout[];
  widgetData: Record<string, WidgetData>;
  isEditMode: boolean;
  isDragging: boolean;
}