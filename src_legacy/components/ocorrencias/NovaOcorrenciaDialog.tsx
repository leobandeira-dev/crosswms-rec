
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'lucide-react';

interface NovaOcorrenciaDialogProps {
  onClose: () => void;
  onLinkDocument: () => void;
}

const NovaOcorrenciaDialog: React.FC<NovaOcorrenciaDialogProps> = ({ onClose, onLinkDocument }) => {
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Registrar Nova Ocorrência</DialogTitle>
        <DialogDescription>
          Preencha os dados para registrar uma nova ocorrência de SAC.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="cliente">Cliente *</Label>
          <Select>
            <SelectTrigger id="cliente">
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="abc">Indústria ABC Ltda</SelectItem>
              <SelectItem value="xyz">Distribuidora XYZ</SelectItem>
              <SelectItem value="beta">Farmacêutica Beta</SelectItem>
              <SelectItem value="tech">Eletrônicos Tech</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nf">Nota Fiscal *</Label>
            <Input id="nf" placeholder="Número da NF" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Ocorrência *</Label>
            <Select>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="extravio">Extravio</SelectItem>
                <SelectItem value="avaria">Avaria</SelectItem>
                <SelectItem value="atraso">Atraso</SelectItem>
                <SelectItem value="divergencia">Divergência</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="data-ocorrencia">Data da Ocorrência *</Label>
            <Input id="data-ocorrencia" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prioridade">Prioridade *</Label>
            <Select>
              <SelectTrigger id="prioridade">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="doc-vinculo">Vincular ao Documento</Label>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex justify-between items-center" 
              onClick={onLinkDocument}
            >
              <span>Selecionar documento</span>
              <Link className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="valor">Valor do Prejuízo (R$)</Label>
            <Input id="valor" placeholder="0,00" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição Detalhada *</Label>
          <Textarea 
            id="descricao" 
            placeholder="Descreva a ocorrência com detalhes" 
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="evidencias">Evidências (Fotos/Documentos)</Label>
          <Input id="evidencias" type="file" multiple accept="image/*,application/pdf" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contato-cliente">Contato para Retorno</Label>
          <Input id="contato-cliente" placeholder="Nome e telefone/email para retorno" />
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button className="bg-cross-blue hover:bg-cross-blueDark">Registrar Ocorrência</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default NovaOcorrenciaDialog;
