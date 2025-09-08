
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '../../../components/layout/MainLayout';
import { FileText, Package, Download, Box, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RecebimentoNotasManager, { RecebimentoConfig } from '@/components/comum/RecebimentoNotas/RecebimentoNotasManager';
import { NotaVolumeData as CubagemNotaVolumeData } from '@/components/comum/CubagemManager';
import CadastroNota from './components/CadastroNota';
import ConsultaNotas from './components/ConsultaNotas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { fetchCNPJData, formatCNPJ, cleanCNPJ } from '@/utils/cnpjApi';
// Removed problematic imports that don't exist

// Remove mock data import - will use real processed data

// Interface for volume data
interface VolumeData {
  volume: number;
  altura: number;
  largura: number;
  comprimento: number;
  m3: number;
}

interface NotaVolumeData {
  notaId: string;
  numeroNota: string;
  volumes: VolumeData[];
  totalM3: number;
  pesoTotal: number;
}

const EntradaNotas: React.FC = () => {
  const [, setLocation] = useLocation();
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState<string>('');
  const [cubagemModalOpen, setCubagemModalOpen] = useState(false);
  const [selectedNotaForCubagem, setSelectedNotaForCubagem] = useState<any>(null);
  const [volumes, setVolumes] = useState<VolumeData[]>([]);
  const [batchVolumeData, setBatchVolumeData] = useState<NotaVolumeData[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [processedNotasFiscais, setProcessedNotasFiscais] = useState<any[]>([]);
  const { toast } = useToast();
  
  const notaFiscalRef = useRef<HTMLDivElement>(null);
  const danfeRef = useRef<HTMLDivElement>(null);
  const simplifiedDanfeRef = useRef<HTMLDivElement>(null);
  
  // Make sure refs are properly updated when content changes
  const [notaData, setNotaData] = useState<any>(null);
  
  // Find the selected nota fiscal data for DANFE
  useEffect(() => {
    if (selectedNota) {
      const foundNota = processedNotasFiscais.find(nota => nota.id === selectedNota);
      console.log("Nota selecionada para impressão:", foundNota);
      setNotaData(foundNota);
    } else {
      setNotaData(null);
    }
  }, [selectedNota, processedNotasFiscais]);
  
  const handlePrintClick = (notaId: string) => {
    setSelectedNota(notaId);
    setPrintModalOpen(true);
  };

  const handleInformarCubagem = (nota: any) => {
    setSelectedNotaForCubagem(nota);
    
    // Initialize volumes based on quantidade_volumes from XML
    const quantidadeVolumes = nota.quantidade_volumes || 1;
    const initialVolumes: VolumeData[] = [];
    
    for (let i = 1; i <= quantidadeVolumes; i++) {
      initialVolumes.push({
        volume: i,
        altura: 0,
        largura: 0,
        comprimento: 0,
        m3: 0
      });
    }
    
    setVolumes(initialVolumes);
    setCubagemModalOpen(true);
  };

  const handleVolumeChange = (index: number, field: keyof VolumeData, value: number) => {
    const updatedVolumes = [...volumes];
    updatedVolumes[index] = { ...updatedVolumes[index], [field]: value };
    
    // Calculate m3 for this volume (direct calculation as inputs are in meters)
    if (field === 'altura' || field === 'largura' || field === 'comprimento') {
      const volume = updatedVolumes[index];
      volume.m3 = parseFloat((volume.altura * volume.largura * volume.comprimento).toFixed(2));
    }
    
    setVolumes(updatedVolumes);
  };

  const handleSaveCubagem = () => {
    if (!selectedNotaForCubagem) return;
    
    const totalM3 = volumes.reduce((sum, vol) => sum + vol.m3, 0);
    const pesoTotal = selectedNotaForCubagem.peso_bruto || 0;
    
    const notaVolumeData: NotaVolumeData = {
      notaId: selectedNotaForCubagem.id,
      numeroNota: selectedNotaForCubagem.numero,
      volumes: volumes,
      totalM3: totalM3,
      pesoTotal: pesoTotal
    };

    // Add to batch processing
    const existingIndex = batchVolumeData.findIndex(item => item.notaId === selectedNotaForCubagem.id);
    if (existingIndex >= 0) {
      const updatedBatch = [...batchVolumeData];
      updatedBatch[existingIndex] = notaVolumeData;
      setBatchVolumeData(updatedBatch);
    } else {
      setBatchVolumeData([...batchVolumeData, notaVolumeData]);
    }

    toast({
      title: "Cubagem Informada",
      description: `Volumes da NF ${selectedNotaForCubagem.numero} cadastrados com sucesso. Total: ${totalM3.toFixed(2)} m³`,
    });

    setCubagemModalOpen(false);
    setSelectedNotaForCubagem(null);
  };

  const handleGerarColeta = () => {
    if (batchVolumeData.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhuma nota com cubagem informada para gerar coleta",
        variant: "destructive"
      });
      return;
    }

    // Prepare data for marketplace order creation
    const totalVolumes = batchVolumeData.reduce((sum, nota) => sum + nota.volumes.length, 0);
    const totalM3 = batchVolumeData.reduce((sum, nota) => sum + nota.totalM3, 0);
    const totalPeso = batchVolumeData.reduce((sum, nota) => sum + nota.pesoTotal, 0);
    const totalValor = batchVolumeData.reduce((sum, nota) => {
      // Get the corresponding nota fiscal to extract value
      const notaFiscal = processedNotasFiscais.find(nf => nf.id === nota.notaId);
      return sum + (parseFloat(notaFiscal?.valor_nota_fiscal || '0') || 0);
    }, 0);

    // Convert batch volume data to NFes format for marketplace
    const nfesForMarketplace = batchVolumeData.map(nota => {
      const notaFiscal = processedNotasFiscais.find(nf => nf.id === nota.notaId);
      return {
        id: nota.notaId,
        chaveAcesso: notaFiscal?.chaveNF || '',
        numero: nota.numeroNota,
        valorDeclarado: parseFloat(notaFiscal?.valor_nota_fiscal || '0') || 0,
        peso: nota.pesoTotal,
        volume: nota.totalM3,
        remetente: {
          razaoSocial: notaFiscal?.emitente_razao_social || '',
          cnpj: notaFiscal?.emitente_cnpj || '',
          cidade: notaFiscal?.emitente_cidade || '',
          uf: notaFiscal?.emitente_uf || '',
          endereco: notaFiscal?.emitente_endereco || '',
          bairro: notaFiscal?.emitente_bairro || '',
          cep: notaFiscal?.emitente_cep || '',
          telefone: notaFiscal?.emitente_telefone || ''
        },
        destinatario: {
          razaoSocial: notaFiscal?.destinatario_razao_social || '',
          cnpj: notaFiscal?.destinatario_cnpj || '',
          cidade: notaFiscal?.destinatario_cidade || '',
          uf: notaFiscal?.destinatario_uf || '',
          endereco: notaFiscal?.destinatario_endereco || '',
          bairro: notaFiscal?.destinatario_bairro || '',
          cep: notaFiscal?.destinatario_cep || '',
          telefone: notaFiscal?.destinatario_telefone || ''
        },
        m3: nota.totalM3
      };
    });

    // Store data in sessionStorage for the marketplace page
    const coletaData = {
      nfes: nfesForMarketplace,
      totais: {
        quantidade: batchVolumeData.length,
        volumes: totalVolumes,
        peso: totalPeso,
        volume: totalM3,
        valor: totalValor
      },
      origem: 'armazenagem',
      criadoEm: new Date().toISOString()
    };

    sessionStorage.setItem('coletaData', JSON.stringify(coletaData));

    toast({
      title: "Redirecionando para Solicitação de Coleta",
      description: `${batchVolumeData.length} notas processadas com sucesso`,
    });

    // Redirect to marketplace order creation
    setLocation('/marketplace/nova-ordem');
  };

  const handleGerarOR = () => {
    if (batchVolumeData.length === 0) {
      toast({
        title: "Erro", 
        description: "Nenhuma nota com cubagem informada para gerar OR",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Ordem de Recebimento Gerada",
      description: `OR criada para ${batchVolumeData.length} notas fiscais`,
    });

    // Here you would integrate with your OR generation service
    console.log("Generating OR document:", batchVolumeData);
  };

  // Sample XML content for each nota fiscal
  // In a real application, this would come from your backend
  const getNotaXml = (notaId: string) => {
    // Mock XML content - this would be replaced with actual XML data
    return `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${notaId}" versao="4.00">
    <ide>
      <cUF>35</cUF>
      <cNF>12345678</cNF>
      <natOp>VENDA DE MERCADORIA</natOp>
      <mod>55</mod>
      <serie>1</serie>
      <nNF>${notaId}</nNF>
      <dhEmi>2023-05-15T10:30:00-03:00</dhEmi>
      <tpNF>1</tpNF>
    </ide>
    <emit>
      <CNPJ>12345678901234</CNPJ>
      <xNome>EMPRESA EMITENTE LTDA</xNome>
      <enderEmit>
        <xLgr>RUA EXEMPLO</xLgr>
        <nro>123</nro>
        <xBairro>CENTRO</xBairro>
        <cMun>3550308</cMun>
        <xMun>SAO PAULO</xMun>
        <UF>SP</UF>
        <CEP>01001000</CEP>
      </enderEmit>
      <IE>123456789012</IE>
    </emit>
    <dest>
      <CNPJ>98765432109876</CNPJ>
      <xNome>CLIENTE DESTINATARIO SA</xNome>
      <enderDest>
        <xLgr>AVENIDA CLIENTE</xLgr>
        <nro>987</nro>
        <xBairro>BAIRRO CLIENTE</xBairro>
        <cMun>3550308</cMun>
        <xMun>SAO PAULO</xMun>
        <UF>SP</UF>
        <CEP>04001000</CEP>
      </enderDest>
      <IE>987654321098</IE>
    </dest>
  </infNFe>
</NFe>`;
  };

  return (
    <MainLayout title="Entrada de Notas Fiscais - Cubagem">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Entrada de Notas Fiscais</h2>
        <p className="text-gray-600">Registre e processe notas fiscais de entrada de mercadorias com cubagem</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="cadastrar" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="cadastrar">Cadastrar Nota</TabsTrigger>
              <TabsTrigger value="consultar">Consultar Notas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cadastrar">
              <CadastroNota onVolumeDataUpdate={(volumeData) => {
                const existingIndex = batchVolumeData.findIndex(item => item.notaId === volumeData.notaId);
                if (existingIndex >= 0) {
                  const updatedBatch = [...batchVolumeData];
                  updatedBatch[existingIndex] = volumeData;
                  setBatchVolumeData(updatedBatch);
                } else {
                  setBatchVolumeData([...batchVolumeData, volumeData]);
                }
              }} />
            </TabsContent>
            
            <TabsContent value="consultar">
              <ConsultaNotas onPrintClick={handlePrintClick} onInformarCubagem={handleInformarCubagem} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Volume Extract Display - replaces "Notas Fiscais Recentes" */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5" />
                Extrato de Volumes - Cubagem ({processedNotasFiscais.length} notas)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {processedNotasFiscais.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma nota processada</p>
                  <p className="text-sm">Processe notas fiscais primeiro</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {processedNotasFiscais.map((nota) => {
                    const notaCubagem = batchVolumeData.find(item => item.notaId === nota.id);
                    const temCubagem = notaCubagem && notaCubagem.volumes && notaCubagem.volumes.some(vol => vol.altura > 0 && vol.largura > 0 && vol.comprimento > 0);
                    
                    return (
                      <Card key={nota.id} className={`border-l-4 ${temCubagem ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold">NF {nota.numero}</h4>
                              <div className="flex gap-2 items-center">
                                <Badge variant="outline">{nota.quantidade_volumes} volumes</Badge>
                                {temCubagem ? (
                                  <Badge variant="default" className="bg-green-500">Dimensões OK</Badge>
                                ) : (
                                  <Badge variant="default" className="bg-red-500">⚠️ Sem Dimensões</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              {temCubagem && notaCubagem ? (
                                <>
                                  <div className="font-semibold text-green-600">{(notaCubagem as any).totalM3?.toFixed(2) || '0.00'} m³</div>
                                  <div className="text-gray-600">{(notaCubagem as any).pesoTotal?.toFixed(2) || nota.peso_bruto?.toFixed(2)} kg</div>
                                </>
                              ) : (
                                <>
                                  <div className="font-semibold text-red-600">0,00 m³</div>
                                  <div className="text-gray-600">{nota.peso_bruto?.toFixed(2)} kg</div>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {temCubagem && notaCubagem ? (
                            <div className="space-y-1 text-xs">
                              {(notaCubagem as any).volumes.map((vol: any) => (
                                <div key={vol.volume} className="flex justify-between">
                                  <span>Vol {vol.volume}:</span>
                                  <span>{vol.altura}×{vol.largura}×{vol.comprimento} = {vol.m3.toFixed(2)}m³</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
                              <div className="font-medium">⚠️ Dimensões não informadas</div>
                              <div>Use o botão "Informar Dimensões" para adicionar as medidas</div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-semibold">Total do Lote</h4>
                        <div className="text-sm text-gray-600">
                          {processedNotasFiscais.length} nota(s) | {batchVolumeData.reduce((sum, nota) => sum + (nota.volumes?.length || 0), 0)} com cubagem
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {batchVolumeData.reduce((sum, nota) => sum + (nota.totalM3 || 0), 0).toFixed(2)} m³
                        </div>
                        <div className="text-sm text-gray-600">
                          {batchVolumeData.reduce((sum, nota) => sum + (nota.pesoTotal || 0), 0).toFixed(2)} kg
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <Button onClick={handleGerarColeta} className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Gerar Ordem de Carregamento
                      </Button>
                      <Button onClick={handleGerarOR} variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Gerar OR
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Hidden divs that serve as print templates */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={notaFiscalRef} style={{ width: '800px', backgroundColor: '#fff' }}>
          <NotaPrintTemplate notaId={selectedNota} />
        </div>
        
        <div ref={danfeRef} style={{ width: '800px', backgroundColor: '#fff' }}>
          <DANFELayout notaFiscalData={notaData} />
        </div>
        
        <div ref={simplifiedDanfeRef} style={{ width: '800px', backgroundColor: '#fff' }}>
          <DANFELayout notaFiscalData={notaData} simplified />
        </div>
      </div>
      
      {/* Cubagem Modal */}
      <Dialog open={cubagemModalOpen} onOpenChange={setCubagemModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Box className="h-5 w-5" />
              Informar Cubagem - NF {selectedNotaForCubagem?.numero}
            </DialogTitle>
            <DialogDescription>
              Informe as dimensões de cada volume. As medidas devem ser em centímetros (cm).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {volumes.map((volume, index) => (
              <Card key={volume.volume} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Volume {volume.volume}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 items-end">
                    <div>
                      <Label htmlFor={`altura-${index}`}>Altura (m)</Label>
                      <Input
                        id={`altura-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={volume.altura || ''}
                        onChange={(e) => handleVolumeChange(index, 'altura', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`largura-${index}`}>Largura (m)</Label>
                      <Input
                        id={`largura-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={volume.largura || ''}
                        onChange={(e) => handleVolumeChange(index, 'largura', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`comprimento-${index}`}>Comprimento (m)</Label>
                      <Input
                        id={`comprimento-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={volume.comprimento || ''}
                        onChange={(e) => handleVolumeChange(index, 'comprimento', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>Volume (m³)</Label>
                      <div className="text-lg font-semibold text-blue-600 py-2">
                        {volume.m3.toFixed(2)} m³
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600">
                    Cálculo: {volume.altura} × {volume.largura} × {volume.comprimento} = {volume.m3.toFixed(2)} m³
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Total da Nota Fiscal</h4>
                    <div className="text-sm text-gray-600">
                      {volumes.length} volumes • Peso: {selectedNotaForCubagem?.peso_bruto?.toFixed(2) || '0.00'} kg
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {volumes.reduce((sum, vol) => sum + vol.m3, 0).toFixed(2)} m³
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCubagemModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveCubagem} disabled={volumes.some(vol => vol.altura === 0 || vol.largura === 0 || vol.comprimento === 0)}>
                <Box className="h-4 w-4 mr-2" />
                Salvar Cubagem
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DocumentPrintModal
        open={printModalOpen}
        onOpenChange={setPrintModalOpen}
        documentId={selectedNota}
        documentType="Nota Fiscal"
        layoutRef={notaFiscalRef}
        danfeRef={danfeRef}
        simplifiedDanfeRef={simplifiedDanfeRef}
        xmlData={{
          xmlContent: selectedNota ? getNotaXml(selectedNota) : null
        }}
      />
    </MainLayout>
  );
};

export default EntradaNotas;
