
import React from 'react';
import { Card } from '@/components/ui/card';
import { QrCode, Biohazard, TestTube } from 'lucide-react';
import TransulLogo from './TransulLogo';
import EmpresaLogo from './EmpresaLogo';
import { getClassificacaoText, getDisplayCidade } from './utils';

interface TransulEnhancedLayoutProps {
  volumeData: any;
  volumeNumber?: number;
  totalVolumes?: number;
  isMae?: boolean;
  isQuimico?: boolean;
  displayCidade?: string;
  getClassificacaoText?: () => string;
  transportadoraLogo?: string;
}

const TransulEnhancedLayout: React.FC<TransulEnhancedLayoutProps> = ({
  volumeData,
  volumeNumber = 1,
  totalVolumes = 1,
  isMae = false,
  isQuimico = false,
  displayCidade,
  transportadoraLogo
}) => {
  return (
    <div className="p-4 space-y-4">
      {/* Header com Logo da Transul */}
      <div className="flex items-center justify-between border-b-2 border-gray-300 pb-3">
        <div className="flex items-center space-x-4">
          <EmpresaLogo className="max-h-12 object-contain" />
          <div className="border-l-2 border-gray-300 pl-4">
            <TransulLogo 
              className="object-contain"
              style={{ width: '120px', height: '40px' }}
            />
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">
            {isMae ? 'ETIQUETA MÃE' : `VOLUME ${volumeNumber}/${totalVolumes}`}
          </div>
          <div className="text-xs text-gray-500">
            {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Informações principais em grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Coluna 1: QR Code e Código */}
        <div className="flex flex-col items-center space-y-3">
          <div className="bg-white p-3 rounded border-2 border-gray-300">
            <QrCode size={80} className="mx-auto" />
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">CÓDIGO</div>
            <div className="text-xl font-black font-mono">{volumeData.codigo || volumeData.id}</div>
          </div>
        </div>

        {/* Coluna 2: Informações de Transporte */}
        <div className="space-y-4">
          {/* Nota Fiscal */}
          <div className="bg-yellow-100 border-3 border-yellow-500 rounded-lg p-4 text-center">
            <div className="text-sm text-yellow-700 font-bold">NOTA FISCAL</div>
            <div className="text-3xl font-black text-yellow-900">
              {volumeData.chave_nf || volumeData.notaFiscal || 'N/A'}
            </div>
          </div>

          {/* Peso */}
          <div className="bg-blue-100 border-2 border-blue-500 rounded-lg p-3 text-center">
            <div className="text-sm text-blue-700 font-bold">PESO TOTAL</div>
            <div className="text-xl font-bold text-blue-900">
              {volumeData.peso_total_bruto || volumeData.pesoTotal || '0 Kg'}
            </div>
          </div>

          {/* Tipo de Volume */}
          {isQuimico && (
            <div className="bg-red-100 border-2 border-red-500 rounded-lg p-3">
              <div className="flex items-center justify-center space-x-2">
                <TestTube size={20} className="text-red-600" />
                <span className="text-sm font-bold text-red-600">PRODUTO QUÍMICO</span>
                <Biohazard size={20} className="text-red-600" />
              </div>
              {volumeData.codigo_onu && (
                <div className="mt-2 text-center text-sm">
                  <div><span className="font-bold">ONU:</span> {volumeData.codigo_onu}</div>
                  {volumeData.codigo_risco && (
                    <div><span className="font-bold">RISCO:</span> {volumeData.codigo_risco}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Coluna 3: Destino e Remetente */}
        <div className="space-y-4">
          {/* Cidade Destino */}
          <div className="bg-green-100 border-3 border-green-500 rounded-lg p-4 text-center">
            <div className="text-sm text-green-700 font-bold">CIDADE DESTINO</div>
            <div className="text-2xl font-black text-green-900 leading-tight">
              {displayCidade || `${volumeData.cidade || 'N/A'} - ${volumeData.uf || ''}`}
            </div>
          </div>

          {/* Remetente */}
          <div className="bg-purple-100 border-2 border-purple-500 rounded-lg p-3">
            <div className="text-sm text-purple-700 font-bold">REMETENTE</div>
            <div className="text-lg font-bold text-purple-900 leading-tight">
              {volumeData.remetente || 'N/A'}
            </div>
          </div>

          {/* Destinatário */}
          <div className="bg-gray-100 border-2 border-gray-400 rounded-lg p-3">
            <div className="text-sm text-gray-700 font-bold">DESTINATÁRIO</div>
            <div className="text-base font-bold text-gray-900 leading-tight">
              {volumeData.destinatario || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Footer com informações adicionais */}
      <div className="border-t-2 border-gray-300 pt-3">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Endereço:</span>
            <div className="font-medium">{volumeData.endereco || 'N/A'}</div>
          </div>
          <div>
            <span className="text-gray-600">Área:</span>
            <div className="font-medium">{volumeData.area || 'N/A'}</div>
          </div>
          <div>
            <span className="text-gray-600">Descrição:</span>
            <div className="font-medium">{volumeData.descricao || 'N/A'}</div>
          </div>
          <div>
            <span className="text-gray-600">Qtd:</span>
            <div className="font-medium">{volumeData.quantidade || '1'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransulEnhancedLayout;
