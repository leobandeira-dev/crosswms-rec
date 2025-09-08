
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import TimelineChart from '../../../components/dashboard/TimelineChart';
import { TrendingUp } from 'lucide-react';
import { tempoProcessoMedio } from '../data/dashboardData';

const ProcessTimelineSection = () => {
  return (
    <div className="grid grid-cols-1 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-muted-foreground" />
            Tempo Médio por Etapa do Processo (dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimelineChart 
            data={tempoProcessoMedio} 
            navigateTo="/coletas/aprovacoes"
            filterParams={{ view: "process" }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessTimelineSection;
