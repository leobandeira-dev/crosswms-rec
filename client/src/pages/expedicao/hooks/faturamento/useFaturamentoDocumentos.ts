
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { DocumentInfo } from '../../components/faturamento/print/schema/documentSchema';

// Interface para os documentos
interface Documento {
  id: string;
  documentNumber: string;
  documentType: string;
  dataEmissao: Date;
  dataConferencia?: Date;
  dataEntrega?: Date;
  departureDateTime: Date;
  arrivalDateTime: Date;
  driverName: string;
  truckId: string;
  trailer1?: string;
  trailer2?: string;
  trailerType: string;
  issuerUser: string;
  checkerUser: string;
  transporterName: string;
  transporterLogo?: string;
  status: 'aConferir' | 'emTransito' | 'entregue';
  totalViagem: number;
}

export const useFaturamentoDocumentos = () => {
  // Estados para os diferentes tipos de documentos
  const [documentosAConferir, setDocumentosAConferir] = useState<Documento[]>([
    {
      id: '1',
      documentNumber: 'DOC-2025-05-10-001',
      documentType: 'outbound',
      dataEmissao: new Date(2025, 4, 10, 10, 30),
      departureDateTime: new Date(2025, 4, 10, 14, 0),
      arrivalDateTime: new Date(2025, 4, 11, 10, 0),
      driverName: 'João Silva',
      truckId: 'ABC-1234',
      trailerType: 'Baú',
      issuerUser: 'Maria Operadora',
      checkerUser: '',
      transporterName: 'Transportes Rápidos LTDA',
      status: 'aConferir',
      totalViagem: 5860.50
    },
    {
      id: '2',
      documentNumber: 'DOC-2025-05-10-002',
      documentType: 'inbound',
      dataEmissao: new Date(2025, 4, 10, 11, 45),
      departureDateTime: new Date(2025, 4, 10, 15, 30),
      arrivalDateTime: new Date(2025, 4, 11, 12, 0),
      driverName: 'Pedro Camargo',
      truckId: 'DEF-5678',
      trailer1: 'XYZ-9876',
      trailerType: 'Sider',
      issuerUser: 'Carlos Expedidor',
      checkerUser: '',
      transporterName: 'Logística Expressa S/A',
      status: 'aConferir',
      totalViagem: 7230.00
    }
  ]);
  
  const [documentosEmTransito, setDocumentosEmTransito] = useState<Documento[]>([
    {
      id: '3',
      documentNumber: 'DOC-2025-05-09-003',
      documentType: 'outbound',
      dataEmissao: new Date(2025, 4, 9, 9, 15),
      dataConferencia: new Date(2025, 4, 9, 11, 30),
      departureDateTime: new Date(2025, 4, 9, 14, 0),
      arrivalDateTime: new Date(2025, 4, 10, 16, 0),
      driverName: 'Antonio Ferreira',
      truckId: 'GHI-9012',
      trailer1: 'JKL-3456',
      trailerType: 'Grade baixa',
      issuerUser: 'Maria Operadora',
      checkerUser: 'José Conferente',
      transporterName: 'Transportadora Nacional',
      status: 'emTransito',
      totalViagem: 4580.75
    }
  ]);
  
  const [documentosEntregues, setDocumentosEntregues] = useState<Documento[]>([
    {
      id: '4',
      documentNumber: 'DOC-2025-05-08-001',
      documentType: 'inbound',
      dataEmissao: new Date(2025, 4, 8, 8, 0),
      dataConferencia: new Date(2025, 4, 8, 10, 15),
      dataEntrega: new Date(2025, 4, 9, 16, 45),
      departureDateTime: new Date(2025, 4, 8, 11, 0),
      arrivalDateTime: new Date(2025, 4, 9, 9, 0),
      driverName: 'Roberto Almeida',
      truckId: 'MNO-7890',
      trailerType: 'Refrigerado',
      issuerUser: 'Paulo Operador',
      checkerUser: 'Amanda Conferente',
      transporterName: 'Frios Express',
      status: 'entregue',
      totalViagem: 9850.25
    }
  ]);
  
  // Funções para gerenciar os documentos
  const adicionarNovoDocumento = (documentInfo: DocumentInfo, totalViagem: number) => {
    const novoDoc: Documento = {
      id: uuidv4(),
      documentNumber: documentInfo.documentNumber,
      documentType: documentInfo.documentType,
      departureDateTime: documentInfo.departureDateTime,
      arrivalDateTime: documentInfo.arrivalDateTime,
      driverName: documentInfo.driverName,
      truckId: documentInfo.truckId,
      trailer1: documentInfo.trailer1,
      trailer2: documentInfo.trailer2,
      trailerType: documentInfo.trailerType,
      issuerUser: documentInfo.issuerUser,
      checkerUser: documentInfo.checkerUser,
      transporterName: documentInfo.transporterName,
      transporterLogo: documentInfo.transporterLogo,
      dataEmissao: new Date(),
      status: 'aConferir',
      totalViagem
    };
    
    setDocumentosAConferir([...documentosAConferir, novoDoc]);
    
    toast({
      title: "Documento gerado com sucesso",
      description: `Documento ${novoDoc.documentNumber} foi criado e está aguardando conferência.`
    });
    
    return novoDoc;
  };
  
  const marcarComoConferido = (documentoId: string) => {
    const documento = documentosAConferir.find(doc => doc.id === documentoId);
    if (!documento) return;
    
    // Remove dos documentos a conferir
    setDocumentosAConferir(documentosAConferir.filter(doc => doc.id !== documentoId));
    
    // Adiciona aos documentos em trânsito
    const docAtualizado: Documento = {
      ...documento,
      dataConferencia: new Date(),
      status: 'emTransito',
      checkerUser: documento.checkerUser || 'Conferente do Sistema'
    };
    
    setDocumentosEmTransito([...documentosEmTransito, docAtualizado]);
    
    toast({
      title: "Documento conferido",
      description: `O documento ${docAtualizado.documentNumber} foi conferido e marcado como em trânsito.`
    });
  };
  
  const marcarComoEntregue = (documentoId: string) => {
    const documento = documentosEmTransito.find(doc => doc.id === documentoId);
    if (!documento) return;
    
    // Remove dos documentos em trânsito
    setDocumentosEmTransito(documentosEmTransito.filter(doc => doc.id !== documentoId));
    
    // Adiciona aos documentos entregues
    const docAtualizado: Documento = {
      ...documento,
      dataEntrega: new Date(),
      status: 'entregue'
    };
    
    setDocumentosEntregues([...documentosEntregues, docAtualizado]);
    
    toast({
      title: "Entrega confirmada",
      description: `O documento ${docAtualizado.documentNumber} foi marcado como entregue.`
    });
  };

  return {
    documentosAConferir,
    documentosEmTransito,
    documentosEntregues,
    adicionarNovoDocumento,
    marcarComoConferido,
    marcarComoEntregue
  };
};
