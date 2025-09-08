
import React from 'react';
import { Volume } from '@/hooks/useEnderecamentoVolumes';

interface VolumePrintTemplateProps {
  volumeRef: React.RefObject<HTMLDivElement>;
  selectedVolumeForPrint: string | null;
  volumesParaEnderecar: Volume[];
}

const VolumePrintTemplate: React.FC<VolumePrintTemplateProps> = ({
  volumeRef,
  selectedVolumeForPrint,
  volumesParaEnderecar
}) => {
  const selectedVolume = volumesParaEnderecar.find(vol => vol.id === selectedVolumeForPrint);

  return (
    <div className="hidden">
      <div ref={volumeRef} className="p-4 bg-white">
        <h2 className="text-xl font-bold mb-4">Informações de Endereçamento - Volume {selectedVolumeForPrint}</h2>
        <div className="border p-4">
          {selectedVolumeForPrint && selectedVolume && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">ID do Volume:</p>
                  <p className="font-bold">{selectedVolumeForPrint}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo:</p>
                  <p>{selectedVolume.tipo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Descrição:</p>
                  <p>{selectedVolume.descricao}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nota Fiscal:</p>
                  <p>{selectedVolume.notaFiscal}</p>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-lg font-medium">Endereço:</p>
                  <p className="text-xl font-bold">{selectedVolume.endereco || "Não endereçado"}</p>
                </div>
                
                <div className="mt-8 border-t pt-4">
                  <p className="text-xs text-gray-500">Data de impressão: {new Date().toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">Hora: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolumePrintTemplate;
