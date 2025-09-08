
import React from 'react';
import { QrCode, Biohazard, TestTube } from 'lucide-react';
import TransulLogo from '@/components/common/print/etiquetas/TransulLogo';

interface TransulEnhancedPreviewProps {
  tipoEtiqueta: 'volume' | 'mae';
  isQuimico: boolean;
  transportadoraLogo?: string;
}

const TransulEnhancedPreview: React.FC<TransulEnhancedPreviewProps> = ({ tipoEtiqueta, isQuimico, transportadoraLogo }) => {
  return (
    <div className="p-3 border-2 border-gray-600 bg-gray-50 relative min-h-[200px] w-[300px]">
      {/* Header com Logo da Transul */}
      <div className="flex items-center justify-between border-b-2 border-gray-300 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-6 bg-gray-200 rounded text-xs flex items-center justify-center">LOGO</div>
          <TransulLogo 
            className="object-contain"
            style={{ width: '60px', height: '20px' }}
          />
        </div>
        <div className="text-xs text-gray-600">
          {tipoEtiqueta === 'mae' ? 'ETIQUETA MÃE' : 'VOLUME 1/2'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        {/* QR Code */}
        <div className="flex flex-col items-center">
          <QrCode size={24} className="mb-1" />
          <div className="text-xs font-bold">VOL001</div>
        </div>

        {/* Nota Fiscal */}
        <div className="bg-yellow-100 border-2 border-yellow-500 rounded p-2 text-center">
          <div className="text-xs text-yellow-700 font-bold">NF</div>
          <div className="text-lg font-black text-yellow-900">123456</div>
        </div>

        {/* Cidade */}
        <div className="bg-green-100 border-2 border-green-500 rounded p-2 text-center">
          <div className="text-xs text-green-700 font-bold">DESTINO</div>
          <div className="text-sm font-black text-green-900">SÃO PAULO</div>
          <div className="text-xs font-bold text-green-900">SP</div>
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-purple-100 border border-purple-400 rounded p-1">
          <span className="text-purple-700 font-bold">Remetente:</span>
          <div className="font-bold text-purple-900">EMPRESA XYZ</div>
        </div>
        <div className="bg-gray-100 border border-gray-400 rounded p-1">
          <span className="text-gray-600 font-bold">Peso:</span>
          <div className="font-bold">25.5 Kg</div>
        </div>
      </div>

      {isQuimico && (
        <div className="absolute top-2 right-2">
          <TestTube size={12} className="text-red-500" />
        </div>
      )}
      
      {isQuimico && (
        <div className="bg-red-100 border border-red-500 rounded p-1 mt-2">
          <div className="flex items-center justify-center">
            <Biohazard size={8} className="text-red-600 mr-1" />
            <span className="text-xs font-bold text-red-600">QUÍMICO</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransulEnhancedPreview;
