
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

const InstructionsCard: React.FC = () => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Package className="mr-2 text-cross-blue" size={20} />
          Instruções de Carregamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="text-sm space-y-1 text-gray-600">
          <li>• Volumes frágeis devem ser posicionados por último e no topo</li>
          <li>• Volumes mais pesados devem ficar na parte inferior</li>
          <li>• Volumes maiores devem ser carregados primeiro</li>
          <li>• Verificar a distribuição de peso entre os eixos</li>
          <li>• Respeitar a capacidade máxima de peso por zona</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default InstructionsCard;
