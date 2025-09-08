
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Package } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Ocorrencia, DocumentosMock } from '@/types/ocorrencias.types';
import { toast } from '@/hooks/use-toast';

interface LinkDocumentDialogProps {
  ocorrencia: Ocorrencia | null;
  documentosMock: DocumentosMock;
  onClose: () => void;
}

const LinkDocumentDialog: React.FC<LinkDocumentDialogProps> = ({ ocorrencia, documentosMock, onClose }) => {
  const [selectedDocumentType, setSelectedDocumentType] = useState('nota');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedNfs, setSelectedNfs] = useState<string[]>([]);
  const [showBatchOptions, setShowBatchOptions] = useState(false);

  const handleDocumentTypeChange = (type: string) => {
    setSelectedDocumentType(type);
    setSelectedDocument(null);
    setSelectedNfs([]);
    setShowBatchOptions(false);
  };

  const handleDocumentSelection = (docId: string) => {
    setSelectedDocument(docId);
    
    // If document has multiple NFs, show batch options
    if (selectedDocumentType !== 'nota') {
      const doc = documentosMock[selectedDocumentType === 'coleta' ? 'coletas' : 'ordens']
        .find(d => d.id === docId);
      
      if (doc && doc.notasFiscais && doc.notasFiscais.length > 1) {
        setShowBatchOptions(true);
        setSelectedNfs(doc.notasFiscais);
      } else {
        setShowBatchOptions(false);
        setSelectedNfs(doc?.notasFiscais || []);
      }
    }
  };

  const handleNfSelectionChange = (nfId: string, checked: boolean) => {
    if (checked) {
      setSelectedNfs(prev => [...prev, nfId]);
    } else {
      setSelectedNfs(prev => prev.filter(id => id !== nfId));
    }
  };

  const handleSelectAllNfs = (checked: boolean) => {
    if (selectedDocument && selectedDocumentType !== 'nota') {
      const doc = documentosMock[selectedDocumentType === 'coleta' ? 'coletas' : 'ordens']
        .find(d => d.id === selectedDocument);
      
      if (checked && doc) {
        setSelectedNfs(doc.notasFiscais || []);
      } else {
        setSelectedNfs([]);
      }
    }
  };

  const handleLinkConfirm = () => {
    if (ocorrencia) {
      if (selectedDocumentType === 'nota' && selectedDocument) {
        toast({
          title: "Documento vinculado",
          description: `Nota fiscal ${selectedDocument} vinculada à ocorrência ${ocorrencia.id}.`,
        });
      } else if (selectedNfs.length > 0) {
        toast({
          title: "Documento vinculado",
          description: `${selectedNfs.length} nota(s) fiscal(is) do documento ${selectedDocument} vinculada(s) à ocorrência ${ocorrencia.id}.`,
        });
      }
    }
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Vincular a Documento</DialogTitle>
        <DialogDescription>
          Selecione o documento que deseja vincular à ocorrência
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>Tipo de Documento</Label>
          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant={selectedDocumentType === 'nota' ? 'default' : 'outline'}
              className={selectedDocumentType === 'nota' ? 'bg-cross-blue hover:bg-cross-blueDark' : ''}
              onClick={() => handleDocumentTypeChange('nota')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Nota Fiscal
            </Button>
            <Button 
              type="button" 
              variant={selectedDocumentType === 'coleta' ? 'default' : 'outline'}
              className={selectedDocumentType === 'coleta' ? 'bg-cross-blue hover:bg-cross-blueDark' : ''}
              onClick={() => handleDocumentTypeChange('coleta')}
            >
              <Package className="mr-2 h-4 w-4" />
              Coleta
            </Button>
            <Button 
              type="button" 
              variant={selectedDocumentType === 'oc' ? 'default' : 'outline'}
              className={selectedDocumentType === 'oc' ? 'bg-cross-blue hover:bg-cross-blueDark' : ''}
              onClick={() => handleDocumentTypeChange('oc')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Ordem de Carregamento
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="documento">Selecionar {selectedDocumentType === 'nota' ? 'Nota Fiscal' : 
                                            selectedDocumentType === 'coleta' ? 'Coleta' :
                                            'Ordem de Carregamento'}</Label>
          <Select onValueChange={handleDocumentSelection}>
            <SelectTrigger id="documento">
              <SelectValue placeholder={`Selecione ${selectedDocumentType === 'nota' ? 'uma nota fiscal' : 
                                            selectedDocumentType === 'coleta' ? 'uma coleta' :
                                            'uma ordem de carregamento'}`} />
            </SelectTrigger>
            <SelectContent>
              {selectedDocumentType === 'nota' && documentosMock.notas.map(nota => (
                <SelectItem key={nota.id} value={nota.id}>
                  {nota.numero} - {nota.cliente}
                </SelectItem>
              ))}
              {selectedDocumentType === 'coleta' && documentosMock.coletas.map(coleta => (
                <SelectItem key={coleta.id} value={coleta.id}>
                  {coleta.numero} - {coleta.cliente} ({coleta.notasFiscais.length} NFs)
                </SelectItem>
              ))}
              {selectedDocumentType === 'oc' && documentosMock.ordens.map(ordem => (
                <SelectItem key={ordem.id} value={ordem.id}>
                  {ordem.numero} - {ordem.cliente} ({ordem.notasFiscais.length} NFs)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showBatchOptions && selectedNfs.length > 0 && (
          <div className="space-y-3 border rounded-md p-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Notas Fiscais Vinculadas ao Documento</h4>
              <div className="flex items-center">
                <Checkbox 
                  id="select-all" 
                  checked={selectedNfs.length === documentosMock[selectedDocumentType === 'coleta' ? 'coletas' : 'ordens']
                    .find(d => d.id === selectedDocument)?.notasFiscais.length}
                  onCheckedChange={handleSelectAllNfs}
                />
                <label htmlFor="select-all" className="ml-2 text-sm">
                  Selecionar todas
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
              {documentosMock[selectedDocumentType === 'coleta' ? 'coletas' : 'ordens']
                .find(d => d.id === selectedDocument)?.notasFiscais.map((nfId: string) => {
                const nf = documentosMock.notas.find(n => n.id === nfId);
                return (
                  <div key={nfId} className="flex items-center space-x-2 border rounded p-2">
                    <Checkbox 
                      id={`nf-${nfId}`} 
                      checked={selectedNfs.includes(nfId)}
                      onCheckedChange={(checked) => handleNfSelectionChange(nfId, !!checked)}
                    />
                    <label htmlFor={`nf-${nfId}`} className="flex-1 text-sm">
                      <div className="font-medium">{nf?.numero}</div>
                      <div className="text-xs text-gray-500">R$ {nf?.valor}</div>
                    </label>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {selectedDocumentType === 'nota' && selectedDocument && (
          <div className="space-y-2">
            <Label htmlFor="valor-prejuizo">Valor do Prejuízo (R$)</Label>
            <Input
              id="valor-prejuizo"
              placeholder="0,00"
              type="text"
            />
            <p className="text-xs text-gray-500">Informe o valor do prejuízo em caso de avarias, faltas ou outros danos.</p>
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button 
          className="bg-cross-blue hover:bg-cross-blueDark"
          onClick={handleLinkConfirm}
          disabled={!selectedDocument || (showBatchOptions && selectedNfs.length === 0)}
        >
          Vincular Documento
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default LinkDocumentDialog;
