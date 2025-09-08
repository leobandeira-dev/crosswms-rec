
import React from 'react';
import { NotaFiscalVolume } from '../utils/volumes/types';
import { formatarNumero } from '../utils/volumes/formatters';
import VolumesTable from './volumes/VolumesTable';
import { Card, CardContent } from '@/components/ui/card';
import { calcularTotaisNota } from '../utils/volumes/calculations';

interface NotasFiscaisManagerProps {
  notasFiscais: NotaFiscalVolume[];
  onChangeNotasFiscais?: (notasFiscais: NotaFiscalVolume[]) => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

const NotasFiscaisManager: React.FC<NotasFiscaisManagerProps> = ({
  notasFiscais,
  onChangeNotasFiscais,
  isLoading = false,
  readOnly = false
}) => {
  const handleRemoveNotaFiscal = (index: number) => {
    if (onChangeNotasFiscais && !readOnly) {
      const updatedNotas = [...notasFiscais];
      updatedNotas.splice(index, 1);
      onChangeNotasFiscais(updatedNotas);
    }
  };
  
  const handleVolumeChange = (notaFiscalIndex: number, volumes: any[]) => {
    if (onChangeNotasFiscais && !readOnly) {
      const updatedNotas = [...notasFiscais];
      updatedNotas[notaFiscalIndex].volumes = volumes;
      onChangeNotasFiscais(updatedNotas);
    }
  };
  
  if (notasFiscais.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 border rounded-md">
        <h3 className="text-lg font-medium text-gray-600">
          Nenhuma nota fiscal adicionada
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {readOnly ? 
            "Não há notas fiscais para exibir nesta solicitação." : 
            "Importe notas fiscais utilizando as opções acima."
          }
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {notasFiscais.map((notaFiscal, index) => {
        const totalInfo = calcularTotaisNota(notaFiscal.volumes || [], notaFiscal.pesoTotal);
        
        return (
          <Card key={notaFiscal.numeroNF || index} className="overflow-hidden">
            <div className="bg-gray-50 p-4 border-b">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="font-medium">
                    NF {notaFiscal.numeroNF} 
                    {notaFiscal.numeroNF && <span className="text-gray-500 ml-1">Série {index + 1}</span>}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {notaFiscal.chaveNF && (
                      <span className="block">Chave: {notaFiscal.chaveNF}</span>
                    )}
                  </p>
                </div>
                
                {!readOnly && (
                  <button
                    onClick={() => handleRemoveNotaFiscal(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    disabled={isLoading}
                  >
                    Remover
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <span className="block text-xs text-gray-500">Valor</span>
                  <span className="font-medium">
                    {notaFiscal.valorTotal ? 
                      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(notaFiscal.valorTotal) : 
                      'N/D'
                    }
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Peso</span>
                  <span className="font-medium">
                    {formatarNumero(totalInfo.pesoTotal)} kg
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Volumes</span>
                  <span className="font-medium">
                    {totalInfo.qtdVolumes} ({formatarNumero(totalInfo.volumeTotal)} m³)
                  </span>
                </div>
              </div>
            </div>
            
            <CardContent className="pt-4">
              <VolumesTable 
                volumes={notaFiscal.volumes || []}
                onRemoveVolume={(volumeIndex) => {
                  const volumes = [...(notaFiscal.volumes || [])];
                  volumes.splice(volumeIndex, 1);
                  handleVolumeChange(index, volumes);
                }}
                readOnly={readOnly}
                pesoTotal={notaFiscal.pesoTotal}
              />
            </CardContent>
          </Card>
        );
      })}
      
      <div className="p-4 bg-gray-50 rounded-md border">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="block text-xs text-gray-500">Total de Notas</span>
            <span className="font-medium">{notasFiscais.length}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Total de Volumes</span>
            <span className="font-medium">
              {notasFiscais.reduce((total, nf) => {
                const totaisNota = calcularTotaisNota(nf.volumes || []);
                return total + totaisNota.qtdVolumes;
              }, 0)}
            </span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Peso Total</span>
            <span className="font-medium">
              {formatarNumero(notasFiscais.reduce((total, nf) => {
                return total + (nf.pesoTotal || 0);
              }, 0))} kg
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotasFiscaisManager;
