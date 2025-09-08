
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SolicitacaoFormHeader } from './formHeader';
import { NotaFiscalVolume } from '../../utils/volumes/types';
import { InternalFormData } from './hooks/solicitacaoFormTypes';
import NotasFiscaisManager from '../NotasFiscaisManager';
import { formatarNumero } from '../../utils/volumes/formatters';
import { calcularTotaisColeta } from '../../utils/volumes/calculations';

interface SolicitacaoViewerProps {
  formData: InternalFormData;
  readOnly?: boolean;
  showHeader?: boolean;
  showActions?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onAllocate?: () => void;
}

const SolicitacaoViewer: React.FC<SolicitacaoViewerProps> = ({
  formData,
  readOnly = true,
  showHeader = true,
  showActions = false,
  onApprove,
  onReject,
  onAllocate
}) => {
  // Calculate totals from all invoices
  const totais = calcularTotaisColeta(formData.notasFiscais || []);
  
  return (
    <div className="space-y-6">
      {showHeader && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4">Cabeçalho da Solicitação</h3>
            <SolicitacaoFormHeader 
              tipoFrete={formData.tipoFrete}
              dataColeta={formData.dataColeta}
              horaColeta={formData.horaColeta || ''}
              dataAprovacao={formData.dataAprovacao || ''}
              horaAprovacao={formData.horaAprovacao || ''}
              dataInclusao={formData.dataInclusao || ''}
              horaInclusao={formData.horaInclusao || ''}
              readOnly={readOnly}
              currentStep={1}
              isLoading={false}
            />
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-50 p-3 rounded">
                <span className="block text-xs text-gray-500">Valor Total</span>
                <span className="text-lg font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totais.valorTotal || 0)}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="block text-xs text-gray-500">Peso Total</span>
                <span className="text-lg font-semibold">{formatarNumero(totais.pesoTotal)} kg</span>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="block text-xs text-gray-500">Volume Total</span>
                <span className="text-lg font-semibold">{formatarNumero(totais.volumeTotal)} m³ ({totais.qtdVolumes} volumes)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4">Dados do Remetente</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Razão Social</span>
                <p className="font-medium">{formData.remetente?.razaoSocial || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">CNPJ</span>
                <p className="font-medium">{formData.remetente?.cnpj || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Endereço</span>
                <p className="font-medium">{formData.origemEndereco || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">CEP</span>
                <p className="font-medium">{formData.origemCEP || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4">Dados do Destinatário</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Razão Social</span>
                <p className="font-medium">{formData.destinatario?.razaoSocial || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">CNPJ</span>
                <p className="font-medium">{formData.destinatario?.cnpj || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Endereço</span>
                <p className="font-medium">{formData.destinoEndereco || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">CEP</span>
                <p className="font-medium">{formData.destinoCEP || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-4">Notas Fiscais</h3>
          <NotasFiscaisManager 
            notasFiscais={formData.notasFiscais || []}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>
      
      {formData.observacoes && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4">Observações</h3>
            <p className="text-gray-700 whitespace-pre-line">{formData.observacoes}</p>
          </CardContent>
        </Card>
      )}
      
      {showActions && (
        <div className="flex justify-end space-x-4">
          {onReject && (
            <button 
              onClick={onReject} 
              className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              Recusar
            </button>
          )}
          {onApprove && (
            <button 
              onClick={onApprove} 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Aprovar
            </button>
          )}
          {onAllocate && (
            <button 
              onClick={onAllocate} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Alocar Carga
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SolicitacaoViewer;
