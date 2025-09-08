
import React, { useState, useMemo } from 'react';
import { SolicitacaoFormData } from './SolicitacaoTypes';
import { Card, CardContent } from '@/components/ui/card';
import NotasFiscaisManager from '../NotasFiscaisManager';
import ImportacaoTabs from './ImportacaoTabs';
import EmpresaInfoForm from './EmpresaInfoForm';
import { SolicitacaoFormHeader } from './formHeader';
import { convertDadosToEmpresaInfo, convertEmpresaInfoToDados } from './empresa/empresaUtils';
import { calcularTotaisColeta } from '../../utils/volumes/calculations';

interface NotasFiscaisStepProps {
  formData: SolicitacaoFormData;
  handleInputChange: <K extends keyof SolicitacaoFormData>(field: K, value: SolicitacaoFormData[K]) => void;
  handleImportSuccess: (notasFiscais: any[], remetenteInfo?: any, destinatarioInfo?: any) => void;
  isImporting?: boolean;
}

const NotasFiscaisStep: React.FC<NotasFiscaisStepProps> = ({ 
  formData, 
  handleInputChange, 
  handleImportSuccess,
  isImporting = false
}) => {
  const [activeTab, setActiveTab] = useState('unica');

  // Calculate totals from all invoices for header display using the proper calculation function
  const totais = useMemo(() => {
    return calcularTotaisColeta(formData.notasFiscais);
  }, [formData.notasFiscais]);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-4">Cabeçalho da Solicitação</h3>
          <SolicitacaoFormHeader 
            tipoFrete={formData.tipoFrete}
            dataColeta={formData.dataColeta}
            horaColeta={formData.horaColeta}
            onTipoFreteChange={(tipo) => handleInputChange('tipoFrete', tipo)}
            onDataColetaChange={(data) => handleInputChange('dataColeta', data)}
            onHoraColetaChange={(hora) => handleInputChange('horaColeta', hora)}
          />
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-50 p-3 rounded">
              <span className="block text-xs text-gray-500">Valor Total</span>
              <span className="text-lg font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totais.valorTotal || 0)}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="block text-xs text-gray-500">Peso Total</span>
              <span className="text-lg font-semibold">{totais.pesoTotal.toFixed(2)} kg</span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="block text-xs text-gray-500">Volume Total</span>
              <span className="text-lg font-semibold">{totais.volumeTotal.toFixed(3)} m³ ({totais.qtdVolumes} volumes)</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4">Dados do Remetente</h3>
            <EmpresaInfoForm
              tipo="remetente"
              dados={formData.remetente ? convertEmpresaInfoToDados(formData.remetente) : undefined}
              onDadosChange={(dados) => handleInputChange('remetente', convertDadosToEmpresaInfo(dados))}
              label="Remetente"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4">Dados do Destinatário</h3>
            <EmpresaInfoForm
              tipo="destinatario"
              dados={formData.destinatario ? convertEmpresaInfoToDados(formData.destinatario) : undefined}
              onDadosChange={(dados) => handleInputChange('destinatario', convertDadosToEmpresaInfo(dados))}
              label="Destinatário"
            />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-4">Importação de Notas Fiscais</h3>
          <ImportacaoTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onImportSuccess={handleImportSuccess}
            isLoading={isImporting}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <NotasFiscaisManager 
            notasFiscais={formData.notasFiscais}
            onChangeNotasFiscais={(notasFiscais) => handleInputChange('notasFiscais', notasFiscais)}
            isLoading={isImporting}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NotasFiscaisStep;
