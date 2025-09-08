
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { InternalFormData } from './hooks/solicitacaoFormTypes';
import { formatarNumero } from '../../utils/volumes/formatters';
import { calcularTotaisColeta } from '../../utils/volumes/calculations';

interface ConfirmationStepProps {
  formData: InternalFormData;
  handleInputChange: (field: keyof InternalFormData, value: any) => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ formData, handleInputChange }) => {
  const totais = calcularTotaisColeta(formData.notasFiscais);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-4">Observações</h3>
          <p className="text-sm text-gray-600 mb-3">
            Adicione informações importantes sobre esta solicitação de coleta
          </p>
          <Textarea
            placeholder="Observações sobre a coleta..."
            value={formData.observacoes}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            rows={5}
            className="w-full"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-4">Resumo da Solicitação</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-md mb-2">Informações da Coleta</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 text-gray-600">Tipo de Frete:</td>
                    <td className="py-2 font-medium">{formData.tipoFrete}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-gray-600">Origem:</td>
                    <td className="py-2 font-medium">{formData.origem}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-gray-600">Destino:</td>
                    <td className="py-2 font-medium">{formData.destino}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-gray-600">Data da Coleta:</td>
                    <td className="py-2 font-medium">
                      {formData.dataColeta}
                      {formData.horaColeta ? ` às ${formData.horaColeta}` : ''}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div>
              <h4 className="font-medium text-md mb-2">Volumes e Notas Fiscais</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 text-gray-600">Notas Fiscais:</td>
                    <td className="py-2 font-medium">{formData.notasFiscais.length}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-gray-600">Total de Volumes:</td>
                    <td className="py-2 font-medium">{totais.qtdVolumes}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-gray-600">Peso Total:</td>
                    <td className="py-2 font-medium">{formatarNumero(totais.pesoTotal)} kg</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-gray-600">Volume Total:</td>
                    <td className="py-2 font-medium">{formatarNumero(totais.volumeTotal)} m³</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-gray-600">Peso Cubado:</td>
                    <td className="py-2 font-medium">{formatarNumero(totais.pesoCubadoTotal)} kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmationStep;
