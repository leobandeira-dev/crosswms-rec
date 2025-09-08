import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, XCircle, Clock, MapPin, Weight, Calendar } from 'lucide-react';

interface KanbanViewProps {
  items: any[];
  onViewDetails: (item: any) => void;
  onApprove?: (item: any) => void;
  onReject?: (item: any) => void;
  showActions?: boolean;
}

export const KanbanView = ({ items, onViewDetails, onApprove, onReject, showActions = true }: KanbanViewProps) => {
  const getBadgeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'Média': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'Baixa': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  // Group items by status
  const groupedItems = items.reduce((acc, item) => {
    const status = item.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const columns = [
    { key: 'pendente', title: 'Pendente', icon: Clock, color: 'border-orange-200' },
    { key: 'aprovado', title: 'Aprovado', icon: CheckCircle, color: 'border-green-200' },
    { key: 'rejeitado', title: 'Rejeitado', icon: XCircle, color: 'border-red-200' },
    { key: 'em_execucao', title: 'Em Execução', icon: Clock, color: 'border-blue-200' },
    { key: 'finalizado', title: 'Finalizado', icon: CheckCircle, color: 'border-green-200' },
  ];

  const KanbanCard = ({ item }: { item: any }) => (
    <Card className="hover:shadow-md transition-shadow duration-200 mb-3">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-semibold">{item.numero}</CardTitle>
            <p className="text-xs text-muted-foreground">{item.cliente}</p>
          </div>
          <Badge className={`${getBadgeColor(item.prioridade)} text-xs`}>
            {item.prioridade}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-blue-500" />
            <span className="truncate">{item.origem}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-green-500" />
            <span className="truncate">{item.destino}</span>
          </div>
          <div className="flex items-center gap-1">
            <Weight className="w-3 h-3 text-gray-500" />
            <span>{item.pesoTotal}kg • {item.volumeTotal}m³</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-purple-500" />
            <span>{new Date(item.dataColeta || item.dataSubmissao).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-1 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails(item)}
              className="flex-1 h-7 text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              Ver
            </Button>
            
            {item.status === 'pendente' && onApprove && onReject && (
              <>
                <Button 
                  size="sm" 
                  onClick={() => onApprove(item)}
                  className="bg-green-600 hover:bg-green-700 h-7 px-2"
                >
                  <CheckCircle className="w-3 h-3" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onReject(item)}
                  className="h-7 px-2"
                >
                  <XCircle className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {columns.map((column) => {
        const columnItems = groupedItems[column.key] || [];
        const Icon = column.icon;
        
        return (
          <div key={column.key} className={`border-2 rounded-lg p-4 ${column.color} bg-muted/20`}>
            <div className="flex items-center gap-2 mb-4">
              <Icon className="w-4 h-4" />
              <h3 className="font-semibold text-sm">{column.title}</h3>
              <Badge variant="outline" className="ml-auto">
                {columnItems.length}
              </Badge>
            </div>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {columnItems.map((item) => (
                <KanbanCard key={item.id} item={item} />
              ))}
              
              {columnItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Nenhum item</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};