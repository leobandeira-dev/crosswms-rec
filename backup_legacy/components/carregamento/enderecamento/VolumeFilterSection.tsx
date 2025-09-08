
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, Search } from 'lucide-react';

// Import types
import { SearchType } from '@/types/enderecamento.types';

interface VolumeFilterSectionProps {
  onFilter: (searchValue: string, searchType: SearchType) => void;
}

const VolumeFilterSection: React.FC<VolumeFilterSectionProps> = ({ onFilter }) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('volume');
  
  const handleSearch = () => {
    onFilter(searchValue, searchType);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Filter className="mr-2 text-cross-blue" size={20} />
          Filtrar Volumes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Tipo de Pesquisa</Label>
            <div className="flex gap-2 mb-4">
              <Button 
                variant={searchType === 'volume' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSearchType('volume')}
                className={searchType === 'volume' ? 'bg-cross-blue hover:bg-cross-blue/90' : ''}
              >
                Volume
              </Button>
              <Button 
                variant={searchType === 'etiquetaMae' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSearchType('etiquetaMae')}
                className={searchType === 'etiquetaMae' ? 'bg-cross-blue hover:bg-cross-blue/90' : ''}
              >
                Etiqueta Mãe
              </Button>
              <Button 
                variant={searchType === 'notaFiscal' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSearchType('notaFiscal')}
                className={searchType === 'notaFiscal' ? 'bg-cross-blue hover:bg-cross-blue/90' : ''}
              >
                Nota Fiscal
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder={`Pesquisar por ${searchType === 'volume' ? 'volume' : searchType === 'etiquetaMae' ? 'etiqueta mãe' : 'nota fiscal'}`}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch}
              className="bg-cross-blue hover:bg-cross-blue/90"
            >
              <Search size={18} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VolumeFilterSection;
