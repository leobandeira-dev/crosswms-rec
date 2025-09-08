
import React from 'react';
import DocumentPDFGenerator from '@/components/common/DocumentPDFGenerator';
import { NotaFiscal } from '../../../Faturamento';
import { CabecalhoValores, TotaisCalculados } from '../../../hooks/faturamento/types';
import { DocumentInfo } from './schema/documentSchema';
import FaturaDocumentLayout from './FaturaDocumentLayout';

interface FaturaDocumentPDFViewerProps {
  documentInfo: DocumentInfo;
  notas: NotaFiscal[];
  cabecalhoValores: CabecalhoValores;
  totaisCalculados: TotaisCalculados;
}

const FaturaDocumentPDFViewer: React.FC<FaturaDocumentPDFViewerProps> = ({
  documentInfo,
  notas,
  cabecalhoValores,
  totaisCalculados
}) => {
  return (
    <DocumentPDFGenerator
      documentId={documentInfo.documentNumber}
      documentType={documentInfo.documentType === 'inbound' ? 'Fatura Entrada' : 'Fatura Saída'}
      renderDocument={(documentId) => (
        <FaturaDocumentLayout
          documentInfo={documentInfo}
          notas={notas}
          cabecalhoValores={cabecalhoValores}
          totaisCalculados={totaisCalculados}
        />
      )}
      buttonText="Imprimir Fatura"
      buttonSize="default"
    />
  );
};

export default FaturaDocumentPDFViewer;
