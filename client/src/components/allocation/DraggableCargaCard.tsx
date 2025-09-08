import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Calendar, Weight, Ruler, Users, Navigation, Package2, GripVertical
} from 'lucide-react';
import type { Carga } from '@shared/schema';
import { useDragDrop } from '@/components/ui/drag-drop-context';

interface DraggableCargaCardProps {
  carga: Carga;
  formatData: (data: string | Date | null) => string;
  formatVolume: (volume: number | null) => string;
  formatPeso: (peso: number | null) => string;
  getStatusBadge: (status: string | null) => React.ReactNode;
}

const DraggableCargaCard: React.FC<DraggableCargaCardProps> = ({
  carga,
  formatData,
  formatVolume,
  formatPeso,
  getStatusBadge,
}) => {
  const { setDraggedItem, setIsDragging, isDragging, draggedItem } = useDragDrop();

  const handleDragStart = (e: React.DragEvent) => {
    setDraggedItem(carga);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', carga.id);
    
    // Create a custom drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(3deg)';
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setIsDragging(false);
  };

  const isBeingDragged = draggedItem?.id === carga.id;
  const canDrag = carga.status === 'pendente';

  return (
    <Card 
      className={`
        border-l-4 border-l-blue-500 transition-all duration-200
        ${canDrag ? 'cursor-grab hover:shadow-lg' : 'cursor-default'}
        ${isBeingDragged ? 'opacity-50 scale-95' : ''}
        ${isDragging && !isBeingDragged ? 'opacity-75' : ''}
      `}
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {canDrag && (
              <GripVertical className="h-4 w-4 text-gray-400" />
            )}
            <CardTitle className="text-lg font-semibold">
              {carga.numero_carga}
            </CardTitle>
          </div>
          {getStatusBadge(carga.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Origem:</span>
            <span>{carga.origem}</span>
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Destino:</span>
            <span>{carga.destino}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Previsão:</span>
            <span>{formatData(carga.data_previsao)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package2 className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Volumes:</span>
            <span>{carga.volumes || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Weight className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Peso:</span>
            <span>{formatPeso(carga.peso_kg)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Volume:</span>
            <span>{formatVolume(carga.volume_m3)}</span>
          </div>
        </div>

        {carga.observacoes && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm">
              <span className="font-medium">Observações:</span>
              <p className="text-gray-600 mt-1">{carga.observacoes}</p>
            </div>
          </div>
        )}

        {canDrag && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <GripVertical className="h-4 w-4" />
              <span>Arraste para alocar a um motorista</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DraggableCargaCard;