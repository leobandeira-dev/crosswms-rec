
import React from 'react';
import { NotaFiscalVolume } from '../../../utils/volumeCalculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash } from 'lucide-react';

interface NotaFiscalHeaderProps {
  nf: NotaFiscalVolume;
  onRemove: () => void;
  onUpdateNumeroNF: (numeroNF: string) => void;
  onUpdateRemetente: (remetente: string) => void;
  onUpdateDestinatario: (destinatario: string) => void;
  onUpdateValorTotal: (valorTotal: string) => void;
  onUpdatePesoTotal: (pesoTotal: string) => void;
  isReadOnly?: boolean;
}

const NotaFiscalHeader: React.FC<NotaFiscalHeaderProps> = ({
  nf,
  onRemove,
  onUpdateNumeroNF,
  onUpdateRemetente,
  onUpdateDestinatario,
  onUpdateValorTotal,
  onUpdatePesoTotal,
  isReadOnly = false
}) => {
  // Format date if available
  const formattedDate = nf.dataEmissao ? 
    new Date(nf.dataEmissao).toLocaleDateString('pt-BR') : '';
    
  return (
    <div className="flex justify-between">
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Nº Nota Fiscal</label>
            <Input
              value={nf.numeroNF}
              onChange={(e) => onUpdateNumeroNF(e.target.value)}
              className="mt-1"
              placeholder="Número da NF"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Remetente</label>
            <Input
              value={nf.remetente}
              onChange={(e) => onUpdateRemetente(e.target.value)}
              className="mt-1"
              placeholder="Remetente"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Destinatário</label>
            <Input
              value={nf.destinatario}
              onChange={(e) => onUpdateDestinatario(e.target.value)}
              className="mt-1"
              placeholder="Destinatário"
              disabled={isReadOnly}
            />
          </div>
        </div>
        <div className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Valor Total (R$)</label>
              <Input
                value={nf.valorTotal.toString()}
                onChange={(e) => onUpdateValorTotal(e.target.value)}
                className="mt-1"
                placeholder="Valor total"
                type="number"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Peso Total (kg)</label>
              <Input
                value={(nf.pesoTotal || 0).toString()}
                onChange={(e) => onUpdatePesoTotal(e.target.value)}
                className="mt-1"
                placeholder="Peso total"
                type="number"
                disabled={isReadOnly}
              />
            </div>
            {nf.dataEmissao && (
              <div>
                <label className="text-xs text-muted-foreground">Data de Emissão</label>
                <Input
                  value={formattedDate}
                  className="mt-1"
                  readOnly
                />
              </div>
            )}
          </div>
          
          {nf.chaveNF && (
            <div className="mt-3">
              <label className="text-xs text-muted-foreground">Chave da NF</label>
              <Input
                value={nf.chaveNF}
                className="mt-1 font-mono text-xs"
                readOnly
              />
            </div>
          )}
        </div>
      </div>
      <Button variant="destructive" size="sm" onClick={onRemove} disabled={isReadOnly}>
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default NotaFiscalHeader;
