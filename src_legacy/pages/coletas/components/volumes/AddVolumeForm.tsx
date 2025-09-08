
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { VolumeItem, generateVolumeId, formatarNumero } from '../../utils/volumes/index';

interface AddVolumeFormProps {
  onAddVolume: (volume: VolumeItem) => void;
}

const AddVolumeForm: React.FC<AddVolumeFormProps> = ({ onAddVolume }) => {
  const [novoVolume, setNovoVolume] = useState<Omit<VolumeItem, "id" | "peso">>({
    altura: 0,
    largura: 0,
    comprimento: 0,
    quantidade: 1
  });
  const [volumeM3, setVolumeM3] = useState<number>(0);

  // Calculate volume whenever dimensions or quantity changes
  useEffect(() => {
    // Formula: altura * largura * comprimento * quantidade (no division by 1000000)
    const calculatedVolume = novoVolume.altura * novoVolume.largura * novoVolume.comprimento * novoVolume.quantidade;
    setVolumeM3(calculatedVolume);
  }, [novoVolume.altura, novoVolume.largura, novoVolume.comprimento, novoVolume.quantidade]);

  const handleVolumeChange = (field: keyof Omit<VolumeItem, "id" | "peso">, value: any) => {
    const parsedValue = field === 'quantidade' 
      ? (parseInt(value) || 1)
      : (parseFloat(value) || 0);
      
    setNovoVolume(prev => ({ ...prev, [field]: parsedValue }));
  };

  const adicionarVolume = () => {
    // Validate fields
    if (novoVolume.altura <= 0 || novoVolume.largura <= 0 || novoVolume.comprimento <= 0) {
      return;
    }
    
    // Add unique ID and set peso to 0 (weight comes from the XML)
    const volumeComId: VolumeItem = {
      ...novoVolume,
      id: generateVolumeId(),
      peso: 0 // Weight is handled at the nota fiscal level
    };
    
    onAddVolume(volumeComId);
    
    // Reset form
    setNovoVolume({
      altura: 0,
      largura: 0,
      comprimento: 0,
      quantidade: 1
    });
    setVolumeM3(0);
  };

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 items-end">
      <div>
        <span className="text-xs">Altura (cm)</span>
        <Input 
          type="number" 
          value={novoVolume.altura || ''} 
          onChange={(e) => handleVolumeChange('altura', e.target.value)}
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </div>
      <div>
        <span className="text-xs">Largura (cm)</span>
        <Input 
          type="number" 
          value={novoVolume.largura || ''} 
          onChange={(e) => handleVolumeChange('largura', e.target.value)}
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </div>
      <div>
        <span className="text-xs">Comprimento (cm)</span>
        <Input 
          type="number" 
          value={novoVolume.comprimento || ''} 
          onChange={(e) => handleVolumeChange('comprimento', e.target.value)}
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </div>
      <div>
        <span className="text-xs">Quantidade</span>
        <Input 
          type="number" 
          value={novoVolume.quantidade || ''} 
          onChange={(e) => handleVolumeChange('quantidade', e.target.value)}
          min="1"
          placeholder="1"
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-xs text-gray-500">Volume: <span className="font-medium">{formatarNumero(volumeM3)} m³</span></div>
        <Button 
          type="button" 
          variant="outline"
          onClick={adicionarVolume}
          className="w-full"
          disabled={novoVolume.altura <= 0 || novoVolume.largura <= 0 || novoVolume.comprimento <= 0}
        >
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </div>
    </div>
  );
};

export default AddVolumeForm;
