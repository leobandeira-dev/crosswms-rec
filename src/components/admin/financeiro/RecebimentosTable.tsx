
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Edit, MoreHorizontal, FileText, Send, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock data for demonstration
const mockRecebimentos = [
  {
    id: '1',
    cliente: 'Empresa ABC Ltda',
    recibo: 'REC-1001',
    dataVencimento: '15/06/2023',
    valor: 1250.00,
    formaPagamento: 'Boleto',
    status: 'pendente',
  },
  {
    id: '2',
    cliente: 'Distribuidora XYZ S.A.',
    recibo: 'REC-1002',
    dataVencimento: '10/06/2023',
    valor: 3750.50,
    formaPagamento: 'PIX',
    status: 'pago',
    dataPagamento: '09/06/2023',
  },
  {
    id: '3',
    cliente: 'Transportes Rápidos Ltda',
    recibo: 'REC-1003',
    dataVencimento: '05/06/2023',
    valor: 980.25,
    formaPagamento: 'Boleto',
    status: 'atrasado',
  },
];

type RecebimentosTableProps = {
  status: string;
  searchTerm: string;
  onEdit: (id: string) => void;
};

export const RecebimentosTable = ({ status, searchTerm, onEdit }: RecebimentosTableProps) => {
  // Filter based on status and search term
  const filteredRecebimentos = mockRecebimentos.filter(recebimento => {
    // Filter by status
    if (status !== 'todos' && status !== recebimento.status) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !recebimento.cliente.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !recebimento.recibo.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleMarcarComoPago = (recebimento: any) => {
    toast({
      title: "Pagamento registrado",
      description: `O recebimento ${recebimento.recibo} foi marcado como pago.`,
    });
  };

  const handleEnviarLembrete = (recebimento: any) => {
    toast({
      title: "Lembrete enviado",
      description: `Um lembrete de pagamento foi enviado para ${recebimento.cliente}.`,
    });
  };

  const handleVisualizarRecibo = (recebimento: any) => {
    toast({
      title: "Visualizar recibo",
      description: `Visualizando recibo ${recebimento.recibo}.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline">Pendente</Badge>;
      case 'pago':
        return <Badge variant="default" className="bg-green-600">Pago</Badge>;
      case 'atrasado':
        return <Badge variant="destructive">Atrasado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Recibo</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Forma Pagamento</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredRecebimentos.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              Nenhum recebimento encontrado.
            </TableCell>
          </TableRow>
        ) : (
          filteredRecebimentos.map((recebimento) => (
            <TableRow key={recebimento.id}>
              <TableCell className="font-medium">{recebimento.cliente}</TableCell>
              <TableCell>{recebimento.recibo}</TableCell>
              <TableCell>{recebimento.dataVencimento}</TableCell>
              <TableCell>R$ {recebimento.valor.toFixed(2)}</TableCell>
              <TableCell>{recebimento.formaPagamento}</TableCell>
              <TableCell>{getStatusBadge(recebimento.status)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(recebimento.id)}>
                      <Edit className="h-4 w-4 mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleVisualizarRecibo(recebimento)}>
                      <FileText className="h-4 w-4 mr-2" /> Visualizar Recibo
                    </DropdownMenuItem>
                    {recebimento.status !== 'pago' && (
                      <>
                        <DropdownMenuItem onClick={() => handleMarcarComoPago(recebimento)}>
                          <CheckCircle className="h-4 w-4 mr-2" /> Marcar como Pago
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEnviarLembrete(recebimento)}>
                          <Send className="h-4 w-4 mr-2" /> Enviar Lembrete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
