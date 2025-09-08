
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { VolumeItem, formatarNumero, calcularVolume } from '../../../utils/volumes/index';

interface AddVolumeFormProps {
  onAddVolume: (volume: Omit<VolumeItem, "id">) => void;
  isReadOnly?: boolean;
}

const AddVolumeForm: React.FC<AddVolumeFormProps> = ({ onAddVolume, isReadOnly = false }) => {
  const [novoVolume, setNovoVolume] = useState<Omit<VolumeItem, "id" | "peso" | "cubicVolume">>({
    altura: 0,
    largura: 0,
    comprimento: 0,
    quantidade: 1
  });
  const [volumeM3, setVolumeM3] = useState<number>(0);

  // Calculate volume whenever dimensions or quantity changes
  useEffect(() => {
    // Formula: altura * largura * comprimento * quantidade (no division by 1000000)
    if (novoVolume.altura && novoVolume.largura && novoVolume.comprimento && novoVolume.quantidade) {
      const calculatedVolume = novoVolume.altura * novoVolume.largura * novoVolume.comprimento * novoVolume.quantidade;
      setVolumeM3(calculatedVolume);
    } else {
      setVolumeM3(0);
    }
  }, [novoVolume.altura, novoVolume.largura, novoVolume.comprimento, novoVolume.quantidade]);

  const handleVolumeChange = (field: keyof Omit<VolumeItem, "id" | "peso" | "cubicVolume">, value: any) => {
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
    
    // Add the volume with peso and cubicVolume
    onAddVolume({
      ...novoVolume,
      peso: 0, // Weight is handled at the nota fiscal level
      cubicVolume: volumeM3
    });
    
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
    <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
      <div>
        <span className="text-xs">Altura (cm)</span>
        <Input 
          type="number" 
          value={novoVolume.altura || ''} 
          onChange={(e) => handleVolumeChange('altura', e.target.value)}
          step="0.01"
          min="0"
          placeholder="0.00"
          disabled={isReadOnly}
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
          disabled={isReadOnly}
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
          disabled={isReadOnly}
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
          disabled={isReadOnly}
        />
      </div>
      <div>
        <span className="text-xs">Volume (m³)</span>
        <Input
          type="text"
          value={formatarNumero(volumeM3)}
          readOnly
          className="bg-gray-50"
        />
      </div>
      <div>
        <Button 
          type="button" 
          variant="outline"
          onClick={adicionarVolume}
          className="w-full"
          disabled={isReadOnly || novoVolume.altura <= 0 || novoVolume.largura <= 0 || novoVolume.comprimento <= 0}
        >
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </div>
    </div>
  );
};

export default AddVolumeForm;
