
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Package, Search, MapPin, Save } from 'lucide-react';
import { Volume } from '@/hooks/useEnderecamentoVolumes';

interface SearchVolumeCardProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchType: 'id' | 'notaFiscal' | 'etiquetaMae';
  handleSearchTypeChange: (type: 'id' | 'notaFiscal' | 'etiquetaMae') => void;
  handleSearch: (term: string) => void;
  selectedVolumes: Volume[];
  handleVolumeSelect: (volume: Volume) => void;
  selectedEndereco: string | null;
  setSelectedEndereco: (endereco: string | null) => void;
  confirmDialogOpen: boolean;
  setConfirmDialogOpen: (open: boolean) => void;
}

const SearchVolumeCard: React.FC<SearchVolumeCardProps> = ({
  searchTerm,
  setSearchTerm,
  searchType,
  handleSearchTypeChange,
  handleSearch,
  selectedVolumes,
  handleVolumeSelect,
  selectedEndereco,
  setSelectedEndereco,
  confirmDialogOpen,
  setConfirmDialogOpen
}) => {
  const form = useForm();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Package className="mr-2 text-cross-blue" size={20} />
          Buscar Volume
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4">
            <div>
              <div className="mb-4">
                <FormLabel>Critério de busca</FormLabel>
                <div className="flex gap-2 mb-4">
                  <Button 
                    variant={searchType === 'id' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => handleSearchTypeChange('id')}
                    className={searchType === 'id' ? 'bg-cross-blue hover:bg-cross-blue/90' : ''}
                    type="button"
                  >
                    ID Volume
                  </Button>
                  <Button 
                    variant={searchType === 'notaFiscal' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => handleSearchTypeChange('notaFiscal')}
                    className={searchType === 'notaFiscal' ? 'bg-cross-blue hover:bg-cross-blue/90' : ''}
                    type="button"
                  >
                    Nota Fiscal
                  </Button>
                  <Button 
                    variant={searchType === 'etiquetaMae' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => handleSearchTypeChange('etiquetaMae')}
                    className={searchType === 'etiquetaMae' ? 'bg-cross-blue hover:bg-cross-blue/90' : ''}
                    type="button"
                  >
                    Etiqueta Mãe
                  </Button>
                </div>
              </div>
              <FormField
                control={form.control}
                name="idVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {searchType === 'id' ? 'ID do Volume' : 
                       searchType === 'notaFiscal' ? 'Número da Nota Fiscal' : 
                       'Código da Etiqueta Mãe'}
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          placeholder={`Digite o ${searchType === 'id' ? 'código do volume' : 
                                              searchType === 'notaFiscal' ? 'número da nota fiscal' : 
                                              'código da etiqueta mãe'}`} 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                        />
                      </FormControl>
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="button" 
              className="w-full bg-cross-blue hover:bg-cross-blue/90"
              onClick={() => handleSearch(searchTerm)}
            >
              Buscar
            </Button>
          </form>
        </Form>
        
        {selectedVolumes.length > 0 && (
          <div className="mt-4 border rounded-md p-4">
            <h3 className="font-medium mb-2">Volumes selecionados ({selectedVolumes.length})</h3>
            <div className="max-h-32 overflow-y-auto">
              {selectedVolumes.map(volume => (
                <div key={volume.id} className="flex justify-between items-center py-1 border-b last:border-0">
                  <span className="text-sm">{volume.id}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleVolumeSelect(volume)}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <FormField
            control={form.control}
            name="novoEndereco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Novo Endereço</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      placeholder="Digite ou selecione endereço" 
                      value={selectedEndereco || ''}
                      onChange={(e) => setSelectedEndereco(e.target.value)}
                    />
                  </FormControl>
                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </FormItem>
            )}
          />
          
          <Button 
            className="w-full mt-4 bg-cross-blue hover:bg-cross-blue/90"
            disabled={selectedVolumes.length === 0 || !selectedEndereco}
            onClick={() => setConfirmDialogOpen(true)}
          >
            <Save size={16} className="mr-2" />
            Salvar Endereçamento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchVolumeCard;
