
import React from 'react';
import { QrCode, AlertTriangle } from 'lucide-react';
import TransulLogo from '@/components/common/print/etiquetas/TransulLogo';

interface TransulContrastPreviewProps {
  tipoEtiqueta: 'volume' | 'mae';
  isQuimico: boolean;
  transportadoraLogo?: string;
}

const TransulContrastPreview: React.FC<TransulContrastPreviewProps> = ({ tipoEtiqueta, isQuimico, transportadoraLogo }) => {
  return (
    <div className="p-3 border-4 border-black bg-white relative min-h-[200px] w-[300px] font-bold">
      {/* Header com Logo da Transul - Alto Contraste */}
      <div className="flex items-center justify-between border-b-4 border-black pb-2 mb-3 bg-yellow-300">
        <div className="flex items-center space-x-2">
          <TransulLogo 
            className="object-contain"
            style={{ width: '60px', height: '20px' }}
          />
        </div>
        <div className="text-xs font-black bg-black text-white px-1 py-1">
          {tipoEtiqueta === 'mae' ? 'ETIQUETA MÃE' : 'VOLUME 1/2'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        {/* QR Code - Alto Contraste */}
        <div className="flex flex-col items-center bg-black text-white p-2 rounded">
          <QrCode size={16} className="mb-1 text-white" />
          <div className="text-xs font-black">VOL001</div>
        </div>

        {/* Nota Fiscal - Alto Contraste */}
        <div className="bg-black text-white border-2 border-black rounded p-2 text-center">
          <div className="text-xs font-black">NF</div>
          <div className="text-lg font-black">123456</div>
        </div>

        {/* Cidade - Alto Contraste */}
        <div className="bg-black text-white border-2 border-black rounded p-2 text-center">
          <div className="text-xs font-black">DESTINO</div>
          <div className="text-sm font-black">SÃO PAULO</div>
          <div className="text-xs font-black">SP</div>
        </div>
      </div>

      {/* Informações adicionais - Alto Contraste */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white border-2 border-black rounded p-1">
          <span className="font-black">Remetente:</span>
          <div className="font-black">EMPRESA XYZ</div>
        </div>
        <div className="bg-white border-2 border-black rounded p-1">
          <span className="font-black">Peso:</span>
          <div className="font-black">25.5 Kg</div>
        </div>
      </div>

      {/* Destinatário - Alto Contraste */}
      <div className="mt-2 bg-gray-900 text-white border-2 border-black rounded p-1">
        <span className="text-xs font-black">Destinatário: CLIENTE ABC</span>
      </div>

      {isQuimico && (
        <>
          <div className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded">
            <AlertTriangle size={10} className="text-white" />
          </div>
          
          <div className="bg-red-600 text-white border-2 border-black rounded p-1 mt-2">
            <div className="flex items-center justify-center">
              <span className="text-xs font-black">⚠️ QUÍMICO ⚠️</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TransulContrastPreview;
