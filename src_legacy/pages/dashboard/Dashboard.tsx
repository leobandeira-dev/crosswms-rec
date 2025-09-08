
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import MainLayout from '../../components/layout/MainLayout';
import DateRangeSelector from '../../components/dashboard/DateRangeSelector';
import StatCardsSection from './components/StatCardsSection';
import KPICardsSection from './components/KPICardsSection';
import ProcessTimelineSection from './components/ProcessTimelineSection';
import PendingApprovalSection from './components/PendingApprovalSection';
import OperationalMetricsSection from './components/OperationalMetricsSection';
import RecentCollectRequestsSection from './components/RecentCollectRequestsSection';

const Dashboard = () => {
  // Initialize with the last 30 days as the default date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  return (
    <MainLayout title="Dashboard">
      {/* Date Range Selector */}
      <DateRangeSelector dateRange={dateRange} onDateRangeChange={setDateRange} />
      
      {/* Stat Cards Section */}
      <StatCardsSection />
      
      {/* KPI Cards Section */}
      <KPICardsSection />
      
      {/* Process Timeline Section */}
      <ProcessTimelineSection />
      
      {/* Pending Approval and Collection Time Section */}
      <PendingApprovalSection />
      
      {/* Operational Metrics Section */}
      <OperationalMetricsSection />
      
      {/* Recent Collect Requests Section */}
      <RecentCollectRequestsSection />
    </MainLayout>
  );
};

export default Dashboard;
