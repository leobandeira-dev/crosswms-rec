
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { converterParaUF, separarCidadeEstado } from '@/utils/estadoUtils';

interface EmpresasListTableProps {
  empresas: any[];
  onViewDetails: (empresa: any) => void;
}

const EmpresasListTable: React.FC<EmpresasListTableProps> = ({
  empresas,
  onViewDetails,
}) => {
  // Helper function to render status badges
  const renderStatus = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-500">Ativo</Badge>;
      case 'inativo':
        return <Badge variant="destructive">Inativo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper function to format CNPJ
  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return 'N/A';
    // Formatar CNPJ se não estiver formatado
    if (cnpj.length === 14 && !cnpj.includes('.')) {
      return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
    }
    return cnpj;
  };

  // Helper function to get city from address
  const getCidade = (empresa: any) => {
    if (empresa.cidade) return empresa.cidade;
    if (empresa.endereco) {
      const localInfo = separarCidadeEstado(empresa.endereco);
      return localInfo?.cidade || '';
    }
    return '';
  };

  // Helper function to get state from address
  const getEstado = (empresa: any) => {
    if (empresa.uf) return empresa.uf;
    if (empresa.estado) return empresa.estado;
    if (empresa.endereco) {
      const localInfo = separarCidadeEstado(empresa.endereco);
      return localInfo?.estado || '';
    }
    return '';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>UF</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {empresas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                Nenhuma empresa encontrada
              </TableCell>
            </TableRow>
          ) : (
            empresas.map((empresa) => (
              <TableRow key={empresa.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onViewDetails(empresa)}>
                <TableCell className="font-medium">{empresa.nome || empresa.nome_fantasia || empresa.razao_social}</TableCell>
                <TableCell>{formatCNPJ(empresa.cnpj)}</TableCell>
                <TableCell>{getCidade(empresa)}</TableCell>
                <TableCell>{converterParaUF(getEstado(empresa))}</TableCell>
                <TableCell>{renderStatus(empresa.status)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(empresa);
                    }}
                    className="inline-flex items-center"
                  >
                    <Eye className="mr-1" size={16} />
                    Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmpresasListTable;
