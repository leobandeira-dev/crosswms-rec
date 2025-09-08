
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { NotaFiscal } from "@/hooks/carregamento/useOrdemCarregamento";
import { toast } from "@/hooks/use-toast";
import { Loader, Search, Filter, Eye, Play } from "lucide-react";

interface ImportarNotasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (notasIds: string[]) => void;
  notasFiscaisDisponiveis: NotaFiscal[];
  isLoading: boolean;
}

interface FiltrosNotas {
  termo: string;
  status: string;
  dataInicio: string;
  dataFim: string;
  valorMinimo: string;
  valorMaximo: string;
  fornecedor: string;
}

const ImportarNotasDialog: React.FC<ImportarNotasDialogProps> = ({
  open,
  onOpenChange,
  onImport,
  notasFiscaisDisponiveis,
  isLoading
}) => {
  const [selectedNotas, setSelectedNotas] = useState<string[]>([]);
  const [filtros, setFiltros] = useState<FiltrosNotas>({
    termo: '',
    status: 'all',
    dataInicio: '',
    dataFim: '',
    valorMinimo: '',
    valorMaximo: '',
    fornecedor: ''
  });
  const [notasFiltradas, setNotasFiltradas] = useState<NotaFiscal[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    if (open) {
      setSelectedNotas([]);
      setNotasFiltradas(notasFiscaisDisponiveis);
    }
  }, [open, notasFiscaisDisponiveis]);

  // Aplicar filtros
  useEffect(() => {
    let notas = [...notasFiscaisDisponiveis];

    // Filtro por termo (número, cliente, remetente)
    if (filtros.termo) {
      const termo = filtros.termo.toLowerCase();
      notas = notas.filter(nota => 
        nota.numero.toLowerCase().includes(termo) ||
        nota.cliente.toLowerCase().includes(termo) ||
        nota.remetente.toLowerCase().includes(termo)
      );
    }

    // Filtro por status
    if (filtros.status !== 'all') {
      notas = notas.filter(nota => nota.status === filtros.status);
    }

    // Filtro por fornecedor/remetente
    if (filtros.fornecedor) {
      const fornecedor = filtros.fornecedor.toLowerCase();
      notas = notas.filter(nota => 
        nota.remetente.toLowerCase().includes(fornecedor)
      );
    }

    // Filtro por valor mínimo
    if (filtros.valorMinimo) {
      const valorMin = parseFloat(filtros.valorMinimo);
      notas = notas.filter(nota => nota.valor >= valorMin);
    }

    // Filtro por valor máximo
    if (filtros.valorMaximo) {
      const valorMax = parseFloat(filtros.valorMaximo);
      notas = notas.filter(nota => nota.valor <= valorMax);
    }

    // Filtro por data início
    if (filtros.dataInicio) {
      notas = notas.filter(nota => {
        const dataEmissao = new Date(nota.dataEmissao.split('/').reverse().join('-'));
        const dataInicio = new Date(filtros.dataInicio);
        return dataEmissao >= dataInicio;
      });
    }

    // Filtro por data fim
    if (filtros.dataFim) {
      notas = notas.filter(nota => {
        const dataEmissao = new Date(nota.dataEmissao.split('/').reverse().join('-'));
        const dataFim = new Date(filtros.dataFim);
        return dataEmissao <= dataFim;
      });
    }

    setNotasFiltradas(notas);
  }, [filtros, notasFiscaisDisponiveis]);
  
  const handleToggleNota = (notaId: string) => {
    setSelectedNotas(prev => 
      prev.includes(notaId)
        ? prev.filter(id => id !== notaId)
        : [...prev, notaId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotas.length === notasFiltradas.length) {
      setSelectedNotas([]);
    } else {
      setSelectedNotas(notasFiltradas.map(nota => nota.id));
    }
  };

  const handleDetalhes = (nota: NotaFiscal) => {
    console.log('Visualizando detalhes da nota:', nota);
    toast({
      title: "Detalhes da Nota Fiscal",
      description: `Exibindo detalhes da NF ${nota.numero} - ${nota.remetente}`,
    });
    // Aqui você pode implementar um modal de detalhes ou navegação
  };

  const handleIniciarProcessamento = (nota: NotaFiscal) => {
    console.log('Iniciando processamento da nota:', nota);
    toast({
      title: "Processamento Iniciado",
      description: `Iniciando processamento da NF ${nota.numero}`,
    });
    // Aqui você pode implementar a lógica de iniciar processamento
  };
  
  const handleImport = () => {
    if (selectedNotas.length === 0) {
      toast({
        title: "Nenhuma nota fiscal selecionada",
        description: "Selecione pelo menos uma nota fiscal para importar.",
        variant: "destructive",
      });
      return;
    }
    
    onImport(selectedNotas);
    onOpenChange(false);
  };

  const limparFiltros = () => {
    setFiltros({
      termo: '',
      status: 'all',
      dataInicio: '',
      dataFim: '',
      valorMinimo: '',
      valorMaximo: '',
      fornecedor: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Importar Notas Fiscais</DialogTitle>
          <DialogDescription>
            Selecione as notas fiscais que deseja importar para esta Ordem de Carregamento.
          </DialogDescription>
        </DialogHeader>
        
        {/* Área de Filtros */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Buscar por número, cliente ou remetente..."
                value={filtros.termo}
                onChange={(e) => setFiltros(prev => ({ ...prev, termo: e.target.value }))}
                className="w-80"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {showFilters && (
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={filtros.status} onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_processamento">Em Processamento</SelectItem>
                      <SelectItem value="conferida">Conferida</SelectItem>
                      <SelectItem value="finalizada">Finalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fornecedor">Fornecedor</Label>
                  <Input
                    id="fornecedor"
                    placeholder="Nome do fornecedor"
                    value={filtros.fornecedor}
                    onChange={(e) => setFiltros(prev => ({ ...prev, fornecedor: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="dataInicio">Data Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="dataFim">Data Fim</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="valorMinimo">Valor Mínimo (R$)</Label>
                  <Input
                    id="valorMinimo"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={filtros.valorMinimo}
                    onChange={(e) => setFiltros(prev => ({ ...prev, valorMinimo: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="valorMaximo">Valor Máximo (R$)</Label>
                  <Input
                    id="valorMaximo"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={filtros.valorMaximo}
                    onChange={(e) => setFiltros(prev => ({ ...prev, valorMaximo: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={limparFiltros}>
                  Limpar Filtros
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="animate-spin h-8 w-8 text-cross-blue" />
            <span className="ml-2">Carregando notas fiscais...</span>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notasFiltradas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {notasFiscaisDisponiveis.length === 0 ? (
                  <>
                    Nenhuma nota fiscal disponível para importação.
                    <br />
                    <small className="text-xs">
                      As notas devem estar com status "pendente" e não vinculadas a outras ordens.
                    </small>
                  </>
                ) : (
                  <>
                    Nenhuma nota fiscal encontrada com os filtros aplicados.
                    <br />
                    <small className="text-xs">
                      Tente ajustar os critérios de busca.
                    </small>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={selectedNotas.length === notasFiltradas.length && notasFiltradas.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm font-medium">
                      Selecionar todas ({notasFiltradas.length} notas)
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {selectedNotas.length} selecionadas
                  </span>
                </div>

                <div className="space-y-2">
                  {notasFiltradas.map(nota => (
                    <div key={nota.id} className="flex items-center space-x-3 border rounded-md p-3 hover:bg-gray-50">
                      <Checkbox 
                        id={`nota-${nota.id}`} 
                        checked={selectedNotas.includes(nota.id)}
                        onCheckedChange={() => handleToggleNota(nota.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">NF {nota.numero}</div>
                        <div className="text-sm text-gray-500">
                          Cliente: {nota.cliente} • Remetente: {nota.remetente}
                        </div>
                        <div className="text-sm text-gray-500">
                          Valor: R$ {nota.valor.toFixed(2)} • Data: {nota.dataEmissao}
                        </div>
                        {nota.pesoBruto > 0 && (
                          <div className="text-xs text-gray-400">
                            Peso: {nota.pesoBruto} kg
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDetalhes(nota)}
                          className="flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIniciarProcessamento(nota)}
                          className="flex items-center bg-cross-blue text-white hover:bg-cross-blue/90"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            onClick={handleImport} 
            disabled={selectedNotas.length === 0 || isLoading}
            className="bg-cross-blue hover:bg-cross-blue/90"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Importando...
              </>
            ) : (
              `Importar Selecionadas (${selectedNotas.length})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportarNotasDialog;
