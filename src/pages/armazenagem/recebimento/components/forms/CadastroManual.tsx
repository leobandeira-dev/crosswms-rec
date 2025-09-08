
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const CadastroManual: React.FC = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="text-yellow-500 h-5 w-5" />
          <div>
            <p className="text-sm font-medium mb-2">Cadastro Manual de Documento</p>
            <p className="text-sm text-gray-500 mb-4">
              Preencha todos os campos manualmente para cadastrar um documento não fiscal.
              Todos os campos marcados com * são obrigatórios.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Certifique-se de preencher corretamente os dados do emitente e destinatário</p>
              <p>• Informações de transporte são opcionais para documentos não fiscais</p>
              <p>• É recomendável anexar arquivos de suporte quando disponíveis</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CadastroManual;
