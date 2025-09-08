
import React from 'react';
import { TestTube, Biohazard } from 'lucide-react';
import QRCodeGenerator from '../QRCodeGenerator';
import { EtiquetaLayoutProps } from './types';

interface PortraitContrastLayoutProps extends EtiquetaLayoutProps {
  transportadoraLogo?: string;
}

const PortraitContrastLayout: React.FC<PortraitContrastLayoutProps> = ({
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
    <div className="h-full flex flex-col p-4">
      {/* Ícone químico se aplicável */}
      {isQuimico && (
        <div className="absolute top-3 right-3 bg-red-100 border-2 border-red-500 rounded-full p-2">
          <Biohazard size={32} className="text-red-600" />
        </div>
      )}
      
      {/* Header */}
      <div className="text-center text-lg font-bold border-b-2 border-gray-300 pb-2 mb-4">
        {transportadoraLogo ? (
          <div className="flex justify-center">
            <img 
              src={transportadoraLogo} 
              alt="Logo Transportadora" 
              className="max-h-12 object-contain"
              style={{ width: 'auto', height: '48px', maxWidth: '200px' }}
            />
          </div>
        ) : (
          isMae ? 'ETIQUETA MÃE' : (volumeData.transportadora || 'TRANSPORTADORA')
        )}
      </div>
      
      {/* Volume - DESTAQUE COM ALTO CONTRASTE EXTREMAMENTE MAIOR E MAIS VISÍVEL NO TOPO */}
      {!isMae && volumeNumber && totalVolumes && (
        <div className="text-xl mb-6 bg-black text-white p-8 rounded-lg font-bold text-center border-4 border-gray-900 shadow-xl">
          <div className="text-2xl font-bold mb-4">VOLUME</div>
          <div className="text-9xl font-black leading-none">{volumeNumber}/{totalVolumes}</div>
        </div>
      )}
      
      {/* Seção principal de informações */}
      <div className="flex-1">
        <div className="text-sm mb-2">
          <span className="font-bold">ID:</span> {volumeData.id}
        </div>
        
        <div className="text-sm mb-2 bg-black text-white p-2 rounded">
          <span className="font-bold">NF:</span> {volumeData.notaFiscal || 'N/A'}
        </div>
        
        <div className="text-lg mb-2 bg-black text-white p-2 rounded font-bold">
          <span className="font-bold">Remetente:</span> {volumeData.remetente || 'N/A'}
        </div>
        
        <div className="text-sm mb-2">
          <span className="font-bold">Destinatário:</span> {volumeData.destinatario || 'N/A'}
        </div>
        
        <div className="text-sm mb-2">
          <span className="font-bold">Endereço:</span> {volumeData.endereco || 'N/A'}
        </div>
        
        <div className="text-xl mb-4 bg-black text-white p-2 rounded font-bold text-center">
          {displayCidade}/{volumeData.uf || 'N/A'}
        </div>
        
        <div className="text-sm mb-2">
          <span className="font-bold">Peso:</span> {volumeData.pesoTotal || '0 Kg'}
        </div>
        
        {/* Quantidade - DESTAQUE COM ALTO CONTRASTE MUITO MAIOR com fonte aumentada em 100% */}
        {volumeData.quantidade && (
          <div className="text-xl mb-4 bg-black text-white p-4 rounded font-bold text-center border-4 border-gray-800">
            <span className="font-bold text-2xl">Quantidade:</span> 
            <span className="text-8xl font-black ml-2">{volumeData.quantidade}</span>
          </div>
        )}
        
        {isQuimico && (
          <>
            <div className="text-sm mb-2 bg-red-100 p-2 rounded">
              <span className="font-bold">Código ONU:</span> {volumeData.codigoONU || 'N/A'}
            </div>
            <div className="text-sm mb-2 bg-red-100 p-2 rounded">
              <span className="font-bold">Código de Risco:</span> {volumeData.codigoRisco || 'N/A'}
            </div>
            <div className="text-sm mb-2 bg-red-100 p-2 rounded">
              <span className="font-bold">Classificação:</span> {getClassificacaoText()}
            </div>
          </>
        )}
      </div>
      
      {/* QR Code e Área */}
      <div className="text-center">
        <QRCodeGenerator text={volumeData.id} size={120} />
        <div className="text-xs mt-2 font-bold">{volumeData.id}</div>
        
        {/* Área - APENAS O NÚMERO, DESTAQUE COM ALTO CONTRASTE MUITO MAIOR E MAIS LEGÍVEL */}
        {volumeData.area && (
          <div className="mt-4 bg-black text-white p-6 rounded-lg text-center border-4 border-gray-900 shadow-lg">
            <div className="text-xl font-bold mb-3">ÁREA</div>
            <div className="text-8xl font-black leading-none">{volumeData.area}</div>
          </div>
        )}
      </div>
      
      {/* Quantidade de Volumes - DESTAQUE COM ALTO CONTRASTE MAIOR (para etiqueta mãe) com fonte aumentada em 100% */}
      {isMae && (
        <div className="text-xl mt-4 pt-2 border-t-2 border-gray-300 bg-black text-white p-4 rounded font-bold text-center border-4 border-gray-800">
          <span className="font-bold text-2xl">Total de volumes:</span> 
          <span className="text-8xl font-black ml-2">{volumeData.quantidade || '0'}</span>
        </div>
      )}
    </div>
  );
};

export default PortraitContrastLayout;
