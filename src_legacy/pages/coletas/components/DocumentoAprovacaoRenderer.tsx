
import React from 'react';
import { SolicitacaoColeta } from '../types/coleta.types';
import DocumentInfo from '@/components/common/print/DocumentInfo';
import DocumentoColetaViewer from './solicitacao/DocumentoColetaViewer';

interface DocumentoAprovacaoRendererProps {
  documentId: string;
  documents: SolicitacaoColeta[];
}

const DocumentoAprovacaoRenderer: React.FC<DocumentoAprovacaoRendererProps> = ({
  documentId,
  documents
}) => {
  const documento = documents.find(doc => doc.id === documentId);
  
  if (!documento) return <div>Documento não encontrado</div>;
  
  return (
    <div className="space-y-6 p-6">
      <DocumentInfo 
        documentType="Solicitação de Coleta"
        documentId={documento.id}
        status={documento.status}
      />
      
      <DocumentoColetaViewer solicitacao={documento} />
      
      <div className="mt-8 border-t pt-4 text-center text-sm text-gray-500">
        <p>Documento gerado em {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default DocumentoAprovacaoRenderer;
