import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CalculoFreteForm from './components/faturamento/CalculoFreteForm';
import NotasFiscaisTable from './components/faturamento/NotasFiscaisTable';
import ImportacaoLoteNotas from './components/faturamento/ImportacaoLoteNotas';
import { FileText } from 'lucide-react';
import { useFaturamento } from './hooks/useFaturamento';
import CabecalhoTotais from './components/faturamento/CabecalhoTotais';
import DocumentGenerationDialog from './components/faturamento/print/DocumentGenerationDialog';
import HistoricoFaturasTab from './components/faturamento/HistoricoFaturasTab';
import DocumentosTab from './components/faturamento/documentos/DocumentosTab';

// Define NotaFiscal interface based on the requirements
export interface NotaFiscal {
  id: string;
  data: Date;
  cliente: string;
  pesoNota: number;
  fretePorTonelada: number;
  pesoMinimo: number;
  aliquotaICMS: number;
  aliquotaExpresso: number;
  fretePeso?: number;
  valorExpresso?: number;
  freteRatear?: number;
  // Novos campos
  remetente?: string;
  notaFiscal?: string;
  pedido?: string;
  dataEmissao?: Date;
  valorNF?: number;
  valorFreteTransferencia?: number;
  cteColeta?: string;
  valorColeta?: number;
  cteTransferencia?: string;
  paletizacao?: number;
  pedagio?: number;
  totalPrestacao?: number;
  icms?: number; // Valor de ICMS rateado por nota
  // Campos para documento
  documentoId?: string;
  documentoNumero?: string;
  // Campo para armazenar o conteúdo XML original
  xmlContent?: string;
}

const Faturamento: React.FC = () => {
  const {
    notas,
    activeTab,
    setActiveTab,
    cabecalhoValores,
    totaisCalculados,
    handleAddNotaFiscal,
    handleDeleteNotaFiscal,
    handleRecalculate,
    handleImportarLote,
    handleUpdateCabecalho,
    handleExportToPDF,
    handleRatear
  } = useFaturamento();
  
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  
  // Handler para eventos personalizados
  useEffect(() => {
    const handleDocumentDialogEvent = (e: Event) => {
      // Abrir diálogo
      setDocumentDialogOpen(true);
    };
    
    // Adiciona listener para o evento de abrir o diálogo de documento
    document.addEventListener('openDocumentDialog', handleDocumentDialogEvent);
    
    return () => {
      // Remove listener quando componente desmontar
      document.removeEventListener('openDocumentDialog', handleDocumentDialogEvent);
    };
  }, []);

  return (
    <MainLayout title="Faturamento">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Cálculo de Frete e Rateio</CardTitle>
                <CardDescription>
                  Calcule o rateio de frete para notas fiscais com base no peso e outras variáveis.
                </CardDescription>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value="totais" className="w-full mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="totais">Totais</TabsTrigger>
              </TabsList>
              <TabsContent value="totais">
                <CabecalhoTotais 
                  cabecalhoValores={cabecalhoValores} 
                  totaisCalculados={totaisCalculados}
                  onUpdateCabecalho={handleUpdateCabecalho}
                  onRatear={handleRatear}
                  notasCount={notas.length}
                  pesoTotal={notas.reduce((sum, nota) => sum + nota.pesoNota, 0)}
                />
              </TabsContent>
            </Tabs>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="notas">Notas Fiscais</TabsTrigger>
                <TabsTrigger value="importacao">Importação de Notas</TabsTrigger>
                <TabsTrigger value="calculo">Adicionar Nota Manual</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
                <TabsTrigger value="historico">Histórico de Faturas</TabsTrigger>
              </TabsList>

              <TabsContent value="notas">
                <NotasFiscaisTable 
                  notas={notas} 
                  onDelete={handleDeleteNotaFiscal} 
                  onRecalculate={handleRecalculate}
                  onExportToPDF={handleExportToPDF}
                />
              </TabsContent>

              <TabsContent value="importacao">
                <ImportacaoLoteNotas
                  onImportarLote={handleImportarLote}
                />
              </TabsContent>
              
              <TabsContent value="calculo">
                <CalculoFreteForm 
                  onAddNotaFiscal={handleAddNotaFiscal}
                  onComplete={() => setActiveTab("notas")} 
                />
              </TabsContent>
              
              <TabsContent value="documentos">
                <DocumentosTab />
              </TabsContent>
              
              <TabsContent value="historico">
                <HistoricoFaturasTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog para geração de documentos */}
      <DocumentGenerationDialog
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
        notas={notas}
        cabecalhoValores={cabecalhoValores}
        totaisCalculados={totaisCalculados}
      />
    </MainLayout>
  );
};

export default Faturamento;
