
import React from 'react';
import { QrCode, Biohazard, TestTube } from 'lucide-react';

interface PortraitPreviewProps {
  tipoEtiqueta: 'volume' | 'mae';
  isQuimico: boolean;
}

const PortraitPreview: React.FC<PortraitPreviewProps> = ({ tipoEtiqueta, isQuimico }) => (
  <div className={`p-3 border-2 ${tipoEtiqueta === 'mae' ? 'border-red-500 bg-red-50' : isQuimico ? 'border-yellow-500 bg-yellow-50' : 'border-blue-500 bg-blue-50'} relative min-h-[300px] w-[200px]`}>
    <div className="flex flex-col space-y-2 h-full">
      {/* Header */}
      <div className={`text-center py-1 px-2 rounded text-white text-xs font-bold ${tipoEtiqueta === 'mae' ? 'bg-red-500' : 'bg-blue-600'}`}>
        {tipoEtiqueta === 'mae' ? 'ETIQUETA MÃE' : 'VOLUME 1/2'}
      </div>
      
      {/* QR Code - Reduzido */}
      <div className="flex justify-center py-1">
        <QrCode size={24} className="mx-auto" />
      </div>
      
      {/* NF - Destaque AUMENTADO */}
      <div className="bg-yellow-100 border-2 border-yellow-500 rounded p-2 text-center">
        <div className="text-xs text-gray-600">NOTA FISCAL</div>
        <div className="text-lg font-black">123456</div>
      </div>
      
      {/* Cidade - Destaque AUMENTADO */}
      <div className="bg-green-100 border-2 border-green-500 rounded p-2 text-center">
        <div className="text-xs text-gray-600">CIDADE DESTINO</div>
        <div className="text-base font-black">SÃO PAULO</div>
        <div className="text-sm font-bold">SP</div>
      </div>
      
      {/* Remetente - Destaque AUMENTADO */}
      <div className="bg-blue-100 border-2 border-blue-500 rounded p-2">
        <div className="text-xs text-gray-600">REMETENTE</div>
        <div className="text-sm font-black leading-tight">EMPRESA XYZ</div>
      </div>
      
      {/* Quantidade de Volumes - DESTAQUE AUMENTADO (para etiqueta mãe) */}
      {tipoEtiqueta === 'mae' && (
        <div className="bg-purple-100 border-2 border-purple-500 rounded p-2 text-center">
          <div className="text-xs text-gray-600">QTD VOLUMES</div>
          <div className="text-lg font-black">25</div>
        </div>
      )}
      
      {/* Destinatário - Compactado */}
      <div className="bg-purple-100 border border-purple-400 rounded p-1">
        <div className="text-xs text-gray-600">DESTINATÁRIO</div>
        <div className="text-xs font-bold leading-tight">CLIENTE ABC</div>
      </div>

      {isQuimico && (
        <div className="absolute top-2 right-2">
          <TestTube size={12} className="text-red-500" />
        </div>
      )}
      
      {isQuimico && (
        <div className="bg-red-100 border border-red-500 rounded p-1 mt-auto">
          <div className="flex items-center justify-center">
            <Biohazard size={10} className="text-red-600 mr-1" />
            <span className="text-xs font-bold text-red-600">QUÍMICO</span>
          </div>
          <div className="text-xs text-center">ONU:1090</div>
        </div>
      )}
    </div>
  </div>
);

export default PortraitPreview;
