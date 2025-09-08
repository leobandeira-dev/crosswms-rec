
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { EnderecoCompleto } from '@/types/enderecamento.cadastro.types';
import StatusBadge from '@/components/common/StatusBadge';

interface EnderecosCompletosTabProps {
  enderecos: EnderecoCompleto[];
}

const EnderecosCompletosTab: React.FC<EnderecosCompletosTabProps> = ({ enderecos }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEnderecos, setFilteredEnderecos] = useState<EnderecoCompleto[]>(enderecos);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredEnderecos(enderecos);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = enderecos.filter(endereco => 
      endereco.endereco.toLowerCase().includes(lowerSearch) ||
      endereco.filial.toLowerCase().includes(lowerSearch) ||
      endereco.area.toLowerCase().includes(lowerSearch) ||
      endereco.rota.toLowerCase().includes(lowerSearch)
    );
    
    setFilteredEnderecos(filtered);
  };

  React.useEffect(() => {
    setFilteredEnderecos(enderecos);
  }, [enderecos]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Endereços Cadastrados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <Input
            placeholder="Buscar endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 mr-2"
          />
          <Button onClick={handleSearch} variant="outline">
            <Search size={16} />
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endereço</TableHead>
                <TableHead>Filial</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Rota</TableHead>
                <TableHead>Rua</TableHead>
                <TableHead>Prédio</TableHead>
                <TableHead>Bloco</TableHead>
                <TableHead>Andar</TableHead>
                <TableHead>Apto</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnderecos.map((endereco) => (
                <TableRow key={endereco.id}>
                  <TableCell className="font-medium">{endereco.endereco}</TableCell>
                  <TableCell>{endereco.filial}</TableCell>
                  <TableCell>{endereco.area}</TableCell>
                  <TableCell>{endereco.rota}</TableCell>
                  <TableCell>{endereco.rua}</TableCell>
                  <TableCell>{endereco.predio}</TableCell>
                  <TableCell>{endereco.bloco}</TableCell>
                  <TableCell>{endereco.andar}</TableCell>
                  <TableCell>{endereco.apartamento}</TableCell>
                  <TableCell>{endereco.capacidade}</TableCell>
                  <TableCell>{endereco.tipoEstoque}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={endereco.disponivel ? 'success' : 'error'}
                      text={endereco.disponivel ? 'Disponível' : 'Ocupado'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnderecosCompletosTab;
