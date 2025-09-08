import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, LinkIcon, UnlinkIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import DataTable from '@/components/common/DataTable';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Volume } from './VolumesTable';

interface EtiquetaMae {
  id: string;
  notaFiscal: string;
  quantidadeVolumes: number;
  remetente: string;
  destinatario: string;
  cidade: string;
  uf: string;
  dataCriacao: string;
  status: string;
}

interface VinculoEtiquetaMaeDialogProps {
  open: boolean;
  onClose: () => void;
  etiquetaMae: EtiquetaMae | null;
  volumes: Volume[];
  onSave: (etiquetaMaeId: string, volumeIds: string[]) => void;
}

const VinculoEtiquetaMaeDialog: React.FC<VinculoEtiquetaMaeDialogProps> = ({
  open,
  onClose,
  etiquetaMae,
  volumes,
  onSave
}) => {
  const [search, setSearch] = useState('');
  const [volumesFiltrados, setVolumesFiltrados] = useState<Volume[]>([]);
  const [volumesSelecionados, setVolumesSelecionados] = useState<string[]>([]);
  const [searchType, setSearchType] = useState<'id' | 'descricao' | 'chaveNF'>('id');
  
  // Reset selections when dialog opens with a different etiqueta mãe
  useEffect(() => {
    setSearch('');
    setVolumesSelecionados([]);
    
    // Filter volumes that belong to the same nota fiscal as the etiqueta mãe
    if (etiquetaMae) {
      const filteredVolumes = volumes.filter(vol => vol.notaFiscal === etiquetaMae.notaFiscal);
      setVolumesFiltrados(filteredVolumes);
    } else {
      setVolumesFiltrados([]);
    }
  }, [etiquetaMae, volumes]);
  
  // Filter volumes based on search
  useEffect(() => {
    if (!etiquetaMae) return;
    
    const filtered = volumes.filter(vol => {
      let matchesSearch = true;
      
      if (search) {
        switch (searchType) {
          case 'id':
            matchesSearch = vol.id.toLowerCase().includes(search.toLowerCase());
            break;
          case 'descricao':
            matchesSearch = vol.descricao.toLowerCase().includes(search.toLowerCase());
            break;
          case 'chaveNF':
            matchesSearch = vol.chaveNF?.toLowerCase().includes(search.toLowerCase()) || false;
            break;
          default:
            matchesSearch = true;
        }
      }
      
      const matchesNotaFiscal = vol.notaFiscal === etiquetaMae.notaFiscal;
      
      return matchesSearch && matchesNotaFiscal;
    });
    
    setVolumesFiltrados(filtered);
  }, [search, searchType, etiquetaMae, volumes]);
  
  const handleSelectVolume = (id: string) => {
    setVolumesSelecionados(prev => 
      prev.includes(id)
        ? prev.filter(volumeId => volumeId !== id)
        : [...prev, id]
    );
  };
  
  const handleSelectAll = () => {
    if (volumesSelecionados.length === volumesFiltrados.length) {
      setVolumesSelecionados([]);
    } else {
      setVolumesSelecionados(volumesFiltrados.map(vol => vol.id));
    }
  };
  
  const handleSave = () => {
    if (!etiquetaMae) return;
    
    if (volumesSelecionados.length === 0) {
      toast({
        title: "Nenhum volume selecionado",
        description: "Selecione pelo menos um volume para vincular à etiqueta mãe.",
        variant: "destructive"
      });
      return;
    }
    
    onSave(etiquetaMae.id, volumesSelecionados);
    onClose();
  };
  
  if (!etiquetaMae) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Vincular Volumes à Etiqueta Mãe: {etiquetaMae.id}
          </DialogTitle>
        </DialogHeader>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="text-md font-medium mb-2">Informações da Etiqueta Mãe</h3>
          <div className="grid grid-cols-2 gap-2">
            <p><strong>ID:</strong> {etiquetaMae.id}</p>
            <p><strong>Nota Fiscal:</strong> {etiquetaMae.notaFiscal}</p>
            <p><strong>Remetente:</strong> {etiquetaMae.remetente}</p>
            <p><strong>Destinatário:</strong> {etiquetaMae.destinatario}</p>
            <p><strong>Cidade/UF:</strong> {etiquetaMae.cidade} - {etiquetaMae.uf}</p>
          </div>
        </div>
        
        <div className="my-4">
          <div className="flex flex-col space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Buscar por:</h4>
              <RadioGroup 
                defaultValue="id" 
                className="flex space-x-4"
                value={searchType}
                onValueChange={(value) => setSearchType(value as 'id' | 'descricao' | 'chaveNF')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="id" id="searchId" />
                  <Label htmlFor="searchId">ID Volume</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="descricao" id="searchDesc" />
                  <Label htmlFor="searchDesc">Descrição</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="chaveNF" id="searchChave" />
                  <Label htmlFor="searchChave">Chave NF</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-2">
                <div className="relative">
                  <Input
                    placeholder={`Buscar volumes por ${
                      searchType === 'id' ? 'ID' : 
                      searchType === 'descricao' ? 'descrição' : 
                      'chave da nota fiscal'
                    }...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selectAll"
                  checked={volumesSelecionados.length === volumesFiltrados.length && volumesFiltrados.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="selectAll" className="text-sm cursor-pointer">
                  Selecionar todos
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <DataTable
              columns={[
                {
                  header: 'Selecionar',
                  accessor: 'selecionar',
                  cell: (row) => (
                    <Checkbox
                      checked={volumesSelecionados.includes(row.id)}
                      onCheckedChange={() => handleSelectVolume(row.id)}
                    />
                  )
                },
                { header: 'ID', accessor: 'id' },
                { header: 'Descrição', accessor: 'descricao' },
                { 
                  header: 'Tipo', 
                  accessor: 'tipoVolume',
                  cell: (row) => {
                    return row.tipoVolume === 'quimico' ? 'Químico' : 'Carga Geral';
                  }
                },
                { 
                  header: 'Etiqueta Mãe Atual', 
                  accessor: 'etiquetaMae',
                  cell: (row) => {
                    if (!row.etiquetaMae) return <span className="text-gray-400">-</span>;
                    return (
                      <div className="flex items-center">
                        <LinkIcon size={14} className="mr-1 text-blue-500" />
                        <span>{row.etiquetaMae}</span>
                      </div>
                    );
                  }
                }
              ]}
              data={volumesFiltrados}
            />
          </div>
          
          <div className="mt-3 text-sm text-gray-500">
            {volumesFiltrados.length} volumes encontrados.
            {volumesSelecionados.length > 0 && (
              <span className="ml-2 text-cross-blue font-medium">
                {volumesSelecionados.length} selecionados
              </span>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleSave}
            className="bg-cross-blue hover:bg-cross-blue/90"
          >
            <LinkIcon size={16} className="mr-1" />
            Vincular Volumes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VinculoEtiquetaMaeDialog;
