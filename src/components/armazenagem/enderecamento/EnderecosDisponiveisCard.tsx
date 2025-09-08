
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { Endereco } from '@/hooks/useEnderecamentoVolumes';

interface EnderecosDisponiveisCardProps {
  enderecosDisponiveis: Endereco[];
  selectedEndereco: string | null;
  setSelectedEndereco: (endereco: string | null) => void;
}

const EnderecosDisponiveisCard: React.FC<EnderecosDisponiveisCardProps> = ({
  enderecosDisponiveis,
  selectedEndereco,
  setSelectedEndereco
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Archive className="mr-2 text-cross-blue" size={20} />
          Endereços Disponíveis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {enderecosDisponiveis.map((endereco) => (
            <div 
              key={endereco.endereco}
              className={`
                border p-3 rounded-md cursor-pointer transition-colors
                ${endereco.disponivel ? 'hover:border-cross-blue hover:bg-blue-50' : 'bg-gray-100 opacity-60 cursor-not-allowed'}
                ${selectedEndereco === endereco.endereco ? 'border-cross-blue bg-blue-50' : ''}
              `}
              onClick={() => {
                if (endereco.disponivel) {
                  setSelectedEndereco(endereco.endereco);
                }
              }}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium">{endereco.endereco}</span>
                {endereco.disponivel ? 
                  <StatusBadge status="success" text="Livre" /> : 
                  <StatusBadge status="error" text="Ocupado" />
                }
              </div>
              <p className="text-sm text-gray-600 mt-1">{endereco.tipo}</p>
              <p className="text-xs text-gray-500">Cap: {endereco.capacidade}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnderecosDisponiveisCard;
