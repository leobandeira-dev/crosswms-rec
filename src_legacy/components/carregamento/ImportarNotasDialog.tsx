
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Package, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useOrdemCarregamento } from '@/hooks/carregamento';
import { NotaFiscal } from '@/hooks/carregamento/types';
import DataTable from '@/components/common/DataTable';

interface ImportarNotasDialogProps {
  ordemId: string;
  onImportComplete: () => void;
}

const ImportarNotasDialog: React.FC<ImportarNotasDialogProps> = ({ ordemId, onImportComplete }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotas, setSelectedNotas] = useState<string[]>([]);
  const [filteredNotas, setFilteredNotas] = useState<NotaFiscal[]>([]);

  const { 
    notasFiscaisDisponiveis,
    fetchNotasFiscaisDisponiveis,
    importarNotasFiscais,
    isLoading 
  } = useOrdemCarregamento();

  useEffect(() => {
    if (open) {
      fetchNotasFiscaisDisponiveis();
    }
  }, [open, fetchNotasFiscaisDisponiveis]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = notasFiscaisDisponiveis.filter(nota =>
        nota.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nota.remetente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nota.cliente.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNotas(filtered);
    } else {
      setFilteredNotas(notasFiscaisDisponiveis);
    }
  }, [searchTerm, notasFiscaisDisponiveis]);

  const handleSelectNota = (notaId: string) => {
    setSelectedNotas(prev => 
      prev.includes(notaId) 
        ? prev.filter(id => id !== notaId)
        : [...prev, notaId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotas.length === filteredNotas.length) {
      setSelectedNotas([]);
    } else {
      setSelectedNotas(filteredNotas.map(nota => nota.id));
    }
  };

  const handleImport = async () => {
    if (selectedNotas.length === 0) {
      toast({
        title: "Nenhuma nota selecionada",
        description: "Selecione pelo menos uma nota fiscal para importar.",
        variant: "destructive",
      });
      return;
    }

    await importarNotasFiscais(ordemId, selectedNotas);
    setSelectedNotas([]);
    setOpen(false);
    onImportComplete();
  };

  const columns = [
    {
      header: '',
      accessor: 'select',
      cell: (row: NotaFiscal) => (
        <Checkbox
          checked={selectedNotas.includes(row.id)}
          onCheckedChange={() => handleSelectNota(row.id)}
        />
      )
    },
    { header: 'Número', accessor: 'numero' },
    { header: 'Remetente', accessor: 'remetente' },
    { header: 'Cliente', accessor: 'cliente' },
    { header: 'Data Emissão', accessor: 'dataEmissao' },
    { 
      header: 'Valor', 
      accessor: 'valor',
      cell: (row: NotaFiscal) => `R$ ${row.valor.toFixed(2)}`
    },
    { 
      header: 'Peso', 
      accessor: 'pesoBruto',
      cell: (row: NotaFiscal) => `${row.pesoBruto} kg`
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-cross-blue text-white hover:bg-cross-blue/90">
          <Package className="h-4 w-4 mr-2" />
          Importar Notas Fiscais
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 text-cross-blue" size={20} />
            Importar Notas Fiscais para OC {ordemId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar por número, remetente ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedNotas.length === filteredNotas.length && filteredNotas.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <Label>Selecionar Todas ({filteredNotas.length})</Label>
            </div>
            <span className="text-sm text-gray-600">
              {selectedNotas.length} de {filteredNotas.length} selecionadas
            </span>
          </div>

          <DataTable
            columns={columns}
            data={filteredNotas}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleImport}
              disabled={selectedNotas.length === 0 || isLoading}
              className="bg-cross-blue hover:bg-cross-blue/90"
            >
              Importar {selectedNotas.length} {selectedNotas.length === 1 ? 'Nota' : 'Notas'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportarNotasDialog;
