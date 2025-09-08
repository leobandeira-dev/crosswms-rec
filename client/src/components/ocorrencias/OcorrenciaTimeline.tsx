
import React from 'react';
import { Ocorrencia } from '@/types/ocorrencias.types';
import { Card, CardContent } from '@/components/ui/card';

interface OcorrenciaTimelineProps {
  ocorrencia: Ocorrencia;
}

const OcorrenciaTimeline: React.FC<OcorrenciaTimelineProps> = ({ ocorrencia }) => {
  // Este é um componente de placeholder até que possamos implementar corretamente
  // a visualização da linha do tempo usando os dados reais
  
  // Simulando eventos na timeline
  const timelineEvents = [
    { 
      id: 1, 
      type: 'creation', 
      description: 'Ocorrência criada', 
      timestamp: ocorrencia.createdAt, 
      user: 'Sistema'
    },
    {
      id: 2,
      type: 'status_change',
      description: 'Status alterado para Em Andamento',
      timestamp: new Date(new Date(ocorrencia.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
      user: 'João Silva'
    }
  ];
  
  if (ocorrencia.resolvedAt) {
    timelineEvents.push({
      id: 3,
      type: 'resolution',
      description: 'Ocorrência resolvida',
      timestamp: ocorrencia.resolvedAt,
      user: 'Maria Oliveira'
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Histórico da Ocorrência</h3>
          
          <div className="space-y-4">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="flex items-start space-x-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  {index < timelineEvents.length - 1 && (
                    <div className="absolute top-3 left-1.5 -ml-px h-full w-0.5 bg-gray-200" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">{event.description}</h4>
                    <span className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500">Por: {event.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OcorrenciaTimeline;
