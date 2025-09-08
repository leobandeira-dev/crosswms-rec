import React, { useRef, useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Box, FileText, Package, Download, Calculator, Save, X, Search, Loader2, Building, MapPin } from 'lucide-react';
import { fetchCNPJData, formatCNPJ, cleanCNPJ } from '@/utils/cnpjApi';
import CubagemManager, { VolumeData, NotaVolumeData } from '../CubagemManager';

// Interface para configuração do componente
interface RecebimentoConfig {
  showCadastro?: boolean;
  showConsulta?: boolean;
  showVolumeExtract?: boolean;
  showPrintOptions?: boolean;
  allowBatchProcessing?: boolean;
  customActions?: Array<{
    label: string;
    icon?: React.ComponentType<any>;
    onClick: (batchVolumeData: NotaVolumeData[]) => void;
    variant?: 'default' | 'outline' | 'destructive';
  }>;
  title?: string;
  description?: string;
}

// Interface para dados processados
interface ProcessedNotaFiscal {
  id: string;
  numero: string;
  chaveNF: string;
  valor_nota_fiscal: string;
  peso_bruto: number;
  quantidade_volumes: number;
  emitente_razao_social: string;
  emitente_cnpj: string;
  emitente_cidade: string;
  emitente_uf: string;
  emitente_endereco: string;
  emitente_bairro: string;
  emitente_cep: string;
  emitente_telefone: string;
  destinatario_razao_social: string;
  destinatario_cnpj: string;
  destinatario_cidade: string;
  destinatario_uf: string;
  destinatario_endereco: string;
  destinatario_bairro: string;
  destinatario_cep: string;
  destinatario_telefone: string;
}

interface RecebimentoNotasManagerProps {
  config?: RecebimentoConfig;
  onVolumeDataUpdate?: (volumeData: NotaVolumeData[]) => void;
  onNotaProcessed?: (nota: ProcessedNotaFiscal) => void;
  onBatchAction?: (action: string, data: NotaVolumeData[]) => void;
  initialData?: ProcessedNotaFiscal[];
  className?: string;
  children?: React.ReactNode | ((props: { onNotaProcessed: (nota: any) => void }) => React.ReactNode);
}

const defaultConfig: RecebimentoConfig = {
  showCadastro: true,
  showConsulta: true,
  showVolumeExtract: true,
  showPrintOptions: true,
  allowBatchProcessing: true,
  title: "Recebimento de Notas Fiscais",
  description: "Registre e processe notas fiscais com cubagem",
  customActions: []
};

const RecebimentoNotasManager: React.FC<RecebimentoNotasManagerProps> = ({
  config = defaultConfig,
  onVolumeDataUpdate,
  onNotaProcessed,
  onBatchAction,
  initialData = [],
  className = "",
  children
}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const { toast } = useToast();

  // Estados do componente
  const [processedNotasFiscais, setProcessedNotasFiscais] = useState<ProcessedNotaFiscal[]>(initialData);
  const [batchVolumeData, setBatchVolumeData] = useState<NotaVolumeData[]>([]);
  const [selectedNotaForCubagem, setSelectedNotaForCubagem] = useState<ProcessedNotaFiscal | null>(null);
  const [showCubagemModal, setShowCubagemModal] = useState(false);

  // Atualizar dados quando initialData mudar
  useEffect(() => {
    console.log('=== RecebimentoNotasManager - initialData mudou ===');
    console.log('Quantidade de notas recebidas:', initialData.length);
    setProcessedNotasFiscais(initialData);
  }, [initialData]);

  // Criar automaticamente entradas de volume para novas notas (sem dependência circular)
  useEffect(() => {
    if (initialData.length === 0) return;
    
    const novasEntradas: NotaVolumeData[] = [];
    
    initialData.forEach(nota => {
      setBatchVolumeData(prev => {
        const existeNoExtrato = prev.some(vol => vol.notaId === nota.id);
        
        if (!existeNoExtrato) {
          console.log(`Criando entrada automática para nota ${nota.numero}`);
          
          const volumesData: NotaVolumeData = {
            notaId: nota.id,
            numeroNota: nota.numero,
            volumes: Array.from({ length: nota.quantidade_volumes }, (_, i) => ({
              volume: i + 1,
              altura: 0,
              largura: 0,
              comprimento: 0,
              m3: 0
            })),
            totalM3: 0,
            pesoTotal: nota.peso_bruto
          };
          
          return [...prev, volumesData];
        }
        return prev;
      });
    });
  }, [initialData]);

  // Função para processar nova nota recebida
  const handleNotaProcessedInternal = (nota: any) => {
    console.log('=== RecebimentoNotasManager - Nota processada recebida ===');
    console.log('Dados da nota:', nota);
    
    // Converter nota para formato esperado se necessário
    const notaProcessada: ProcessedNotaFiscal = {
      id: nota.id || `nota_${Date.now()}`,
      numero: nota.numeroNF || nota.numero || '',
      chaveNF: nota.chaveNF || nota.chave_nota_fiscal || '',
      valor_nota_fiscal: nota.valorNota || nota.valor_nota_fiscal || '0',
      peso_bruto: parseFloat(nota.peso || nota.peso_bruto || nota.volume_peso_bruto || '0'),
      quantidade_volumes: parseInt(nota.quantidadeVolumes || nota.quantidade_volumes || '1'),
      emitente_razao_social: nota.emitente_razao_social || '',
      emitente_cnpj: nota.emitente_cnpj || '',
      emitente_cidade: nota.emitente_cidade || '',
      emitente_uf: nota.emitente_uf || '',
      emitente_endereco: nota.emitente_endereco || '',
      emitente_bairro: nota.emitente_bairro || '',
      emitente_cep: nota.emitente_cep || '',
      emitente_telefone: nota.emitente_telefone || '',
      destinatario_razao_social: nota.destinatario_razao_social || '',
      destinatario_cnpj: nota.destinatario_cnpj || '',
      destinatario_cidade: nota.destinatario_cidade || '',
      destinatario_uf: nota.destinatario_uf || '',
      destinatario_endereco: nota.destinatario_endereco || '',
      destinatario_bairro: nota.destinatario_bairro || '',
      destinatario_cep: nota.destinatario_cep || '',
      destinatario_telefone: nota.destinatario_telefone || ''
    };

    // Adicionar ou atualizar nota na lista
    setProcessedNotasFiscais(prev => {
      const existingIndex = prev.findIndex(n => n.id === notaProcessada.id || n.chaveNF === notaProcessada.chaveNF);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = notaProcessada;
        console.log('Nota atualizada na lista:', updated);
        return updated;
      } else {
        const newList = [...prev, notaProcessada];
        console.log('Nova nota adicionada à lista:', newList);
        return newList;
      }
    });

    // Chamar callback externo se existir
    if (onNotaProcessed) {
      onNotaProcessed(notaProcessada);
    }

    // Criar volumes automaticamente no extrato (sem cubagem)
    console.log(`[DEBUG RecebimentoNotas] Criando volumes para ${notaProcessada.numero}:`, {
      quantidade_volumes: notaProcessada.quantidade_volumes,
      peso_bruto: notaProcessada.peso_bruto,
      nota_completa: notaProcessada
    });
    
    const volumesData: NotaVolumeData = {
      notaId: notaProcessada.id,
      numeroNota: notaProcessada.numero,
      volumes: Array.from({ length: notaProcessada.quantidade_volumes }, (_, i) => ({
        volume: i + 1,
        altura: 0,
        largura: 0,
        comprimento: 0,
        m3: 0
      })),
      totalM3: 0,
      pesoTotal: notaProcessada.peso_bruto
    };
    
    console.log(`[DEBUG RecebimentoNotas] VolumeData criado:`, volumesData);

    // FORÇA a adição ao extrato de volumes imediatamente
    setBatchVolumeData(prev => {
      const existingIndex = prev.findIndex(item => item.notaId === volumesData.notaId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = volumesData;
        console.log('Volume atualizado no extrato:', updated);
        return updated;
      } else {
        const newData = [...prev, volumesData];
        console.log('=== VOLUME FORÇADO NO EXTRATO ===', newData);
        return newData;
      }
    });

    toast({
      title: "Nota Processada",
      description: `NFe ${notaProcessada.numero} adicionada ao extrato de volumes. Clique em "Informar Cubagem" para adicionar dimensões.`,
    });
  };

  // Notificar mudanças nos dados de volume
  useEffect(() => {
    if (onVolumeDataUpdate) {
      onVolumeDataUpdate(batchVolumeData);
    }
  }, [batchVolumeData, onVolumeDataUpdate]);

  // Função para informar cubagem
  const handleInformarCubagem = (nota: ProcessedNotaFiscal) => {
    setSelectedNotaForCubagem(nota);
    setShowCubagemModal(true);
  };

  // Função para salvar cubagem
  const handleSaveCubagem = (cubagemData: NotaVolumeData) => {
    const existingIndex = batchVolumeData.findIndex(item => item.notaId === cubagemData.notaId);
    if (existingIndex >= 0) {
      const updatedBatch = [...batchVolumeData];
      updatedBatch[existingIndex] = cubagemData;
      setBatchVolumeData(updatedBatch);
    } else {
      setBatchVolumeData([...batchVolumeData, cubagemData]);
    }

    toast({
      title: "Cubagem Atualizada",
      description: `Volumes da NF ${cubagemData.numeroNota} atualizados com sucesso. Total: ${cubagemData.totalM3.toFixed(2)} m³`,
    });

    setShowCubagemModal(false);
  };

  // Função para executar ações customizadas
  const handleCustomAction = (action: any) => {
    if (batchVolumeData.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhuma nota com cubagem informada",
        variant: "destructive"
      });
      return;
    }

    action.onClick(batchVolumeData);
    
    if (onBatchAction) {
      onBatchAction(action.label, batchVolumeData);
    }
  };

  // Calcular totais do lote
  const calculateBatchTotals = () => {
    // Use actual NFe volume quantities instead of calculated cubagem volumes
    const totalVolumesNFe = processedNotasFiscais.reduce((sum, nota) => sum + (nota.quantidade_volumes || 1), 0);
    
    return {
      totalNotas: processedNotasFiscais.length,
      totalVolumes: totalVolumesNFe, // Use NFe volume quantities
      totalVolumesCubagem: batchVolumeData.reduce((sum, nota) => sum + nota.volumes.length, 0), // Calculated cubagem volumes
      totalM3: batchVolumeData.reduce((sum, nota) => sum + nota.totalM3, 0),
      totalPeso: batchVolumeData.reduce((sum, nota) => sum + nota.pesoTotal, 0),
      totalValor: batchVolumeData.reduce((sum, nota) => {
        const notaFiscal = processedNotasFiscais.find(nf => nf.id === nota.notaId);
        return sum + (parseFloat(notaFiscal?.valor_nota_fiscal || '0') || 0);
      }, 0)
    };
  };

  const totals = calculateBatchTotals();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Título e descrição */}
      {(finalConfig.title || finalConfig.description) && (
        <div className="mb-6">
          {finalConfig.title && (
            <h2 className="text-2xl font-heading mb-2">{finalConfig.title}</h2>
          )}
          {finalConfig.description && (
            <p className="text-gray-600">{finalConfig.description}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Área principal de cadastro/consulta */}
        <div className={finalConfig.showVolumeExtract ? "lg:col-span-2" : "lg:col-span-3"}>
          {(finalConfig.showCadastro || finalConfig.showConsulta) ? (
            <Tabs defaultValue="cadastrar" className="mb-6">
              <TabsList className="mb-4">
                {finalConfig.showCadastro && (
                  <TabsTrigger value="cadastrar">Cadastrar Nota</TabsTrigger>
                )}
                {finalConfig.showConsulta && (
                  <TabsTrigger value="consultar">Consultar Notas</TabsTrigger>
                )}
              </TabsList>
              
              {finalConfig.showCadastro && (
                <TabsContent value="cadastrar">
                  {typeof children === 'function' ? children({ onNotaProcessed: handleNotaProcessedInternal }) : children || (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Cadastro de Nota Fiscal</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Área de cadastro de notas fiscais</p>
                            <p className="text-sm">Integre com seu componente de cadastro existente</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Seção para adicionar cubagem individual */}
                      {processedNotasFiscais.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Notas Disponíveis para Cubagem</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {processedNotasFiscais.map((nota) => {
                                const hasCubagem = batchVolumeData.some(vol => vol.notaId === nota.id);
                                return (
                                  <div key={nota.id} className={`flex items-center justify-between p-3 border rounded-lg ${!hasCubagem ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                    <div className="flex-1">
                                      <div className="font-medium">NFe: {nota.numero}</div>
                                      <div className="text-sm text-gray-600">
                                        {nota.emitente_razao_social} → {nota.destinatario_razao_social}
                                      </div>
                                      {hasCubagem ? (
                                        <Badge variant="outline" className="mt-1 text-green-600 border-green-200">
                                          Dimensões informadas
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="mt-1 text-red-600 border-red-200">
                                          ⚠️ Dimensões não informadas
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="text-sm text-gray-600 mb-2">
                                        Vol: {nota.quantidade_volumes} | Peso: {nota.peso_bruto?.toFixed(2)} kg
                                      </div>
                                      <Button
                                        onClick={() => handleInformarCubagem(nota)}
                                        variant={hasCubagem ? "outline" : "default"}
                                        size="sm"
                                        className={`flex items-center gap-1 ${!hasCubagem ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
                                      >
                                        <Package className="w-3 h-3" />
                                        Informar Dimensões
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </TabsContent>
              )}
              
              {finalConfig.showConsulta && (
                <TabsContent value="consultar">
                  <Card>
                    <CardHeader>
                      <CardTitle>Consulta de Notas Fiscais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {processedNotasFiscais.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhuma nota fiscal processada</p>
                          </div>
                        ) : (
                          processedNotasFiscais.map((nota) => {
                            const hasCubagem = batchVolumeData.some(vol => vol.notaId === nota.id);
                            return (
                              <Card key={nota.id} className="border">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="font-medium">NFe: {nota.numero}</div>
                                      <div className="text-sm text-gray-600">Chave: {nota.chaveNF}</div>
                                      <div className="text-sm text-gray-600 mt-1">
                                        <span className="font-medium">Emitente:</span> {nota.emitente_razao_social}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        <span className="font-medium">Destinatário:</span> {nota.destinatario_razao_social}
                                      </div>
                                      
                                      {hasCubagem && (
                                        <Badge variant="outline" className="mt-2 text-green-600 border-green-200">
                                          Cubagem informada
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm mb-2">
                                        <div>Vol: {nota.quantidade_volumes}</div>
                                        <div>Peso: {nota.peso_bruto?.toFixed(2)} kg</div>
                                        <div>Valor: R$ {parseFloat(nota.valor_nota_fiscal || '0').toFixed(2)}</div>
                                      </div>
                                      
                                      <Button
                                        onClick={() => handleInformarCubagem(nota)}
                                        variant={hasCubagem ? "outline" : "default"}
                                        size="sm"
                                        className={`flex items-center gap-1 ${!hasCubagem ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
                                      >
                                        <Package className="w-3 h-3" />
                                        Informar Dimensões
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          ) : (
            children && <div className="mb-6">{children}</div>
          )}
        </div>

        {/* Extrato de Volumes */}
        {finalConfig.showVolumeExtract && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  Extrato de Volumes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {processedNotasFiscais.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma nota processada</p>
                    <p className="text-sm">Processe notas na aba "Cadastrar Nota" ou "Consultar Notas"</p>
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
                                    <div className="font-semibold">{(notaCubagem as any).totalM3?.toFixed(2) || '0.00'} m³</div>
                                    <div className="text-gray-600">{(notaCubagem as any).pesoTotal?.toFixed(2) || nota.peso_bruto || 0} kg</div>
                                  </>
                                ) : (
                                  <>
                                    <div className="font-semibold">- m³</div>
                                    <div className="text-gray-600">{nota.peso_bruto || 0} kg</div>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {temCubagem && notaCubagem ? (
                              <div className="space-y-1 text-xs">
                                {(notaCubagem as any).volumes?.map((vol: any) => (
                                  <div key={vol.volume} className="flex justify-between">
                                    <span>Vol {vol.volume}:</span>
                                    <span>{vol.altura}×{vol.largura}×{vol.comprimento} = {vol.m3.toFixed(2)}m³</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                  Emitente: {nota.emitente_razao_social}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Valor: R$ {nota.valor_nota_fiscal}
                                </p>
                                <Button
                                  onClick={() => handleInformarCubagem(nota)}
                                  variant="outline"
                                  size="sm"
                                  className="w-full bg-red-600 hover:bg-red-700 text-white border-red-600"
                                >
                                  <Package className="w-3 h-3 mr-2" />
                                  Informar Dimensões
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                    
                    {/* Resumo do lote */}
                    {processedNotasFiscais.length > 0 && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold">Resumo</h4>
                              <div className="text-sm text-gray-600">
                                {totals.totalNotas} notas • {totals.totalVolumes} volumes
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                {batchVolumeData.length} com cubagem
                              </div>
                              <div className="font-semibold">
                                {totals.totalM3.toFixed(2)} m³
                              </div>
                            </div>
                          </div>
                          
                          {totals.totalVolumes !== totals.totalVolumesCubagem && (
                            <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                              NFe: {totals.totalVolumes} volumes • Cubagem: {totals.totalVolumesCubagem} volumes
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modal de Cubagem */}
      <CubagemManager
        open={showCubagemModal}
        onClose={() => setShowCubagemModal(false)}
        onSave={handleSaveCubagem}
        notaInfo={selectedNotaForCubagem ? {
          id: selectedNotaForCubagem.id,
          numero: selectedNotaForCubagem.numero,
          peso: selectedNotaForCubagem.peso_bruto,
          quantidadeVolumes: selectedNotaForCubagem.quantidade_volumes
        } : null}
        existingVolumes={selectedNotaForCubagem ? 
          batchVolumeData.find(vol => vol.notaId === selectedNotaForCubagem.id)?.volumes : undefined}
      />
    </div>
  );
};

export default RecebimentoNotasManager;
export type { RecebimentoConfig, ProcessedNotaFiscal, RecebimentoNotasManagerProps };