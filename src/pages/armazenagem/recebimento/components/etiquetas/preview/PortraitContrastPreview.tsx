
import React from 'react';
import { QrCode, Biohazard, TestTube } from 'lucide-react';

interface PortraitContrastPreviewProps {
  tipoEtiqueta: 'volume' | 'mae';
  isQuimico: boolean;
  transportadoraLogo?: string;
}

const PortraitContrastPreview: React.FC<PortraitContrastPreviewProps> = ({ tipoEtiqueta, isQuimico, transportadoraLogo }) => {
  return (
    <div className="p-3 border-2 border-gray-600 bg-gray-50 relative min-h-[350px] w-[220px]">
      <div className="flex flex-col space-y-3 h-full">
        {/* Header - Tipo de Etiqueta */}
        <div className={`text-center py-2 px-3 rounded shadow-lg ${tipoEtiqueta === 'mae' ? 'bg-red-800 text-white' : 'bg-blue-700 text-white'}`}>
          <span className="text-lg font-black">
            {tipoEtiqueta === 'mae' ? 'ETIQUETA MÃE' : 'VOLUME 1/2'}
          </span>
        </div>

        {/* Logo da Transportadora */}
        {transportadoraLogo && (
          <div className="flex justify-center py-1">
            <div className="bg-white p-1 rounded shadow-md border">
              <img 
                src={transportadoraLogo} 
                alt="Logo Transportadora" 
                className="object-contain"
                style={{ width: '90mm', height: '25mm', maxWidth: '120px', maxHeight: '32px' }}
              />
            </div>
          </div>
        )}

        {/* QR Code Section */}
        <div className="flex justify-center py-1">
          <div className="text-center bg-white p-2 rounded shadow-md">
            <QrCode size={50} className="mx-auto mb-1" />
            <div className="text-xs font-bold">VOL001</div>
          </div>
        </div>

        {/* Nota Fiscal - CONTAINER PRETO */}
        <div className="bg-black border-4 border-gray-800 rounded-xl p-4 text-center shadow-lg">
          <div className="text-sm text-white font-black">NOTA FISCAL</div>
          <div className="text-3xl font-black text-white mt-1 tracking-wider">123456</div>
        </div>

        {/* Cidade Destino - CONTAINER PRETO */}
        <div className="bg-black border-4 border-gray-800 rounded-xl p-4 text-center shadow-lg">
          <div className="text-sm text-white font-black">CIDADE DESTINO</div>
          <div className="text-2xl font-black text-white mt-1 leading-tight">SÃO PAULO</div>
          <div className="text-xl font-black text-white mt-1">SP</div>
        </div>

        {/* Remetente - CONTAINER PRETO */}
        <div className="bg-black border-4 border-gray-800 rounded-xl p-4 shadow-lg">
          <div className="text-sm text-white font-black">REMETENTE</div>
          <div className="text-lg font-black text-white leading-tight mt-1">EMPRESA XYZ LTDA</div>
        </div>

        {/* Quantidade de Volumes - CONTAINER PRETO (para etiqueta mãe) */}
        {tipoEtiqueta === 'mae' && (
          <div className="bg-black border-4 border-gray-800 rounded-xl p-4 text-center shadow-lg">
            <div className="text-sm text-white font-black">QUANTIDADE DE VOLUMES</div>
            <div className="text-3xl font-black text-white mt-1">25</div>
          </div>
        )}

        {/* Destinatário */}
        <div className="bg-blue-100 border-2 border-blue-500 rounded-lg p-2 shadow-md">
          <div className="text-xs text-blue-700 font-bold">DESTINATÁRIO</div>
          <div className="text-sm font-bold text-blue-900 leading-tight">CLIENTE ABC LTDA</div>
        </div>

        {/* Informações Adicionais */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-100 border border-gray-300 p-1 rounded">
            <span className="text-gray-600 font-medium">Peso:</span>
            <div className="font-bold text-gray-800">25.5 Kg</div>
          </div>
          <div className="bg-gray-100 border border-gray-300 p-1 rounded">
            <span className="text-gray-600 font-medium">Transp:</span>
            <div className="font-bold text-gray-800 text-xs">EXPRESSO</div>
          </div>
        </div>

        {/* Produto Químico */}
        {isQuimico && (
          <div className="bg-red-100 border-2 border-red-500 rounded p-2 mt-auto">
            <div className="flex items-center justify-center mb-1">
              <Biohazard size={14} className="text-red-600 mr-1" />
              <span className="text-sm font-bold text-red-600">PRODUTO QUÍMICO</span>
              <TestTube size={12} className="text-red-600 ml-1" />
            </div>
            <div className="text-center text-xs">
              <div><span className="font-bold">ONU:</span> 1234</div>
              <div><span className="font-bold">RISCO:</span> 3</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortraitContrastPreview;
