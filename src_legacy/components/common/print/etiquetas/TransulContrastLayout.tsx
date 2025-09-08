
import React from 'react';
import { EtiquetaLayoutProps } from './types';
import TransulLogo from './TransulLogo';

const TransulContrastLayout: React.FC<EtiquetaLayoutProps> = ({
  volumeData,
  volumeNumber,
  totalVolumes,
  isMae,
  isQuimico,
  displayCidade,
  getClassificacaoText
}) => {
  return (
    <div className="p-4 border-4 border-black bg-white relative min-h-[280px] font-bold text-black">
      {/* Header com Logo da Transul - Alto Contraste */}
      <div className="flex items-center justify-between border-b-4 border-black pb-2 mb-3 bg-yellow-300">
        <div className="flex items-center space-x-2">
          <TransulLogo 
            className="object-contain"
            style={{ width: '80px', height: '30px' }}
          />
        </div>
        <div className="text-sm font-black bg-black text-white px-2 py-1">
          {isMae ? 'ETIQUETA MÃE' : `VOLUME ${volumeNumber}/${totalVolumes}`}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        {/* QR Code */}
        <div className="flex flex-col items-center bg-black text-white p-3 rounded">
          <div className="w-16 h-16 bg-white mb-2 flex items-center justify-center">
            <span className="text-black text-xs font-black">QR</span>
          </div>
          <div className="text-xs font-black">{volumeData.id}</div>
        </div>

        {/* Nota Fiscal - Alto Contraste */}
        <div className="bg-black text-white border-4 border-black rounded p-3 text-center">
          <div className="text-xs font-black mb-1">NOTA FISCAL</div>
          <div className="text-2xl font-black">{volumeData.notaFiscal}</div>
        </div>

        {/* Cidade - Alto Contraste */}
        <div className="bg-black text-white border-4 border-black rounded p-3 text-center">
          <div className="text-xs font-black mb-1">DESTINO</div>
          <div className="text-lg font-black">{displayCidade.split(' - ')[0]}</div>
          <div className="text-sm font-black">{volumeData.uf}</div>
        </div>
      </div>

      {/* Informações adicionais - Alto Contraste */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white border-4 border-black rounded p-2">
          <span className="font-black">Remetente:</span>
          <div className="font-black text-lg">{volumeData.remetente}</div>
        </div>
        <div className="bg-white border-4 border-black rounded p-2">
          <span className="font-black">Peso:</span>
          <div className="font-black text-lg">{volumeData.pesoTotal}</div>
        </div>
      </div>

      {/* Destinatário - Alto Contraste */}
      <div className="mt-3 bg-gray-900 text-white border-4 border-black rounded p-2">
        <span className="font-black">Destinatário:</span>
        <div className="font-black text-lg">{volumeData.destinatario}</div>
        <div className="font-black">{volumeData.endereco}</div>
      </div>

      {/* Indicadores químicos - Alto Contraste */}
      {isQuimico && (
        <>
          <div className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded">
            <span className="text-xs font-black">QUÍMICO</span>
          </div>
          
          <div className="bg-red-600 text-white border-4 border-black rounded p-2 mt-3">
            <div className="flex items-center justify-center">
              <span className="text-sm font-black mr-2">⚠️ MATERIAL QUÍMICO ⚠️</span>
            </div>
            {volumeData.codigoONU && (
              <div className="text-center font-black">ONU: {volumeData.codigoONU}</div>
            )}
            {volumeData.codigoRisco && (
              <div className="text-center font-black">RISCO: {volumeData.codigoRisco}</div>
            )}
            <div className="text-center font-black">{getClassificacaoText()}</div>
          </div>
        </>
      )}

      {/* Área */}
      {volumeData.area && (
        <div className="absolute bottom-2 right-2 bg-black text-white px-3 py-1 rounded">
          <span className="font-black">ÁREA: {volumeData.area}</span>
        </div>
      )}
    </div>
  );
};

export default TransulContrastLayout;
