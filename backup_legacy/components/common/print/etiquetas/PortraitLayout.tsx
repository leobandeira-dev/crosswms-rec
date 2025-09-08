
import React from 'react';
import QRCodeGenerator from '../QRCodeGenerator';
import EmpresaLogo from './EmpresaLogo';

interface PortraitLayoutProps {
  volumeData: any;
  volumeNumber: number;
  totalVolumes: number;
  isMae: boolean;
  isQuimico: boolean;
  displayCidade: string;
  getClassificacaoText: () => string;
  transportadoraLogo?: string;
}

const PortraitLayout: React.FC<PortraitLayoutProps> = ({
  volumeData,
  volumeNumber,
  totalVolumes,
  isMae,
  isQuimico,
  displayCidade,
  getClassificacaoText,
  transportadoraLogo
}) => {
  return (
    <div className="flex flex-col space-y-3 h-full">
      {/* Header - Logo da Empresa */}
      <div className="bg-gray-50 p-2 rounded border text-center">
        <EmpresaLogo className="max-h-10 mx-auto object-contain" fallbackText="SUA EMPRESA" />
      </div>

      {/* Tipo de Etiqueta */}
      <div className={`text-center py-2 px-3 rounded text-white font-bold ${isMae ? 'bg-red-600' : 'bg-blue-600'}`}>
        <span className="text-lg">
          {isMae ? 'ETIQUETA MÃE' : `VOLUME ${volumeNumber}/${totalVolumes}`}
        </span>
      </div>

      {/* Logo da Transportadora */}
      {transportadoraLogo && (
        <div className="flex justify-center py-1">
          <div className="bg-white p-1 rounded border">
            <img 
              src={transportadoraLogo} 
              alt="Logo Transportadora" 
              className="object-contain max-h-8"
            />
          </div>
        </div>
      )}

      {/* QR Code */}
      <div className="flex justify-center py-1">
        <div className="text-center bg-white p-2 rounded border">
          <QRCodeGenerator text={volumeData.id || 'VOL001'} size={60} />
          <div className="text-xs font-bold mt-1">{volumeData.id || 'VOL001'}</div>
        </div>
      </div>

      {/* Nota Fiscal */}
      <div className="bg-yellow-100 border-2 border-yellow-500 rounded p-3 text-center">
        <div className="text-sm text-yellow-700 font-bold">NOTA FISCAL</div>
        <div className="text-2xl font-black text-yellow-900">{volumeData.notaFiscal || volumeData.chaveNF || 'NF123456'}</div>
      </div>

      {/* Cidade Destino */}
      <div className="bg-green-100 border-2 border-green-500 rounded p-3 text-center">
        <div className="text-sm text-green-700 font-bold">CIDADE DESTINO</div>
        <div className="text-xl font-black text-green-900 leading-tight">{displayCidade}</div>
        <div className="text-lg font-bold text-green-800">{volumeData.uf || 'UF'}</div>
      </div>

      {/* Remetente */}
      <div className="bg-blue-100 border-2 border-blue-500 rounded p-3">
        <div className="text-sm text-blue-700 font-bold">REMETENTE</div>
        <div className="text-lg font-black text-blue-900 leading-tight">{volumeData.remetente || 'REMETENTE'}</div>
      </div>

      {/* Quantidade de Volumes (para etiqueta mãe) */}
      {isMae && (
        <div className="bg-purple-100 border-2 border-purple-500 rounded p-3 text-center">
          <div className="text-sm text-purple-700 font-bold">QUANTIDADE DE VOLUMES</div>
          <div className="text-2xl font-black text-purple-900">{totalVolumes || 1}</div>
        </div>
      )}

      {/* Destinatário */}
      <div className="bg-purple-100 border-2 border-purple-400 rounded p-2">
        <div className="text-xs text-purple-700 font-bold">DESTINATÁRIO</div>
        <div className="text-sm font-bold text-purple-900 leading-tight">{volumeData.destinatario || 'DESTINATÁRIO'}</div>
      </div>

      {/* Informações Químicas */}
      {isQuimico && (
        <div className="bg-red-100 border-2 border-red-500 rounded p-2 mt-auto">
          <div className="text-center">
            <div className="text-sm font-bold text-red-600">PRODUTO QUÍMICO</div>
            <div className="text-xs">
              <div><span className="font-bold">ONU:</span> {volumeData.codigoONU || 'N/A'}</div>
              <div><span className="font-bold">RISCO:</span> {volumeData.codigoRisco || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortraitLayout;
