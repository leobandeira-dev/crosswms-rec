
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Printer } from 'lucide-react';
import DocumentosAConferir from './DocumentosAConferir';
import DocumentosEmTransito from './DocumentosEmTransito';
import DocumentosEntregues from './DocumentosEntregues';
import DocumentInfoForm from '../print/DocumentInfoForm';
import { DocumentInfo } from '../print/schema/documentSchema';
import { useFaturamento } from '../../../hooks/useFaturamento';
import { useFaturamentoDocumentos } from '../../../hooks/faturamento/useFaturamentoDocumentos';

const DocumentosTab: React.FC = () => {
  const [activeDocTab, setActiveDocTab] = useState('aConferir');
  const [formData, setFormData] = useState<DocumentInfo | null>(null);
  
  const { notas, cabecalhoValores, totaisCalculados } = useFaturamento();
  const { adicionarNovoDocumento } = useFaturamentoDocumentos();

  const handleFormSubmit = (data: DocumentInfo) => {
    setFormData(data);
    // Adicionar documento ao sistema
    adicionarNovoDocumento(data, totaisCalculados.totalViagem);
  };

  return (
    <div className="space-y-6">
      {/* Formulário de informações do documento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Informações do Documento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentInfoForm 
            onSubmit={handleFormSubmit}
            onCancel={() => {}}
            defaultSequence={1}
          />
        </CardContent>
      </Card>

      {/* Tabs de documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Printer className="h-5 w-5 mr-2" />
            Documentos Emitidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeDocTab} onValueChange={setActiveDocTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="aConferir">A Conferir</TabsTrigger>
              <TabsTrigger value="emTransito">Em Trânsito</TabsTrigger>
              <TabsTrigger value="entregues">Entregues</TabsTrigger>
            </TabsList>

            <TabsContent value="aConferir">
              <DocumentosAConferir />
            </TabsContent>
            
            <TabsContent value="emTransito">
              <DocumentosEmTransito />
            </TabsContent>
            
            <TabsContent value="entregues">
              <DocumentosEntregues />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentosTab;
