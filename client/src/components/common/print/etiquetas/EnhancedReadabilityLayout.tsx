
import React from 'react';
import { Card } from '@/components/ui/card';
import QRCodeGenerator from '../QRCodeGenerator';
import EmpresaLogo from './EmpresaLogo';

interface EnhancedReadabilityLayoutProps {
  volumeData: any;
  volumeNumber: number;
  totalVolumes: number;
  isMae: boolean;
  isQuimico: boolean;
  displayCidade: string;
  getClassificacaoText: () => string;
  transportadoraLogo?: string;
}

const EnhancedReadabilityLayout: React.FC<EnhancedReadabilityLayoutProps> = ({
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
    <div className="grid grid-cols-3 gap-4 h-full">
      {/* Coluna 1: Informações do Remetente e NF */}
      <div className="flex flex-col space-y-3">
        {/* Logo da Empresa */}
        <div className="bg-gray-50 p-2 rounded border">
          <EmpresaLogo className="max-h-12 mx-auto object-contain" fallbackText="SUA EMPRESA" />
        </div>

        {/* Remetente */}
        <div className="bg-blue-100 p-3 rounded border-2 border-blue-400">
          <div className="text-xs text-blue-700 font-bold">REMETENTE</div>
          <div className="font-bold text-lg leading-tight">{volumeData.remetente || 'REMETENTE'}</div>
        </div>
        
        {/* Nota Fiscal */}
        <div className="bg-yellow-200 p-4 rounded border-2 border-yellow-500 text-center">
          <div className="text-sm font-bold text-yellow-800">NOTA FISCAL</div>
          <div className="text-3xl font-black text-yellow-900">{volumeData.notaFiscal || volumeData.chaveNF || 'NF123456'}</div>
        </div>
        
        {/* Transportadora */}
        <div className="bg-gray-100 p-2 rounded">
          <div className="text-xs text-gray-600">TRANSPORTADORA</div>
          {transportadoraLogo ? (
            <img 
              src={transportadoraLogo} 
              alt="Logo Transportadora" 
              className="max-h-8 object-contain mt-1"
            />
          ) : (
            <div className="font-bold">{volumeData.transportadora || 'TRANSPORTADORA'}</div>
          )}
        </div>
      </div>
      
      {/* Coluna 2: Destinatário e destino */}
      <div className="flex flex-col space-y-3">
        {/* Destinatário */}
        <div className="bg-gray-100 p-3 rounded">
          <div className="text-xs text-gray-600">DESTINATÁRIO</div>
          <div className="font-bold text-lg">{volumeData.destinatario || 'DESTINATÁRIO'}</div>
          <div className="text-sm">{volumeData.endereco || 'Endereço'}</div>
        </div>
        
        {/* Destino */}
        <div className="bg-green-200 p-4 rounded border-2 border-green-500 text-center">
          <div className="text-sm font-bold text-green-800">DESTINO</div>
          <div className="text-2xl font-black text-green-900">{displayCidade}</div>
          <div className="text-lg font-bold text-green-800">{volumeData.uf || 'UF'}</div>
        </div>
        
        {/* QR Code */}
        <div className="flex flex-col items-center justify-center bg-white p-3 rounded border">
          <QRCodeGenerator text={volumeData.id || 'VOL001'} size={80} />
          <div className="text-sm mt-2 font-mono font-bold">{volumeData.id || 'VOL001'}</div>
        </div>
      </div>
      
      {/* Coluna 3: Volume e informações */}
      <div className="flex flex-col space-y-3">
        {/* Número do volume ou quantidade */}
        {isMae ? (
          <div className="bg-red-200 p-4 rounded border-2 border-red-500 text-center">
            <div className="text-sm font-bold text-red-800">QTD VOLUMES</div>
            <div className="text-3xl font-black text-red-900">{totalVolumes || 1}</div>
          </div>
        ) : (
          <div className="text-center bg-blue-200 p-3 border-2 border-blue-500 rounded">
            <div className="text-sm">VOLUME</div>
            <div className="font-bold text-3xl">{volumeNumber}/{totalVolumes}</div>
          </div>
        )}
        
        {/* Peso */}
        <div className="bg-gray-100 p-2 rounded">
          <div className="text-xs text-gray-600">PESO TOTAL</div>
          <div className="font-bold text-xl">{volumeData.pesoTotal || '0.0'} Kg</div>
        </div>
        
        {/* Classificação Química se aplicável */}
        {isQuimico && (
          <div className="bg-red-100 p-3 border-2 border-red-500 rounded">
            <div className="text-sm font-bold text-red-700">PRODUTO QUÍMICO</div>
            <div className="text-sm">
              <div><span className="font-bold">ONU:</span> {volumeData.codigoONU || 'N/A'}</div>
              <div><span className="font-bold">RISCO:</span> {volumeData.codigoRisco || 'N/A'}</div>
            </div>
          </div>
        )}
        
        {/* Área */}
        {volumeData.area && (
          <div className="bg-purple-100 p-2 rounded border border-purple-400">
            <div className="text-xs text-purple-700">ÁREA</div>
            <div className="font-bold text-purple-900">{volumeData.area}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedReadabilityLayout;
