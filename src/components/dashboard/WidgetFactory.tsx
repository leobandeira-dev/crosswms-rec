import React from 'react';
import { WidgetType, WidgetData } from '@/types/dashboard';
import StatCardsSection from '@/pages/dashboard/components/StatCardsSection';
import KPICardsSection from '@/pages/dashboard/components/KPICardsSection';
import ProcessTimelineSection from '@/pages/dashboard/components/ProcessTimelineSection';
import PendingApprovalSection from '@/pages/dashboard/components/PendingApprovalSection';
import OperationalMetricsSection from '@/pages/dashboard/components/OperationalMetricsSection';
import RecentCollectRequestsSection from '@/pages/dashboard/components/RecentCollectRequestsSection';
import LogisticsOverviewSection from '@/pages/dashboard/components/LogisticsOverviewSection';
import WarehouseStatusSection from '@/pages/dashboard/components/WarehouseStatusSection';
import FleetManagementSection from '@/pages/dashboard/components/FleetManagementSection';
import GamificationSummarySection from '@/pages/dashboard/components/GamificationSummarySection';

interface WidgetFactoryProps {
  type: WidgetType;
  data?: WidgetData;
  settings?: Record<string, any>;
}

const WidgetFactory: React.FC<WidgetFactoryProps> = ({ type, data, settings }) => {
  switch (type) {
    case 'stat_card':
      return <StatCardsSection />;
    
    case 'kpi_chart':
      return <KPICardsSection />;
    
    case 'process_timeline':
      return <ProcessTimelineSection />;
    
    case 'pending_approvals':
      return <PendingApprovalSection />;
    
    case 'operational_metrics':
      return <OperationalMetricsSection />;
    
    case 'recent_activities':
      return <RecentCollectRequestsSection />;
    
    case 'logistics_overview':
      return <LogisticsOverviewSection />;
    
    case 'warehouse_status':
      return <WarehouseStatusSection />;
    
    case 'fleet_management':
      return <FleetManagementSection />;
    
    case 'gamification_summary':
      return <GamificationSummarySection />;
    
    default:
      return (
        <div className="p-4 text-center text-gray-500">
          Widget tipo "{type}" não implementado
        </div>
      );
  }
};

export default WidgetFactory;