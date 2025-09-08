import React from 'react';
import { EtiquetaLayoutProps } from './types';
import QuimicoIcon from './QuimicoIcon';

const AltaLegibilidadeContrasteLayout: React.FC<EtiquetaLayoutProps> = ({
  volumeData,
  volumeNumber,
  totalVolumes,
  isMae,
  isQuimico,
  displayCidade
}) => {
  const formatoSmall = false; // Will be determined by parent component

  return (
    <div className={`
      etiqueta bg-white border-2 border-gray-800 font-sans leading-tight
      ${formatoSmall ? 'w-[200px] h-[300px] text-xs' : 'w-[300px] h-[450px] text-sm'}
      relative overflow-hidden
    `}>
      {/* Header - Transportadora */}
      <div className="text-center border-b-2 border-gray-800 py-2 bg-gray-50">
        <div className={`font-bold ${formatoSmall ? 'text-sm' : 'text-lg'}`}>
          {volumeData.transportadora || 'Transportadora não especificada'}
        </div>
      </div>

      {/* ID and QR Code Row */}
      <div className="flex justify-between items-start p-2 border-b border-gray-300">
        <div className="flex-1">
          <div className={`font-medium ${formatoSmall ? 'text-xs' : 'text-sm'} mb-1`}>
            ID: {volumeData.id}
          </div>
          
          {/* NF - Black background with white text */}
          <div className="bg-black text-white px-3 py-2 rounded mb-2">
            <div className={`font-bold ${formatoSmall ? 'text-lg' : 'text-2xl'}`}>
              NF: {volumeData.notaFiscal}
            </div>
          </div>

          {/* Remetente - Black background with white text */}
          <div className="bg-black text-white px-3 py-2 rounded mb-2">
            <div className={`font-bold ${formatoSmall ? 'text-xs' : 'text-sm'}`}>
              Remetente: {volumeData.remetente}
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="ml-2 text-center">
          <div className={`bg-gray-200 border-2 border-gray-400 ${formatoSmall ? 'w-16 h-16' : 'w-20 h-20'} flex items-center justify-center mb-1`}>
            <div className={`font-mono ${formatoSmall ? 'text-xs' : 'text-sm'}`}>QR</div>
          </div>
          <div className={`${formatoSmall ? 'text-xs' : 'text-sm'} font-mono`}>
            {volumeData.id}
          </div>
        </div>
      </div>

      {/* Destinatário and Address */}
      <div className="px-2 py-1 border-b border-gray-300">
        <div className={`${formatoSmall ? 'text-xs' : 'text-sm'} mb-1`}>
          <span className="font-medium">Destinatário:</span> {volumeData.destinatario}
        </div>
        <div className={`${formatoSmall ? 'text-xs' : 'text-sm'} mb-1`}>
          <span className="font-medium">Endereço:</span> {volumeData.endereco}
        </div>
        
        {/* Cidade/UF - Black background with white text */}
        <div className="bg-black text-white px-3 py-2 rounded">
          <div className={`font-bold ${formatoSmall ? 'text-sm' : 'text-lg'}`}>
            Cidade/UF: {displayCidade}
          </div>
        </div>
      </div>

      {/* Bottom Section with Area and Details */}
      <div className="flex justify-between items-end p-2">
        <div className="flex-1">
          <div className={`${formatoSmall ? 'text-xs' : 'text-sm'} mb-1`}>
            <span className="font-medium">Peso:</span> {volumeData.pesoTotal}
          </div>
          <div className={`${formatoSmall ? 'text-xs' : 'text-sm'} mb-1`}>
            <span className="font-medium">Transportadora:</span> {volumeData.transportadora || 'Transportadora não especificada'}
          </div>
          <div className={`${formatoSmall ? 'text-xs' : 'text-sm'}`}>
            <span className="font-medium">Descrição:</span> Volume {volumeNumber}/{totalVolumes}
          </div>
        </div>

        {/* Area - Large black box with white text */}
        <div className="bg-black text-white rounded-lg flex flex-col items-center justify-center ml-2">
          <div className={`px-4 py-3 ${formatoSmall ? 'min-w-[60px] min-h-[60px]' : 'min-w-[80px] min-h-[80px]'} flex flex-col items-center justify-center`}>
            <div className={`font-bold ${formatoSmall ? 'text-xs' : 'text-sm'} mb-1`}>ÁREA</div>
            <div className={`font-bold ${formatoSmall ? 'text-2xl' : 'text-4xl'}`}>
              {volumeData.area?.replace('Área ', '') || '01'}
            </div>
          </div>
        </div>
      </div>

      {/* Dangerous Goods Indicator */}
      {isQuimico && (
        <div className="absolute top-2 right-2">
          <QuimicoIcon />
        </div>
      )}
    </div>
  );
};

export default AltaLegibilidadeContrasteLayout;