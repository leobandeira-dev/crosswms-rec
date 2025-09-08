
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Truck, Check, Box, Flag, FlagOff, Shield, Award } from 'lucide-react';

export const statusConfig = {
  'coleta_agendada': { icon: Clock, color: 'bg-blue-100 text-blue-800', text: 'Coleta agendada' },
  'coletando': { icon: Truck, color: 'bg-amber-100 text-amber-800', text: 'Coletando' },
  'coletado': { icon: Check, color: 'bg-green-100 text-green-800', text: 'Coletado' },
  'no_armazem': { icon: Box, color: 'bg-indigo-100 text-indigo-800', text: 'No armazém' },
  'em_transferencia': { icon: Truck, color: 'bg-purple-100 text-purple-800', text: 'Em transferência' },
  'em_rota_entrega': { icon: Truck, color: 'bg-teal-100 text-teal-800', text: 'Em rota de entrega' },
  'entregue': { icon: Flag, color: 'bg-green-100 text-green-800', text: 'Entregue' },
  'extraviada': { icon: FlagOff, color: 'bg-red-100 text-red-800', text: 'Extraviada' },
  'avariada': { icon: Shield, color: 'bg-orange-100 text-orange-800', text: 'Avariada' },
  'sinistrada': { icon: Shield, color: 'bg-red-100 text-red-800', text: 'Sinistrada' },
  'indenizada': { icon: Award, color: 'bg-gray-100 text-gray-800', text: 'Indenizada' }
};

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['coletado'];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
      <Icon size={14} /> {config.text}
    </Badge>
  );
};

export default StatusBadge;
