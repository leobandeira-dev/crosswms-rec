
import React from 'react';
import { QrCode, Biohazard, TestTube } from 'lucide-react';

interface EnhancedPreviewProps {
  tipoEtiqueta: 'volume' | 'mae';
  isQuimico: boolean;
}

const EnhancedPreview: React.FC<EnhancedPreviewProps> = ({ tipoEtiqueta, isQuimico }) => (
  <div className={`p-3 border-2 ${tipoEtiqueta === 'mae' ? 'border-red-500 bg-red-50' : isQuimico ? 'border-yellow-500 bg-yellow-50' : 'border-blue-500 bg-blue-50'} relative`}>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <QrCode size={48} className={`mx-auto mb-2 ${tipoEtiqueta === 'mae' ? 'text-red-600' : isQuimico ? 'text-yellow-600' : 'text-blue-600'}`} />
        {tipoEtiqueta === 'mae' ? (
          <p className="font-bold text-xl text-red-600">ETIQUETA MÃE</p>
        ) : isQuimico ? (
          <div>
            <div className="absolute top-2 right-2">
              <TestTube size={28} className="text-red-500" />
            </div>
            <div className="flex items-center justify-center">
              <Biohazard size={24} className="inline-block mr-1 text-red-500" />
              <span className="font-bold text-lg text-red-500">PRODUTO QUÍMICO</span>
            </div>
            <div className="text-sm mt-1 bg-yellow-100 p-1 border border-yellow-400 rounded">
              <span className="font-bold">ONU:</span> 1090 <br />
              <span className="font-bold">RISCO:</span> 33
            </div>
          </div>
        ) : (
          <p className="font-bold text-xl text-blue-600">ETIQUETA DE VOLUME</p>
        )}
      </div>
      <div>
        <div className="font-bold text-lg">Alta Legibilidade</div>
        <div className="text-sm mt-1">Texto Maior</div>
        <div className="mt-3 bg-yellow-200 p-2 border-2 border-yellow-400 rounded text-sm">
          <span className="font-bold">NF:</span> <span className="text-lg font-bold">123456</span>
        </div>
        <div className="mt-2 bg-green-200 p-2 border-2 border-green-400 rounded text-sm">
          <span className="font-bold">Destino:</span> <span className="text-lg font-bold">SÃO PAULO</span>
        </div>
      </div>
    </div>
  </div>
);

export default EnhancedPreview;
