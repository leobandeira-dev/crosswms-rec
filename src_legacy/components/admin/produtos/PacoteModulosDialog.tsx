
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, X } from 'lucide-react';

// Mock data for available modules and their features
const mockModulos = [
  {
    id: 'coletas',
    nome: 'Coletas',
    funcionalidades: [
      { id: 'col-1', nome: 'Solicitações de Coleta', descricao: 'Gerenciar solicitações de coleta' },
      { id: 'col-2', nome: 'Aprovações de Coleta', descricao: 'Workflow de aprovações' },
      { id: 'col-3', nome: 'Alocação de Cargas', descricao: 'Alocar cargas a veículos' },
      { id: 'col-4', nome: 'Roteirização', descricao: 'Otimização de rotas' },
    ]
  },
  {
    id: 'armazenagem',
    nome: 'Armazenagem',
    funcionalidades: [
      { id: 'arm-1', nome: 'Recebimento', descricao: 'Gestão de recebimento de mercadorias' },
      { id: 'arm-2', nome: 'Etiquetas', descricao: 'Geração de etiquetas' },
      { id: 'arm-3', nome: 'Endereçamento', descricao: 'Controle de endereçamento' },
      { id: 'arm-4', nome: 'Movimentações', descricao: 'Gestão de movimentações internas' },
    ]
  },
  {
    id: 'expedicao',
    nome: 'Expedição',
    funcionalidades: [
      { id: 'exp-1', nome: 'Ordens de Carregamento', descricao: 'Criação e gestão de OCs' },
      { id: 'exp-2', nome: 'Documentos de Embarque', descricao: 'Emissão de documentos' },
      { id: 'exp-3', nome: 'Conferência', descricao: 'Checklist de conferência' },
      { id: 'exp-4', nome: 'Faturamento', descricao: 'Faturamento de despachos' },
    ]
  },
  {
    id: 'sac',
    nome: 'SAC',
    funcionalidades: [
      { id: 'sac-1', nome: 'Ocorrências', descricao: 'Registro e gestão de ocorrências' },
      { id: 'sac-2', nome: 'Chamados', descricao: 'Abertura e acompanhamento de chamados' },
      { id: 'sac-3', nome: 'Atendimentos', descricao: 'Gestão de atendimentos' },
    ]
  },
  {
    id: 'relatorios',
    nome: 'Relatórios Avançados',
    funcionalidades: [
      { id: 'rel-1', nome: 'Dashboard Personalizável', descricao: 'Dashboards avançados' },
      { id: 'rel-2', nome: 'Exportação Avançada', descricao: 'Exportação em diversos formatos' },
      { id: 'rel-3', nome: 'Gerador de Relatórios', descricao: 'Criação de relatórios customizados' },
      { id: 'rel-4', nome: 'Analytics', descricao: 'Análises avançadas de dados' },
    ]
  },
];

type PacoteModulosDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacote: any | null;
};

export const PacoteModulosDialog = ({ open, onOpenChange, pacote }: PacoteModulosDialogProps) => {
  if (!pacote) return null;

  // Determine which modules are in the package
  const isModuloIncluded = (moduloNome: string) => {
    return pacote.modulos.includes(moduloNome);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Módulos e Funcionalidades do Pacote: {pacote.nome}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Este pacote inclui os seguintes módulos e funcionalidades:
          </p>
          
          {mockModulos.map(modulo => {
            const included = isModuloIncluded(modulo.nome);
            
            return (
              <div 
                key={modulo.id} 
                className={`p-4 rounded-lg border ${included ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg flex items-center">
                    {included ? (
                      <Check className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400 mr-2" />
                    )}
                    {modulo.nome}
                  </h3>
                  <span className={`text-sm ${included ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                    {included ? 'Incluído' : 'Não incluído'}
                  </span>
                </div>
                
                {included && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 pl-7">
                    {modulo.funcionalidades.map(func => (
                      <div key={func.id} className="text-sm">
                        <p className="font-medium">{func.nome}</p>
                        <p className="text-muted-foreground text-xs">{func.descricao}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
