
import React from 'react';
import { QrCode, Biohazard } from 'lucide-react';

interface EnhancedContrastPreviewProps {
  tipoEtiqueta: 'volume' | 'mae';
  isQuimico: boolean;
  transportadoraLogo?: string;
}

const EnhancedContrastPreview: React.FC<EnhancedContrastPreviewProps> = ({ tipoEtiqueta, isQuimico, transportadoraLogo }) => {
  return (
    <div className="p-4 border-2 border-gray-600 bg-gray-50 relative min-h-[250px] w-[350px]">
      <div className="grid grid-cols-3 gap-3">
        {/* Coluna 1: Dados do remetente e Nota Fiscal */}
        <div className="flex flex-col space-y-2">
          {/* Remetente - CONTAINER PRETO */}
          <div className="bg-black border-2 border-gray-800 rounded p-2 shadow-lg">
            <div className="text-sm text-white font-bold">REMETENTE</div>
            <div className="text-lg font-black text-white">EMPRESA XYZ</div>
          </div>
          
          {/* Nota Fiscal - CONTAINER PRETO */}
          <div className="bg-black border-2 border-gray-800 rounded p-3 text-center shadow-lg">
            <div className="text-sm font-bold text-white">NOTA FISCAL</div>
            <div className="text-2xl font-black text-white">123456</div>
          </div>
          
          {/* Transportadora com Logo */}
          <div className="bg-gray-100 p-2 rounded">
            <div className="text-xs text-gray-600">TRANSPORTADORA</div>
            {transportadoraLogo ? (
              <div className="mt-1">
                <img 
                  src={transportadoraLogo} 
                  alt="Logo" 
                  className="max-h-8 object-contain"
                  style={{ width: '90mm', height: '25mm', maxWidth: '100px', maxHeight: '32px' }}
                />
              </div>
            ) : (
              <div className="font-bold text-base">TRANSPORTADORA</div>
            )}
          </div>
          
          {/* Tipo de Volume */}
          <div className="bg-gray-100 p-1 rounded">
            <div className="text-xs text-gray-600">TIPO</div>
            <div className="font-bold text-base">
              {isQuimico ? 'QUÍMICO' : 'GERAL'}
            </div>
          </div>
        </div>
        
        {/* Coluna 2: Destinatário e código do volume */}
        <div className="flex flex-col space-y-2">
          {/* Destinatário */}
          <div className="bg-gray-100 p-2 rounded">
            <div className="text-xs text-gray-600">DESTINATÁRIO</div>
            <div className="font-bold text-lg">CLIENTE ABC</div>
            <div className="text-sm">Rua das Flores, 123</div>
          </div>
          
          {/* Destino - CONTAINER PRETO */}
          <div className="bg-black border-2 border-gray-800 rounded p-3 text-center shadow-lg">
            <div className="text-sm font-bold text-white">CIDADE DESTINO</div>
            <div className="text-xl font-black text-white">SÃO PAULO</div>
            <div className="text-lg font-bold text-white">SP</div>
          </div>
          
          {/* QR Code */}
          <div className="flex flex-col items-center justify-center pt-1">
            <div className="bg-white p-2 rounded">
              <QrCode size={60} className="mx-auto" />
            </div>
            <div className="text-sm mt-1 font-mono font-bold">VOL001</div>
          </div>
        </div>
        
        {/* Coluna 3: Número de volume e informações químicas */}
        <div className="flex flex-col space-y-2">
          {/* Cabeçalho - Número do Volume ou Quantidade */}
          {tipoEtiqueta === 'mae' ? (
            <div className="bg-black border-2 border-gray-800 rounded p-3 text-center shadow-lg">
              <div className="text-sm font-bold text-white">QTD VOLUMES</div>
              <div className="text-2xl font-black text-white">25</div>
            </div>
          ) : (
            <div className="text-center bg-gray-100 p-2 border-2 border-gray-300 rounded">
              <div className="text-sm">VOLUME</div>
              <div className="font-bold text-2xl">1/2</div>
            </div>
          )}
          
          {/* Peso total */}
          <div className="bg-gray-100 p-1 rounded">
            <div className="text-xs text-gray-600">PESO TOTAL</div>
            <div className="font-bold text-lg">25.5 Kg</div>
          </div>
          
          {/* Informações de produto químico se aplicável */}
          {isQuimico && (
            <div className="bg-yellow-100 p-2 border-2 border-yellow-500 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold">QUÍMICO</div>
                  <div className="text-base">
                    <span className="font-bold">ONU:</span> 1234
                  </div>
                  <div className="text-base">
                    <span className="font-bold">RISCO:</span> 3
                  </div>
                </div>
                <Biohazard size={30} className="text-red-600" />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Volume destacado - CONTAINER PRETO (mesmo estilo do remetente) */}
      {tipoEtiqueta === 'volume' && (
        <div className="mt-3 bg-black border-2 border-gray-800 rounded p-2 shadow-lg">
          <div className="text-sm text-white font-bold">
            <span className="font-bold">Volume:</span> <span className="text-base font-bold">1/2</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedContrastPreview;
