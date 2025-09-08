
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SolicitacaoFormHeaderProps } from './types';

const SolicitacaoFormHeader: React.FC<SolicitacaoFormHeaderProps> = ({
  currentStep = 1,
  isLoading = false,
  tipoFrete = 'FOB',
  dataColeta = '',
  horaColeta = '',
  dataAprovacao,
  horaAprovacao,
  dataInclusao,
  horaInclusao,
  readOnly = false,
  onTipoFreteChange,
  onDataColetaChange,
  onHoraColetaChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tipo de Frete (FOB/CIF) */}
        <div>
          <Label htmlFor="tipoFrete" className="text-xs text-gray-600">
            Tipo de Frete
          </Label>
          <Select
            value={tipoFrete}
            onValueChange={(value) => onTipoFreteChange?.(value as 'FOB' | 'CIF')}
            disabled={isLoading || readOnly}
          >
            <SelectTrigger id="tipoFrete" className="mt-1">
              <SelectValue placeholder="Selecione o tipo de frete" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FOB">FOB (Por conta do destinatário)</SelectItem>
              <SelectItem value="CIF">CIF (Por conta do remetente)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Coleta Field */}
        <div>
          <Label htmlFor="dataColeta" className="text-xs text-gray-600">
            Data da Coleta
          </Label>
          <Input 
            id="dataColeta"
            type="date" 
            value={dataColeta} 
            onChange={(e) => onDataColetaChange?.(e.target.value)}
            className="mt-1"
            disabled={isLoading || readOnly}
          />
        </div>

        {/* Hora Coleta Field */}
        <div>
          <Label htmlFor="horaColeta" className="text-xs text-gray-600">
            Hora da Coleta
          </Label>
          <Input 
            id="horaColeta"
            type="time" 
            value={horaColeta || ''} 
            onChange={(e) => onHoraColetaChange?.(e.target.value)}
            className="mt-1"
            disabled={isLoading || readOnly}
          />
        </div>
      </div>

      {/* Display Approval and Inclusion dates if available */}
      {(dataAprovacao || dataInclusao) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 bg-gray-50 p-2 rounded text-xs">
          {dataInclusao && (
            <>
              <div>
                <span className="text-gray-500">Data de Inclusão:</span>
                <span className="ml-1 font-medium">{dataInclusao}</span>
              </div>
              {horaInclusao && (
                <div>
                  <span className="text-gray-500">Hora de Inclusão:</span>
                  <span className="ml-1 font-medium">{horaInclusao}</span>
                </div>
              )}
            </>
          )}
          
          {dataAprovacao && (
            <>
              <div>
                <span className="text-gray-500">Data de Aprovação:</span>
                <span className="ml-1 font-medium">{dataAprovacao}</span>
              </div>
              {horaAprovacao && (
                <div>
                  <span className="text-gray-500">Hora de Aprovação:</span>
                  <span className="ml-1 font-medium">{horaAprovacao}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SolicitacaoFormHeader;
