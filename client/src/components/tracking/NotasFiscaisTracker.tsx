import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Package, Truck, MapPin, Clock, AlertTriangle, CheckCircle, XCircle, Eye, Filter, Download, Edit, Save, X, Printer, Barcode, Calendar, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import JsBarcode from 'jsbarcode';

// Types for the tracking system
type StatusJornada = 
  | 'pendente_coleta'
  | 'coletado' 
  | 'armazenado'
  | 'em_transito'
  | 'filial_destino'
  | 'rota_entrega'
  | 'aguardando_descarga'
  | 'entregue';

type CategoriaPrioridade = 'normal' | 'prioridade' | 'expressa';
type StatusNota = 'disponivel' | 'bloqueada' | 'avariada' | 'extraviado';
type StatusAprovacao = 'pendente' | 'aprovado' | 'recusado';

interface HistoricoEvento {
  id: string;
  dataHora: string;
  status: StatusJornada;
  local: string;
  responsavel: string;
  observacoes?: string;
  coordenadas?: { lat: number; lng: number };
}

interface NotaFiscalRastreamento {
  id: string;
  numero: string;
  serie: string;
  remetente: string;
  destinatario: string;
  cidadeOrigem: string;
  cidadeDestino: string;
  statusAtual: StatusJornada;
  statusNota: StatusNota;
  prioridade: CategoriaPrioridade;
  aprovacao: StatusAprovacao;
  dataEmissao: string;
  previsaoEntrega: string;
  pesoTotal: number;
  valorTotal: number;
  volumes: number;
  historicoEventos: HistoricoEvento[];
  ultimaAtualizacao: string;
  // Enhanced tracking columns
  tipoEntrada: 'Coleta' | 'Recebimento' | 'Direto';
  numeroColeta?: string;
  numeroOR?: string;
  dataSolicitacao?: string;
  dataAprovacao?: string;
  dataEntrada?: string;
  dataCarregamento?: string;
  dataPrevisaoEntrega?: string;
  dataEntrega?: string;
  localizacaoAtual: string;
  kmFaltantes?: number;
  peso: number;
  motorista?: string;
  tipoFrete: 'CIF' | 'FOB';
  tipoTransporte: 'Fracionado' | 'Lotação' | 'Consolidação';
  ordemCarregamento?: string;
  numeroCteColeta?: string;
  numeroCteViagem?: string;
}

interface NotasFiscaisTrackerProps {
  title?: string;
  showFilters?: boolean;
  showTabs?: boolean;
  initialData?: NotaFiscalRastreamento[];
  onNotaSelect?: (nota: NotaFiscalRastreamento) => void;
  onStatusUpdate?: (notaId: string, newStatus: any) => void;
  customActions?: (nota: NotaFiscalRastreamento) => React.ReactNode;
}

const NotasFiscaisTracker: React.FC<NotasFiscaisTrackerProps> = ({
  title = "Rastreamento de Notas Fiscais",
  showFilters = true,
  showTabs = true,
  initialData = [],
  onNotaSelect,
  onStatusUpdate,
  customActions
}) => {
  const [location, setLocation] = useLocation();
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscalRastreamento[]>([]);
  const [activeTab, setActiveTab] = useState('todas');
  const [filtros, setFiltros] = useState({
    busca: '',
    status: '',
    prioridade: '',
    statusNota: '',
    aprovacao: ''
  });
  const [notaSelecionada, setNotaSelecionada] = useState<NotaFiscalRastreamento | null>(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    statusAtual: '',
    statusNota: '',
    prioridade: '',
    aprovacao: ''
  });

  // Configuration objects
  const statusJornadaConfig = {
    recebido: { label: 'Recebido', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    pendente_coleta: { label: 'Pendente Coleta', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    coletado: { label: 'Coletado', color: 'bg-blue-100 text-blue-800', icon: Package },
    armazenado: { label: 'Armazenado', color: 'bg-purple-100 text-purple-800', icon: Package },
    carregado: { label: 'Carregado', color: 'bg-purple-100 text-purple-800', icon: Truck },
    em_transito: { label: 'Em Trânsito', color: 'bg-orange-100 text-orange-800', icon: Truck },
    filial_destino: { label: 'Filial Destino', color: 'bg-indigo-100 text-indigo-800', icon: MapPin },
    rota_entrega: { label: 'Rota Entrega', color: 'bg-cyan-100 text-cyan-800', icon: Navigation },
    aguardando_descarga: { label: 'Aguardando Descarga', color: 'bg-gray-100 text-gray-800', icon: Clock },
    entregue: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle }
  };

  const prioridadeConfig = {
    normal: { 
      label: 'Normal', 
      color: 'bg-green-100 text-green-800 border-green-200',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      ringColor: 'ring-green-200'
    },
    prioridade: { 
      label: 'Prioridade', 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      ringColor: 'ring-blue-200'
    },
    expressa: { 
      label: 'Expressa', 
      color: 'bg-red-100 text-red-800 border-red-200',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      ringColor: 'ring-red-200'
    }
  };

  const statusNotaConfig = {
    disponivel: { label: 'Disponível', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    bloqueada: { label: 'Bloqueada', color: 'bg-red-100 text-red-800', icon: XCircle },
    avariada: { label: 'Avariada', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
    extraviado: { label: 'Extraviado', color: 'bg-gray-100 text-gray-800', icon: XCircle }
  };

  const statusAprovacaoConfig = {
    pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    aprovado: { label: 'Aprovado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    recusado: { label: 'Recusado', color: 'bg-red-100 text-red-800', icon: XCircle }
  };

  // Função auxiliar para obter configuração de status com fallback
  const getStatusConfig = (status: string, configObject: any) => {
    return configObject[status] || {
      label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
      color: 'bg-gray-100 text-gray-800',
      icon: AlertTriangle
    };
  };

  // Initialize data
  useEffect(() => {
    if (initialData.length > 0) {
      setNotasFiscais(initialData);
    }
  }, [initialData]);

  // Helper functions
  const calcularProgresso = (status: StatusJornada): number => {
    const statusOrder = ['pendente_coleta', 'coletado', 'armazenado', 'em_transito', 'filial_destino', 'rota_entrega', 'aguardando_descarga', 'entregue'];
    const currentIndex = statusOrder.indexOf(status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  const calcularDiasArmazenagem = (nota: NotaFiscalRastreamento): number => {
    const eventoArmazenagem = nota.historicoEventos.find(evento => evento.status === 'armazenado');
    if (!eventoArmazenagem) return 0;
    
    const dataArmazenagem = new Date(eventoArmazenagem.dataHora);
    const hoje = new Date();
    const diferenca = hoje.getTime() - dataArmazenagem.getTime();
    return Math.floor(diferenca / (1000 * 3600 * 24));
  };

  const calcularDiasEmissao = (nota: NotaFiscalRastreamento): number => {
    const dataEmissao = new Date(nota.dataEmissao);
    const hoje = new Date();
    const diferenca = hoje.getTime() - dataEmissao.getTime();
    return Math.floor(diferenca / (1000 * 3600 * 24));
  };

  const handleVerDetalhes = (nota: NotaFiscalRastreamento) => {
    setNotaSelecionada(nota);
    setShowDetalhes(true);
    if (onNotaSelect) {
      onNotaSelect(nota);
    }
  };

  const handleEditNote = (nota: NotaFiscalRastreamento) => {
    setEditingNote(nota.id);
    setEditValues({
      statusAtual: nota.statusAtual,
      statusNota: nota.statusNota,
      prioridade: nota.prioridade,
      aprovacao: nota.aprovacao
    });
  };

  const handleSaveEdit = (notaId: string) => {
    setNotasFiscais(prev => prev.map(nota => {
      if (nota.id === notaId) {
        const updatedNota = {
          ...nota,
          statusAtual: editValues.statusAtual as StatusJornada,
          statusNota: editValues.statusNota as StatusNota,
          prioridade: editValues.prioridade as CategoriaPrioridade,
          aprovacao: editValues.aprovacao as StatusAprovacao,
          ultimaAtualizacao: new Date().toISOString()
        };

        if (onStatusUpdate) {
          onStatusUpdate(notaId, editValues);
        }

        return updatedNota;
      }
      return nota;
    }));
    
    setEditingNote(null);
    toast.success('Status atualizado com sucesso!');
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditValues({
      statusAtual: '',
      statusNota: '',
      prioridade: '',
      aprovacao: ''
    });
  };

  // Função para imprimir DAMFE seguindo normas SEFAZ
  const printDAMFE = (nota: NotaFiscalRastreamento) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Não foi possível abrir a janela de impressão');
      return;
    }

    // Gerar código de barras para a chave da NFe
    const generateBarcode = (chave: string): string => {
      const canvas = document.createElement('canvas');
      try {
        JsBarcode(canvas, chave, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 10,
          margin: 5
        });
        return canvas.toDataURL();
      } catch (error) {
        console.error('Erro ao gerar código de barras:', error);
        return '';
      }
    };

    const barcodeData = generateBarcode(nota.id || '00000000000000000000000000000000000000000000');
    
    const damfeHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>DAMFE - Nota Fiscal ${nota.numero}</title>
          <meta charset="utf-8">
          <style>
            @page {
              margin: 5mm;
              size: A4;
            }
            
            body {
              margin: 0;
              padding: 0;
              font-family: 'Arial', sans-serif;
              font-size: 8pt;
              line-height: 1.1;
              color: #000;
              background: #fff;
            }
            
            .damfe-container {
              width: 100%;
              border: 2px solid #000;
              padding: 2mm;
            }
            
            .header {
              display: flex;
              border-bottom: 1px solid #000;
              margin-bottom: 2mm;
              padding-bottom: 2mm;
            }
            
            .header-left {
              flex: 4;
              display: flex;
              border-right: 1px solid #000;
              padding-right: 2mm;
            }
            
            .header-center {
              flex: 2;
              text-align: center;
              border-right: 1px solid #000;
              padding: 0 2mm;
            }
            
            .header-right {
              flex: 4;
              padding-left: 2mm;
            }
            
            .logo-placeholder {
              width: 40px;
              height: 40px;
              border: 1px solid #000;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 6pt;
              margin-right: 5mm;
            }
            
            .emitente-info h2 {
              margin: 0 0 1mm 0;
              font-size: 10pt;
              font-weight: bold;
            }
            
            .emitente-info p {
              margin: 0.5mm 0;
              font-size: 7pt;
            }
            
            .danfe-title h1 {
              margin: 0;
              font-size: 14pt;
              font-weight: bold;
            }
            
            .danfe-title p {
              margin: 1mm 0;
              font-size: 7pt;
            }
            
            .tipo-box {
              border: 2px solid #000;
              width: 20px;
              height: 20px;
              margin: 2mm auto;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12pt;
              font-weight: bold;
            }
            
            .nfe-number {
              margin-top: 2mm;
              font-size: 8pt;
            }
            
            .barcode-section {
              text-align: center;
            }
            
            .barcode {
              max-width: 100%;
              height: auto;
              margin: 1mm 0;
            }
            
            .chave-acesso {
              margin: 1mm 0 0.5mm 0;
              font-size: 6pt;
              font-weight: bold;
            }
            
            .chave-numero {
              font-size: 6pt;
              font-family: 'Courier New', monospace;
              word-break: break-all;
            }
            
            .section {
              margin: 2mm 0;
              border: 1px solid #000;
              padding: 1mm;
            }
            
            .section h3 {
              margin: 0 0 1mm 0;
              font-size: 8pt;
              font-weight: bold;
              background: #000;
              color: #fff;
              padding: 0.5mm;
              text-align: center;
            }
            
            .field {
              margin: 0.5mm 0;
            }
            
            .field label {
              font-size: 6pt;
              font-weight: bold;
              display: block;
              margin-bottom: 0.5mm;
            }
            
            .field span {
              font-size: 7pt;
              display: block;
              min-height: 3mm;
              border-bottom: 0.5pt solid #ccc;
            }
            
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2mm;
            }
            
            .grid-3 {
              display: grid;
              grid-template-columns: 2fr 1fr 1fr;
              gap: 2mm;
            }
            
            .grid-4 {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr 1fr;
              gap: 2mm;
            }
            
            .produtos-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 6pt;
            }
            
            .produtos-table th,
            .produtos-table td {
              border: 0.5pt solid #000;
              padding: 0.5mm;
              text-align: center;
              vertical-align: middle;
            }
            
            .produtos-table th {
              background: #f0f0f0;
              font-weight: bold;
            }
            
            .produtos-table td:nth-child(2) {
              text-align: left;
              max-width: 80mm;
              word-wrap: break-word;
            }
            
            .total-field {
              background: #f0f0f0;
            }
            
            .total-field span {
              font-weight: bold;
              border-bottom: 1pt solid #000;
            }
            
            .info-adicional {
              display: grid;
              grid-template-columns: 2fr 1fr;
              gap: 2mm;
              min-height: 30mm;
            }
            
            .info-complementar,
            .reservado-fisco {
              border: 0.5pt solid #000;
              padding: 1mm;
            }
            
            .info-complementar label,
            .reservado-fisco label {
              font-size: 6pt;
              font-weight: bold;
              display: block;
              margin-bottom: 1mm;
            }
            
            .info-complementar p {
              margin: 0.5mm 0;
              font-size: 6pt;
              line-height: 1.2;
            }
            
            .fisco-content {
              min-height: 25mm;
            }
            
            .footer {
              margin-top: 2mm;
              padding-top: 1mm;
              border-top: 1px solid #000;
              text-align: center;
            }
            
            .footer-text {
              font-size: 6pt;
              margin: 0;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="damfe-container">
            <!-- Cabeçalho -->
            <div class="header">
              <div class="header-left">
                <div class="logo-area">
                  <div class="logo-placeholder">LOGO</div>
                </div>
                <div class="emitente-info">
                  <h2>${nota.remetente}</h2>
                  <p>CNPJ: 00.000.000/0000-00</p>
                  <p>Endereço Completo da Empresa</p>
                  <p>${nota.cidadeOrigem}</p>
                </div>
              </div>
              <div class="header-center">
                <div class="danfe-title">
                  <h1>DANFE</h1>
                  <p>Documento Auxiliar da Nota Fiscal Eletrônica</p>
                  <p><strong>0 - ENTRADA</strong></p>
                  <p><strong>1 - SAÍDA</strong></p>
                  <div class="tipo-box">1</div>
                </div>
                <div class="nfe-number">
                  <p>Nº ${nota.numero}</p>
                  <p>SÉRIE ${nota.serie}</p>
                </div>
              </div>
              <div class="header-right">
                <div class="barcode-section">
                  ${barcodeData ? `<img src="${barcodeData}" alt="Código de barras" class="barcode" />` : ''}
                  <p class="chave-acesso">Chave de Acesso:</p>
                  <p class="chave-numero">${(nota.id || '0000000000000000000000000000000000000000000000').replace(/(.{4})/g, '$1 ')}</p>
                </div>
              </div>
            </div>

            <!-- Natureza da Operação -->
            <div class="section">
              <div class="field">
                <label>NATUREZA DA OPERAÇÃO:</label>
                <span>Venda de Mercadoria</span>
              </div>
            </div>

            <!-- Dados do Destinatário -->
            <div class="section">
              <h3>DESTINATÁRIO / REMETENTE</h3>
              <div class="grid-2">
                <div class="field">
                  <label>NOME/RAZÃO SOCIAL:</label>
                  <span>${nota.destinatario}</span>
                </div>
                <div class="field">
                  <label>CNPJ/CPF:</label>
                  <span>00.000.000/0000-00</span>
                </div>
              </div>
              <div class="grid-3">
                <div class="field">
                  <label>ENDEREÇO:</label>
                  <span>Endereço do Destinatário</span>
                </div>
                <div class="field">
                  <label>BAIRRO:</label>
                  <span>Centro</span>
                </div>
                <div class="field">
                  <label>CEP:</label>
                  <span>00000-000</span>
                </div>
              </div>
              <div class="grid-4">
                <div class="field">
                  <label>MUNICÍPIO:</label>
                  <span>${nota.cidadeDestino.split(' - ')[0] || nota.cidadeDestino}</span>
                </div>
                <div class="field">
                  <label>UF:</label>
                  <span>${nota.cidadeDestino.split(' - ')[1] || 'SP'}</span>
                </div>
                <div class="field">
                  <label>FONE/FAX:</label>
                  <span>(11) 0000-0000</span>
                </div>
                <div class="field">
                  <label>INSCRIÇÃO ESTADUAL:</label>
                  <span>ISENTO</span>
                </div>
              </div>
            </div>

            <!-- Produtos/Serviços -->
            <div class="section">
              <h3>DADOS DOS PRODUTOS / SERVIÇOS</h3>
              <table class="produtos-table">
                <thead>
                  <tr>
                    <th>CÓDIGO</th>
                    <th>DESCRIÇÃO DO PRODUTO / SERVIÇO</th>
                    <th>NCM/SH</th>
                    <th>CST</th>
                    <th>CFOP</th>
                    <th>UN</th>
                    <th>QUANT.</th>
                    <th>VL. UNIT.</th>
                    <th>VL. TOTAL</th>
                    <th>BC ICMS</th>
                    <th>VL. ICMS</th>
                    <th>VL. IPI</th>
                    <th>ALÍQ ICMS</th>
                    <th>ALÍQ IPI</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>001</td>
                    <td>Produto/Serviço conforme XML</td>
                    <td>0000.00.00</td>
                    <td>000</td>
                    <td>5102</td>
                    <td>UN</td>
                    <td>1,000</td>
                    <td>${(nota.valorTotal / (nota.volumes || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>${nota.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>0,00</td>
                    <td>0,00</td>
                    <td>0,00</td>
                    <td>0,00</td>
                    <td>0,00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Cálculo do Imposto -->
            <div class="section">
              <h3>CÁLCULO DO IMPOSTO</h3>
              <div class="grid-4">
                <div class="field">
                  <label>BASE DE CÁLCULO DO ICMS:</label>
                  <span>0,00</span>
                </div>
                <div class="field">
                  <label>VALOR DO ICMS:</label>
                  <span>0,00</span>
                </div>
                <div class="field">
                  <label>BASE DE CÁLCULO ICMS S.T.:</label>
                  <span>0,00</span>
                </div>
                <div class="field">
                  <label>VALOR DO ICMS SUBST.:</label>
                  <span>0,00</span>
                </div>
              </div>
              <div class="grid-4">
                <div class="field">
                  <label>VALOR TOTAL DOS PRODUTOS:</label>
                  <span>${nota.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="field">
                  <label>VALOR DO FRETE:</label>
                  <span>0,00</span>
                </div>
                <div class="field">
                  <label>VALOR DO SEGURO:</label>
                  <span>0,00</span>
                </div>
                <div class="field">
                  <label>DESCONTO:</label>
                  <span>0,00</span>
                </div>
              </div>
              <div class="grid-4">
                <div class="field">
                  <label>OUTRAS DESPESAS:</label>
                  <span>0,00</span>
                </div>
                <div class="field">
                  <label>VALOR DO IPI:</label>
                  <span>0,00</span>
                </div>
                <div class="field total-field">
                  <label>VALOR TOTAL DA NOTA:</label>
                  <span><strong>R$ ${nota.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                </div>
                <div class="field"></div>
              </div>
            </div>

            <!-- Transportador/Volumes -->
            <div class="section">
              <h3>TRANSPORTADOR / VOLUMES TRANSPORTADOS</h3>
              <div class="grid-2">
                <div class="field">
                  <label>NOME/RAZÃO SOCIAL:</label>
                  <span>Transportadora Responsável</span>
                </div>
                <div class="field">
                  <label>FRETE POR CONTA:</label>
                  <span>0 - EMITENTE (${nota.tipoFrete || 'CIF'})</span>
                </div>
              </div>
              <div class="grid-4">
                <div class="field">
                  <label>QUANTIDADE:</label>
                  <span>${nota.volumes || 1}</span>
                </div>
                <div class="field">
                  <label>ESPÉCIE:</label>
                  <span>VOL</span>
                </div>
                <div class="field">
                  <label>PESO LÍQUIDO:</label>
                  <span>${((nota.peso || nota.pesoTotal) * 0.9).toFixed(3)} kg</span>
                </div>
                <div class="field">
                  <label>PESO BRUTO:</label>
                  <span>${(nota.peso || nota.pesoTotal).toFixed(3)} kg</span>
                </div>
              </div>
            </div>

            <!-- Dados Adicionais -->
            <div class="section">
              <h3>DADOS ADICIONAIS</h3>
              <div class="info-adicional">
                <div class="info-complementar">
                  <label>INFORMAÇÕES COMPLEMENTARES:</label>
                  <p>Documento emitido por ME ou EPP optante pelo Simples Nacional.</p>
                  <p>Não gera direito a crédito fiscal de ICMS.</p>
                  <p>Data/Hora de Emissão: ${new Date(nota.dataEmissao).toLocaleString('pt-BR')}</p>
                  <p>Data/Hora da Impressão: ${new Date().toLocaleString('pt-BR')}</p>
                </div>
                <div class="reservado-fisco">
                  <label>RESERVADO AO FISCO:</label>
                  <div class="fisco-content"></div>
                </div>
              </div>
            </div>

            <!-- Rodapé -->
            <div class="footer">
              <p class="footer-text">
                Consulte a autenticidade no site da SEFAZ ou através do aplicativo 
                "De olho na nota", disponível na AppStore (Apple) e PlayStore (Android)
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(damfeHTML);
    printWindow.document.close();
    printWindow.focus();
    
    // Aguardar carregamento e imprimir
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);

    toast.success(`DAMFE da NF ${nota.numero} enviado para impressão`);
  };

  const handlePrintNota = async (nota: NotaFiscalRastreamento) => {
    try {
      toast.loading('Gerando DANFE via meudanfe.com.br...');

      // Chamar API para gerar DANFE usando meudanfe.com.br
      const response = await fetch('/api/danfe/gerar-danfe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          notaId: nota.id,
          chave: nota.chave_acesso || nota.numero
        })
      });

      const result = await response.json();
      toast.dismiss();

      if (result.success && result.pdfUrl) {
        // Se é um data URL (base64), abrir diretamente
        if (result.pdfUrl.startsWith('data:application/pdf;base64,')) {
          // Criar um blob para melhor manuseio do PDF
          const base64Data = result.pdfUrl.split(',')[1];
          const binaryData = atob(base64Data);
          const bytes = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
          }
          
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          window.open(url, '_blank');
          
          // Limpar URL após um tempo
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        } else {
          // Se é URL normal, abrir em nova janela
          window.open(result.pdfUrl, '_blank');
        }
        
        toast.success(`${result.message} ${result.provider ? `(via ${result.provider})` : ''}`);
      } else {
        console.error('Erro na API DANFE:', result);
        toast.error(result.error || 'Erro ao gerar DANFE');
        
        // Fallback: usar gerador interno apenas se necessário
        if (!result.error?.includes('NFe Local')) {
          toast.info('Tentando gerador interno como alternativa...');
          setTimeout(() => generateInternalDANFE(nota), 1000);
        }
      }

    } catch (error) {
      console.error('Erro ao gerar DANFE:', error);
      toast.dismiss();
      toast.error('Erro de conectividade. Usando gerador interno...');
      
      // Fallback: usar gerador interno
      generateInternalDANFE(nota);
    }
  };

  // Função fallback para gerador DAMFE interno
  const generateInternalDANFE = (nota: NotaFiscalRastreamento) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Não foi possível abrir a janela de impressão');
      return;
    }

    // Criar versão interna do DAMFE para casos de fallback
    const damfeHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>DAMFE - Nota Fiscal ${nota.numero}</title>
          <meta charset="utf-8">
          <style>
            @page { margin: 10mm; size: A4; }
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; font-size: 11px; }
            .damfe-container { border: 2px solid #000; padding: 8px; }
            .header { display: flex; border-bottom: 1px solid #000; margin-bottom: 8px; padding-bottom: 8px; }
            .header-left { flex: 3; border-right: 1px solid #000; padding-right: 8px; }
            .header-center { flex: 1; text-align: center; border-right: 1px solid #000; padding: 0 8px; }
            .header-right { flex: 3; padding-left: 8px; }
            .danfe-title { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
            .section { border: 1px solid #000; margin: 4px 0; padding: 4px; }
            .section-title { background: #000; color: #fff; padding: 2px 4px; margin: -4px -4px 4px -4px; font-weight: bold; text-align: center; }
            .field { margin: 2px 0; }
            .field-label { font-size: 8px; font-weight: bold; }
            .field-value { border-bottom: 0.5px solid #ccc; min-height: 12px; }
            .grid { display: grid; gap: 8px; }
            .grid-2 { grid-template-columns: 1fr 1fr; }
            .grid-3 { grid-template-columns: 2fr 1fr 1fr; }
            .grid-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
            .produtos-table { width: 100%; border-collapse: collapse; font-size: 8px; }
            .produtos-table th, .produtos-table td { border: 1px solid #000; padding: 2px; text-align: center; }
            .produtos-table th { background: #f0f0f0; font-weight: bold; }
            .total-value { font-size: 14px; font-weight: bold; }
            .barcode { max-width: 100%; height: 40px; }
            .chave-display { font-family: monospace; font-size: 8px; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="damfe-container">
            <div class="header">
              <div class="header-left">
                <div style="font-weight: bold; font-size: 12px;">${nota.remetente}</div>
                <div style="font-size: 9px; margin-top: 4px;">
                  CNPJ: 00.000.000/0000-00<br>
                  ${nota.cidadeOrigem}<br>
                  Fone: (11) 0000-0000
                </div>
              </div>
              <div class="header-center">
                <div class="danfe-title">DANFE</div>
                <div style="font-size: 8px;">Documento Auxiliar da<br>Nota Fiscal Eletrônica</div>
                <div style="margin: 8px 0; font-size: 8px;">0-ENTRADA | 1-SAÍDA</div>
                <div style="border: 2px solid #000; width: 30px; height: 30px; margin: 4px auto; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold;">1</div>
                <div style="font-size: 8px;">Nº ${nota.numero.padStart(9, '0')}</div>
                <div style="font-size: 8px;">SÉRIE ${nota.serie.padStart(3, '0')}</div>
              </div>
              <div class="header-right">
                <div style="text-align: center;">
                  <div style="font-size: 8px; font-weight: bold;">CHAVE DE ACESSO</div>
                  <div class="chave-display">${(nota.id || '0000000000000000000000000000000000000000000').replace(/(.{4})/g, '$1 ')}</div>
                  <div style="margin: 4px 0; font-size: 7px;">
                    Consulta de autenticidade no portal nacional da NF-e<br>
                    www.nfe.fazenda.gov.br/portal ou no site da Sefaz Autorizadora
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="grid grid-2">
                <div class="field">
                  <div class="field-label">NATUREZA DA OPERAÇÃO</div>
                  <div class="field-value">Prestação de Serviço de Transporte</div>
                </div>
                <div class="field">
                  <div class="field-label">PROTOCOLO DE AUTORIZAÇÃO DE USO</div>
                  <div class="field-value">${new Date().getTime()} - ${new Date().toLocaleString('pt-BR')}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">DESTINATÁRIO / REMETENTE</div>
              <div class="grid grid-2">
                <div class="field">
                  <div class="field-label">NOME/RAZÃO SOCIAL</div>
                  <div class="field-value">${nota.destinatario}</div>
                </div>
                <div class="field">
                  <div class="field-label">CNPJ/CPF</div>
                  <div class="field-value">00.000.000/0000-00</div>
                </div>
              </div>
              <div class="grid grid-3">
                <div class="field">
                  <div class="field-label">ENDEREÇO</div>
                  <div class="field-value">Endereço do Destinatário</div>
                </div>
                <div class="field">
                  <div class="field-label">MUNICÍPIO</div>
                  <div class="field-value">${nota.cidadeDestino.split(' - ')[0] || nota.cidadeDestino}</div>
                </div>
                <div class="field">
                  <div class="field-label">UF</div>
                  <div class="field-value">${nota.cidadeDestino.split(' - ')[1] || 'SP'}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">DADOS DOS PRODUTOS / SERVIÇOS</div>
              <table class="produtos-table">
                <thead>
                  <tr>
                    <th>CÓDIGO</th>
                    <th>DESCRIÇÃO DO PRODUTO / SERVIÇO</th>
                    <th>NCM/SH</th>
                    <th>CFOP</th>
                    <th>UN</th>
                    <th>QUANT.</th>
                    <th>VL. UNIT.</th>
                    <th>VL. TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>001</td>
                    <td>Frete referente NF ${nota.numero}</td>
                    <td>49019900</td>
                    <td>5353</td>
                    <td>UN</td>
                    <td>1,000</td>
                    <td>${nota.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>${nota.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="section">
              <div class="section-title">CÁLCULO DO IMPOSTO</div>
              <div class="grid grid-4">
                <div class="field">
                  <div class="field-label">BASE CÁLC. ICMS</div>
                  <div class="field-value">${nota.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div class="field">
                  <div class="field-label">VALOR ICMS</div>
                  <div class="field-value">${(nota.valorTotal * 0.12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div class="field">
                  <div class="field-label">VL. TOTAL PROD.</div>
                  <div class="field-value">${nota.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div class="field">
                  <div class="field-label total-value">VL. TOTAL NF</div>
                  <div class="field-value total-value">R$ ${nota.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">TRANSPORTADOR / VOLUMES TRANSPORTADOS</div>
              <div class="grid grid-2">
                <div class="field">
                  <div class="field-label">NOME/RAZÃO SOCIAL</div>
                  <div class="field-value">CROSSWMS TRANSPORTES LTDA</div>
                </div>
                <div class="field">
                  <div class="field-label">FRETE POR CONTA</div>
                  <div class="field-value">0 - EMITENTE (${nota.tipoFrete || 'CIF'})</div>
                </div>
              </div>
              <div class="grid grid-4">
                <div class="field">
                  <div class="field-label">QUANTIDADE</div>
                  <div class="field-value">${nota.volumes || 1}</div>
                </div>
                <div class="field">
                  <div class="field-label">ESPÉCIE</div>
                  <div class="field-value">VOLUMES</div>
                </div>
                <div class="field">
                  <div class="field-label">PESO LÍQUIDO</div>
                  <div class="field-value">${((nota.peso || nota.pesoTotal) * 0.9).toFixed(3)} kg</div>
                </div>
                <div class="field">
                  <div class="field-label">PESO BRUTO</div>
                  <div class="field-value">${(nota.peso || nota.pesoTotal).toFixed(3)} kg</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">DADOS ADICIONAIS</div>
              <div class="field">
                <div class="field-label">INFORMAÇÕES COMPLEMENTARES</div>
                <div class="field-value">
                  Nota Fiscal de Serviço de Transporte - Sistema CROSSWMS<br>
                  Ordem de Carregamento: ${nota.ordemCarregamento || 'N/A'}<br>
                  Data/Hora de Emissão: ${new Date(nota.dataEmissao).toLocaleString('pt-BR')}<br>
                  Data/Hora da Impressão: ${new Date().toLocaleString('pt-BR')}<br>
                  Lei da Transparência - Total de Tributos: R$ ${(nota.valorTotal * 0.21).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div style="text-align: center; margin-top: 16px; font-size: 8px;">
              <div>Consulte a autenticidade no site da SEFAZ ou através do aplicativo "De olho na nota"</div>
              <div>Documento emitido em ${new Date().toLocaleString('pt-BR')}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(damfeHTML);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);

    toast.success(`DAMFE interno da NF ${nota.numero} enviado para impressão`);
  };

  // Filter functions
  const getNotasByTab = (tab: string) => {
    switch (tab) {
      case 'pendentes':
        return notasFiscais.filter(nota => 
          nota.statusAtual === 'pendente_coleta' || 
          nota.statusAtual === 'coletado' || 
          nota.statusAtual === 'armazenado'
        );
      case 'em_transito':
        return notasFiscais.filter(nota => 
          nota.statusAtual === 'em_transito' || nota.statusAtual === 'armazenado'
        );
      case 'finalizadas':
        return notasFiscais.filter(nota => 
          nota.statusAtual === 'entregue'
        );
      case 'problemas':
        return notasFiscais.filter(nota => 
          nota.statusNota === 'bloqueada' || nota.statusNota === 'avariada' || nota.statusNota === 'extraviado'
        );
      case 'aprovacao_pendente':
        return notasFiscais.filter(nota => nota.aprovacao === 'pendente');
      default:
        return notasFiscais;
    }
  };

  const getTabCount = (tab: string) => getNotasByTab(tab).length;

  const notasTabFiltered = getNotasByTab(activeTab);

  const notasFiltradas = notasTabFiltered.filter(nota => {
    const buscaMatch = nota.numero.toLowerCase().includes(filtros.busca.toLowerCase()) ||
                     nota.remetente.toLowerCase().includes(filtros.busca.toLowerCase()) ||
                     nota.destinatario.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const statusMatch = !filtros.status || filtros.status === 'all' || nota.statusAtual === filtros.status;
    const prioridadeMatch = !filtros.prioridade || filtros.prioridade === 'all' || nota.prioridade === filtros.prioridade;
    const statusNotaMatch = !filtros.statusNota || filtros.statusNota === 'all' || nota.statusNota === filtros.statusNota;
    const aprovacaoMatch = !filtros.aprovacao || filtros.aprovacao === 'all' || nota.aprovacao === filtros.aprovacao;
    
    return buscaMatch && statusMatch && prioridadeMatch && statusNotaMatch && aprovacaoMatch;
  });

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{notasFiscais.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Trânsito</p>
                <p className="text-2xl font-bold">{getTabCount('em_transito')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold">{getTabCount('pendentes')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Entregues</p>
                <p className="text-2xl font-bold">{getTabCount('finalizadas')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      {showTabs && (
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 rounded-none border-b">
                <TabsTrigger 
                  value="todas"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
                >
                  Todas ({notasFiscais.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="pendentes"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
                >
                  Pendentes ({getTabCount('pendentes')})
                </TabsTrigger>
                <TabsTrigger 
                  value="em_transito"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
                >
                  Em Trânsito ({getTabCount('em_transito')})
                </TabsTrigger>
                <TabsTrigger 
                  value="finalizadas"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
                >
                  Finalizadas ({getTabCount('finalizadas')})
                </TabsTrigger>
                <TabsTrigger 
                  value="problemas"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent text-red-600"
                >
                  Problemas ({getTabCount('problemas')})
                </TabsTrigger>
                <TabsTrigger 
                  value="aprovacao_pendente"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-500 data-[state=active]:bg-transparent text-yellow-600"
                >
                  Aprovação ({getTabCount('aprovacao_pendente')})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avançados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="busca">Busca Geral</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="busca"
                    placeholder="Número da NF, remetente, destinatário..."
                    value={filtros.busca}
                    onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status na Jornada</Label>
                <Select value={filtros.status} onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {Object.entries(statusJornadaConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={filtros.prioridade} onValueChange={(value) => setFiltros(prev => ({ ...prev, prioridade: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as prioridades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as prioridades</SelectItem>
                    {Object.entries(prioridadeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status da Nota</Label>
                <Select value={filtros.statusNota} onValueChange={(value) => setFiltros(prev => ({ ...prev, statusNota: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {Object.entries(statusNotaConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Aprovação</Label>
                <Select value={filtros.aprovacao} onValueChange={(value) => setFiltros(prev => ({ ...prev, aprovacao: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as aprovações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as aprovações</SelectItem>
                    {Object.entries(statusAprovacaoConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Tracking Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50/50">
                <tr>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">NF</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Remetente</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Destinatário</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Aprovação</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Tipo Entrada</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Nº Coleta</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Nº OR</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Dt. Solicitação</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Dt. Aprovação</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Dt. Entrada</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Dt. Carregamento</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Prev. Entrega</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Dt. Entrega</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Localização</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Km Faltantes</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Peso</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Estágio</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Status</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Prioridade</th>
                  <th className="text-left p-2 font-medium text-gray-600 text-xs">Ações</th>
                </tr>
              </thead>
              <tbody>
                {notasFiltradas.map((nota) => {
                  const StatusNotaIcon = getStatusConfig(nota.statusNota, statusNotaConfig).icon;
                  const progresso = calcularProgresso(nota.statusAtual);
                  const prioridadeStyle = prioridadeConfig[nota.prioridade];

                  return (
                    <tr 
                      key={nota.id} 
                      className={`
                        border-b table-row-transition
                        ${nota.prioridade === 'expressa' ? 'priority-expressa' : ''}
                        ${nota.prioridade === 'prioridade' ? 'priority-prioridade' : ''}
                        ${nota.prioridade === 'normal' ? 'priority-normal' : ''}
                      `}
                    >
                      <td className="p-2">
                        <div className="font-medium text-xs">NF{nota.numero}</div>
                        <div className="text-xs text-gray-500">Série {nota.serie}</div>
                      </td>
                      <td className="p-2">
                        <div className="font-medium text-xs">{nota.remetente}</div>
                        <div className="text-xs text-gray-500">{nota.cidadeOrigem}</div>
                      </td>
                      <td className="p-2">
                        <div className="font-medium text-xs">{nota.destinatario}</div>
                        <div className="text-xs text-gray-500">{nota.cidadeDestino}</div>
                      </td>
                      <td className="p-2">
                        <Badge className={`text-xs ${statusAprovacaoConfig[nota.aprovacao || 'pendente'].color}`}>
                          {statusAprovacaoConfig[nota.aprovacao || 'pendente'].label}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-xs">
                          {nota.tipoEntrada || 'Direto'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="text-xs font-mono">{nota.numeroColeta || '-'}</div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs font-mono">{nota.numeroOR || '-'}</div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs">
                          {nota.dataSolicitacao ? new Date(nota.dataSolicitacao).toLocaleDateString('pt-BR') : '-'}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs">
                          {nota.dataAprovacao ? new Date(nota.dataAprovacao).toLocaleDateString('pt-BR') : '-'}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs">
                          {nota.dataEntrada ? new Date(nota.dataEntrada).toLocaleDateString('pt-BR') : '-'}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs">
                          {nota.dataCarregamento ? new Date(nota.dataCarregamento).toLocaleDateString('pt-BR') : '-'}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs">
                          {nota.dataPrevisaoEntrega ? new Date(nota.dataPrevisaoEntrega).toLocaleDateString('pt-BR') : '-'}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs">
                          {nota.dataEntrega ? new Date(nota.dataEntrega).toLocaleDateString('pt-BR') : '-'}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs font-medium">{nota.localizacaoAtual}</div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs">
                          {nota.kmFaltantes ? `${nota.kmFaltantes} km` : '-'}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs font-medium">{nota.peso} kg</div>
                      </td>
                      <td className="p-2">
                        {editingNote === nota.id ? (
                          <div className="space-y-2">
                            <Select value={editValues.statusAtual} onValueChange={(value) => setEditValues(prev => ({ ...prev, statusAtual: value }))}>
                              <SelectTrigger className="w-full text-xs">
                                <SelectValue placeholder="Estágio da Jornada" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(statusJornadaConfig).map(([key, config]) => (
                                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="w-full">
                              <Progress 
                                value={progresso} 
                                className={`h-2 transition-all duration-500 ${
                                  nota.prioridade === 'expressa' ? 'bg-red-100' : 
                                  nota.prioridade === 'prioridade' ? 'bg-blue-100' : 'bg-green-100'
                                }`}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Badge 
                              className={`
                                ${getStatusConfig(nota.statusAtual, statusJornadaConfig).color} 
                                text-xs px-2 py-1 
                                status-badge-transition badge-hover
                                ${nota.prioridade === 'expressa' ? 'ring-1 ring-red-300' : ''}
                                ${nota.prioridade === 'prioridade' ? 'ring-1 ring-blue-300' : ''}
                              `}
                            >
                              {getStatusConfig(nota.statusAtual, statusJornadaConfig).label}
                            </Badge>
                            <div className="w-full">
                              <Progress 
                                value={progresso} 
                                className={`h-2 transition-all duration-500 ${
                                  nota.prioridade === 'expressa' ? 'bg-red-100' : 
                                  nota.prioridade === 'prioridade' ? 'bg-blue-100' : 'bg-green-100'
                                }`}
                              />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        {editingNote === nota.id ? (
                          <Select value={editValues.statusNota} onValueChange={(value) => setEditValues(prev => ({ ...prev, statusNota: value }))}>
                            <SelectTrigger className="w-full text-xs">
                              <SelectValue placeholder="Status da Nota" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusNotaConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>{config.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`text-xs ${getStatusConfig(nota.statusNota, statusNotaConfig).color}`}>
                            <StatusNotaIcon className="h-3 w-3 mr-1" />
                            {getStatusConfig(nota.statusNota, statusNotaConfig).label}
                          </Badge>
                        )}
                      </td>
                      <td className="p-2">
                        {editingNote === nota.id ? (
                          <Select value={editValues.prioridade} onValueChange={(value) => setEditValues(prev => ({ ...prev, prioridade: value }))}>
                            <SelectTrigger className="w-full text-xs">
                              <SelectValue placeholder="Prioridade" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(prioridadeConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>{config.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge 
                            className={`
                              ${getStatusConfig(nota.prioridade, prioridadeConfig).color} 
                              text-xs px-2 py-1 
                              transition-all duration-300 
                              ${nota.prioridade === 'expressa' ? 'shadow-lg ring-2 ring-red-200' : ''}
                              ${nota.prioridade === 'prioridade' ? 'shadow-md ring-1 ring-blue-200' : ''}
                              hover:scale-105 hover:shadow-lg
                            `}
                          >
                            {getStatusConfig(nota.prioridade, prioridadeConfig).label}
                          </Badge>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          {editingNote === nota.id ? (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleSaveEdit(nota.id)}
                                className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                                title="Salvar Alterações"
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={handleCancelEdit}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                title="Cancelar Edição"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  const mappedData = {
                                    numero_nota: nota.numero,
                                    quantidade_volumes: nota.volumes?.toString() || '1',
                                    emitente_razao_social: nota.remetente,
                                    destinatario_razao_social: nota.destinatario,
                                    peso_bruto: nota.peso?.toString() || '1',
                                    chave_nota_fiscal: nota.id
                                  };
                                  localStorage.setItem('invoiceData', JSON.stringify(mappedData));
                                  
                                  // Store origin information for back navigation
                                  const ordemOrigem = {
                                    numero_ordem: 'Tracking de Notas Fiscais',
                                    tipo: 'tracking',
                                    data: mappedData,
                                    rota_origem: '/armazenagem/tracking'
                                  };
                                  sessionStorage.setItem('ordem_origem_etiqueta', JSON.stringify(ordemOrigem));
                                  
                                  setLocation('/armazenagem/geracao-etiquetas');
                                }}
                                className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                                title="Imprimir Etiquetas"
                              >
                                <Barcode className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handlePrintNota(nota)}
                                className="h-6 w-6 p-0 text-purple-600 hover:text-purple-700"
                                title="Imprimir DAMFE (Padrão SEFAZ)"
                              >
                                <Printer className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditNote(nota)}
                                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                                title="Editar Status"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleVerDetalhes(nota)}
                                className="h-6 w-6 p-0 text-gray-600 hover:text-gray-700"
                                title="Ver Detalhes"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {customActions && customActions(nota)}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetalhes} onOpenChange={setShowDetalhes}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Detalhes da Nota Fiscal {notaSelecionada?.numero}
            </DialogTitle>
          </DialogHeader>
          {notaSelecionada && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Remetente</h3>
                  <p className="text-sm text-gray-600">{notaSelecionada.remetente}</p>
                  <p className="text-sm text-gray-500">{notaSelecionada.cidadeOrigem}</p>
                </div>
                <div>
                  <h3 className="font-medium">Destinatário</h3>
                  <p className="text-sm text-gray-600">{notaSelecionada.destinatario}</p>
                  <p className="text-sm text-gray-500">{notaSelecionada.cidadeDestino}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Histórico de Eventos</h3>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {notaSelecionada.historicoEventos.map((evento) => (
                      <div key={evento.id} className="border-l-2 border-blue-200 pl-4 pb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusConfig(evento.status, statusJornadaConfig).color}>
                            {getStatusConfig(evento.status, statusJornadaConfig).label}
                          </Badge>
                          <span className="text-sm text-gray-500">{evento.dataHora}</span>
                        </div>
                        <p className="text-sm font-medium">{evento.local}</p>
                        <p className="text-sm text-gray-600">{evento.observacoes}</p>
                        <p className="text-xs text-gray-500">Responsável: {evento.responsavel}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotasFiscaisTracker;
export type { NotaFiscalRastreamento, StatusJornada, StatusNota, CategoriaPrioridade, StatusAprovacao, NotasFiscaisTrackerProps };