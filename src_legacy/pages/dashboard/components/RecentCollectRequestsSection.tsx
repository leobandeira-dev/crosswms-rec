
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import ChartCard from '../../../components/dashboard/ChartCard';
import { recentCollectRequests, atrasoEntregas } from '../data/dashboardData';

const RecentCollectRequestsSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Solicitações de Coleta Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                { header: 'ID', accessor: 'id' },
                { header: 'Cliente', accessor: 'cliente' },
                { header: 'Data', accessor: 'data' },
                { header: 'Origem', accessor: 'origem' },
                { header: 'Destino', accessor: 'destino' },
                { 
                  header: 'Status', 
                  accessor: 'status',
                  cell: (row) => {
                    const statusMap: any = {
                      'pending': { type: 'warning', text: 'Pendente' },
                      'approved': { type: 'success', text: 'Aprovado' },
                      'rejected': { type: 'error', text: 'Recusado' },
                    };
                    const status = statusMap[row.status];
                    return <StatusBadge status={status.type} text={status.text} />;
                  }
                }
              ]}
              data={recentCollectRequests}
              onRowClick={(row) => console.log('Row clicked:', row)}
            />
          </CardContent>
        </Card>
      </div>
      <div>
        <ChartCard 
          title="Atraso nas Entregas" 
          data={atrasoEntregas} 
          color="#EF4444"
          navigateTo="/motoristas/cargas"
          filterParams={{ status: "delayed" }}
        />
      </div>
    </div>
  );
};

export default RecentCollectRequestsSection;
