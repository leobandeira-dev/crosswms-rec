import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, FileText, Package } from 'lucide-react';
import { NotaFiscal } from '../../../Faturamento';
import { notasFiscais } from '@/pages/armazenagem/recebimento/data/mockData';

interface ImportarNotasExistentesProps {
  onImportarNotas: (notas: Partial<NotaFiscal>[]) => void;
}

const ImportarNotasExistentes: React.FC<ImportarNotasExistentesProps> = ({ onImportarNotas }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotas, setFilteredNotas] = useState<any[]>([]);
  const [selectedNotas, setSelectedNotas] = useState<Record<string, boolean>>({});
  
  // Busca as notas fiscais do sistema (mock data por enquanto)
  useEffect(() => {
    // Em uma implementação real, você buscaria do banco de dados
    // Filtrar as notas com base no termo de busca
    const notas = notasFiscais.filter(nota => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        nota.id.toLowerCase().includes(searchLower) ||
        nota.fornecedor.toLowerCase().includes(searchLower) ||
        (nota.destinatarioRazaoSocial && nota.destinatarioRazaoSocial.toLowerCase().includes(searchLower))
      );
    });
    
    setFilteredNotas(notas);
  }, [searchTerm]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSelectNota = (id: string) => {
    setSelectedNotas(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const handleSelectAll = () => {
    const allSelected = filteredNotas.every(nota => selectedNotas[nota.id]);
    
    if (allSelected) {
      // Se todas estiverem selecionadas, desmarcar todas
      const newSelected: Record<string, boolean> = {};
      setSelectedNotas(newSelected);
    } else {
      // Senão, selecionar todas
      const newSelected: Record<string, boolean> = {};
      filteredNotas.forEach(nota => {
        newSelected[nota.id] = true;
      });
      setSelectedNotas(newSelected);
    }
  };
  
  const handleImportar = () => {
    // Filtrar somente as notas selecionadas
    const notasSelecionadas = filteredNotas.filter(nota => selectedNotas[nota.id]);
    
    // Converter para o formato esperado pelo componente de faturamento
    const notasParaImportar: Partial<NotaFiscal>[] = notasSelecionadas.map(nota => {
      return {
        data: new Date(),
        cliente: nota.destinatarioRazaoSocial || nota.fornecedor,
        remetente: nota.fornecedor || "",
        notaFiscal: nota.id,
        pedido: nota.numeroPedido || "",
        dataEmissao: nota.dataEmissao ? new Date(nota.dataEmissao) : new Date(),
        pesoNota: nota.pesoTotalBruto || nota.pesoTotal || 0,
        valorNF: parseFloat(nota.valor?.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0
      };
    });
    
    onImportarNotas(notasParaImportar);
    
    // Limpar seleções
    setSelectedNotas({});
  };
  
  const selectedCount = Object.values(selectedNotas).filter(Boolean).length;
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <Label htmlFor="searchNotas">Buscar Notas Fiscais</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="searchNotas"
              placeholder="Digite o número da nota, fornecedor ou destinatário..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Encontradas {filteredNotas.length} notas fiscais
          </p>
        </div>
      </div>
      
      {filteredNotas.length > 0 ? (
        <>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={filteredNotas.length > 0 && filteredNotas.every(nota => selectedNotas[nota.id])}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Número NF</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Data Emissão</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Peso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotas.map(nota => (
                  <TableRow 
                    key={nota.id}
                    className={selectedNotas[nota.id] ? "bg-muted/50" : ""}
                  >
                    <TableCell>
                      <Checkbox 
                        checked={!!selectedNotas[nota.id]}
                        onCheckedChange={() => handleSelectNota(nota.id)}
                      />
                    </TableCell>
                    <TableCell>{nota.id}</TableCell>
                    <TableCell>{nota.fornecedor}</TableCell>
                    <TableCell>{nota.destinatarioRazaoSocial || "-"}</TableCell>
                    <TableCell>{nota.dataEmissao || nota.data || "-"}</TableCell>
                    <TableCell>{nota.valor || "-"}</TableCell>
                    <TableCell>{(nota.pesoTotalBruto || nota.pesoTotal || "-") + " kg"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleImportar}
              disabled={selectedCount === 0}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Importar {selectedCount} {selectedCount === 1 ? 'Nota Selecionada' : 'Notas Selecionadas'}
            </Button>
          </div>
        </>
      ) : searchTerm ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
          <FileText className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Nenhuma nota fiscal encontrada com os termos de busca.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
          <Package className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Digite para buscar notas fiscais.</p>
        </div>
      )}
    </div>
  );
};

export default ImportarNotasExistentes;
