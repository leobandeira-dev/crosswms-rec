import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, Phone, FileText, Truck, Target, CheckCircle
} from 'lucide-react';
import type { Motorista, Veiculo } from '@shared/schema';
import { useDragDrop } from '@/components/ui/drag-drop-context';

interface MotoristaDropZoneProps {
  motorista: Motorista;
  veiculos: Veiculo[];
  onDrop: (cargaId: string, motoristaId: string, veiculoId: string) => void;
}

const MotoristaDropZone: React.FC<MotoristaDropZoneProps> = ({
  motorista,
  veiculos,
  onDrop,
}) => {
  const { draggedItem, isDragging, setDropZone, dropZone } = useDragDrop();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState<string>('');

  // Filter available vehicles for this motorista
  const availableVeiculos = veiculos.filter(v => 
    v.status === 'disponivel' && !v.motorista_id
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsHovered(true);
    setDropZone(motorista.id);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
    setDropZone(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
    setDropZone(null);

    if (draggedItem && availableVeiculos.length > 0) {
      const veiculoId = selectedVeiculo || availableVeiculos[0].id;
      onDrop(draggedItem.id, motorista.id, veiculoId);
    }
  };

  const canAcceptDrop = isDragging && draggedItem?.status === 'pendente' && availableVeiculos.length > 0;
  const isDropTarget = dropZone === motorista.id;

  return (
    <Card 
      className={`
        transition-all duration-200 border-2
        ${canAcceptDrop ? 'border-dashed border-green-400 bg-green-50' : 'border-solid border-gray-200'}
        ${isHovered && canAcceptDrop ? 'border-green-600 bg-green-100 scale-105 shadow-lg' : ''}
        ${isDropTarget ? 'ring-2 ring-green-400' : ''}
        ${!canAcceptDrop && isDragging ? 'opacity-50' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            {motorista.nome}
          </CardTitle>
          <Badge variant={motorista.status === 'ativo' ? 'default' : 'secondary'}>
            {motorista.status === 'ativo' ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Motorista Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="font-medium">CNH:</span>
              <span>{motorista.cnh}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Telefone:</span>
              <span>{motorista.telefone}</span>
            </div>
          </div>

          {/* Available Vehicles */}
          {availableVeiculos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Truck className="h-4 w-4 text-blue-600" />
                <span>Veículos Disponíveis</span>
              </div>
              <div className="space-y-1">
                {availableVeiculos.map((veiculo) => (
                  <div 
                    key={veiculo.id}
                    className={`
                      p-2 rounded border cursor-pointer transition-colors text-sm
                      ${selectedVeiculo === veiculo.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    onClick={() => setSelectedVeiculo(veiculo.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{veiculo.placa}</span>
                      <span className="text-gray-600">{veiculo.tipo}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {veiculo.marca} {veiculo.modelo}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drop Zone Instructions */}
          {canAcceptDrop && (
            <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Solte aqui para alocar a carga
                </span>
              </div>
              {selectedVeiculo && (
                <div className="mt-2 text-xs text-green-600">
                  Será alocado no veículo: {availableVeiculos.find(v => v.id === selectedVeiculo)?.placa}
                </div>
              )}
            </div>
          )}

          {/* No Vehicles Available */}
          {availableVeiculos.length === 0 && (
            <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600">
                <Truck className="h-4 w-4" />
                <span className="text-sm">
                  Nenhum veículo disponível
                </span>
              </div>
            </div>
          )}

          {/* Success Feedback */}
          {isHovered && canAcceptDrop && (
            <div className="p-3 bg-green-200 border border-green-400 rounded-lg animate-pulse">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Pronto para receber a carga!
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MotoristaDropZone;