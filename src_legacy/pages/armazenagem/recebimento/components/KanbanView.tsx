
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { NotaFiscal } from './notasFiscaisData';

interface KanbanColumnProps {
  title: string;
  status: string[];
  notas: NotaFiscal[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, status, notas }) => {
  const columnNotas = notas.filter(nota => status.includes(nota.status));
  
  return (
    <div className="min-w-[300px] flex-1">
      <div className="bg-muted rounded-t-md p-2 font-medium text-sm">{title} ({columnNotas.length})</div>
      <div className="flex flex-col gap-2 p-2 bg-muted/30 rounded-b-md h-[calc(100%-2.5rem)] overflow-auto">
        {columnNotas.length > 0 ? (
          columnNotas.map(nota => (
            <Card key={nota.id} className="shadow-sm hover:shadow transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{nota.numero}</div>
                  <PriorityBadge priority={nota.prioridade} />
                </div>
                <div className="text-sm text-muted-foreground mb-2">{nota.emitente} → {nota.destinatario}</div>
                <div className="text-sm mb-2">{nota.valorTotal}</div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">{nota.dataEmissao}</div>
                  <StatusBadge status={nota.status} />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
            Nenhuma nota fiscal
          </div>
        )}
      </div>
    </div>
  );
};

interface KanbanViewProps {
  data: NotaFiscal[];
}

const KanbanView: React.FC<KanbanViewProps> = ({ data }) => {
  return (
    <div className="flex gap-4 overflow-auto pb-4" style={{ minHeight: "calc(100vh - 400px)" }}>
      <KanbanColumn title="Pendentes" status={["coleta_agendada", "no_armazem"]} notas={data} />
      <KanbanColumn title="Em Coleta" status={["coletando", "coletado"]} notas={data} />
      <KanbanColumn title="Em Trânsito" status={["em_transferencia", "em_rota_entrega"]} notas={data} />
      <KanbanColumn title="Finalizadas" status={["entregue", "indenizada"]} notas={data} />
      <KanbanColumn title="Problemas" status={["extraviada", "avariada", "sinistrada", "bloqueada"]} notas={data} />
    </div>
  );
};

export default KanbanView;
