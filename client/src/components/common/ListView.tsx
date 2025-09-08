import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, XCircle, Clock, MapPin, Weight, Calendar } from 'lucide-react';

interface ListViewProps {
  items: any[];
  onViewDetails: (item: any) => void;
  onApprove?: (item: any) => void;
  onReject?: (item: any) => void;
  showActions?: boolean;
}

export const ListView = ({ items, onViewDetails, onApprove, onReject, showActions = true }: ListViewProps) => {
  const getBadgeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'Média': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'Baixa': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'aprovado':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'rejeitado':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      case 'em_execucao':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Em Execução</Badge>;
      case 'finalizado':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Finalizado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Origem → Destino</TableHead>
            <TableHead>Peso/Volume</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead>Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{item.numero}</TableCell>
              <TableCell>{item.cliente}</TableCell>
              <TableCell>{item.tipo}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <span className="truncate max-w-20">{item.origem}</span>
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="truncate max-w-20">{item.destino}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    <Weight className="w-3 h-3" />
                    {item.pesoTotal}kg
                  </div>
                  <div className="text-muted-foreground">
                    {item.volumeTotal}m³
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.dataColeta || item.dataSubmissao).toLocaleDateString('pt-BR')}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getBadgeColor(item.prioridade)}>
                  {item.prioridade}
                </Badge>
              </TableCell>
              <TableCell>
                {getStatusBadge(item.status)}
              </TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(item)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    {item.status === 'pendente' && onApprove && onReject && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onApprove(item)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onReject(item)}
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};