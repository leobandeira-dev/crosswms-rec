import React from 'react';
import { Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrdemCarregamento {
  id: string;
  numero_ordem: string;
  tipo_movimentacao?: string;
  subtipo_operacao?: string;
  status: string;
  data_criacao?: string;
  data_programada?: string;
  prioridade?: string;
  modulo?: string;
  notasFiscais?: any[];
  volumes?: any[];
  totalNotas: number;
  totalValor: number;
  totalPeso: number;
  totalVolumes: number;
  observacoes?: string;
  created_by?: string;
  remetente_razao_social?: string;
  remetente_cnpj?: string;
  remetente_telefone?: string;
  remetente_endereco?: string;
  remetente_numero?: string;
  remetente_complemento?: string;
  remetente_bairro?: string;
  remetente_cidade?: string;
  remetente_uf?: string;
  remetente_cep?: string;
  destinatario_razao_social?: string;
  destinatario_cnpj?: string;
  destinatario_telefone?: string;
  destinatario_endereco?: string;
  destinatario_numero?: string;
  destinatario_complemento?: string;
  destinatario_bairro?: string;
  destinatario_cidade?: string;
  destinatario_uf?: string;
  destinatario_cep?: string;
}

interface ImpressaoOrdemCargaProps {
  ordem: OrdemCarregamento;
  onPrint?: () => void;
  onDownloadPDF?: () => void;
}

export function ImpressaoOrdemCarga({ ordem, onPrint, onDownloadPDF }: ImpressaoOrdemCargaProps) {
  const { toast } = useToast();

  const handlePrint = () => {
    // Abrir janela de impressão
    window.print();
    onPrint?.();
    toast({
      title: "Impressão iniciada",
      description: "A ordem de carga está sendo preparada para impressão."
    });
  };

  const handleDownloadPDF = async () => {
    try {
      // Implementar geração de PDF usando html2canvas + jsPDF
      const { jsPDF } = await import('jspdf');
      const html2canvas = await import('html2canvas');
      
      const element = document.getElementById('ordem-carga-print');
      if (!element) return;

      const canvas = await html2canvas.default(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`ordem-carga-${ordem.numero_ordem}.pdf`);
      onDownloadPDF?.();
      
      toast({
        title: "PDF gerado com sucesso",
        description: `Arquivo ordem-carga-${ordem.numero_ordem}.pdf foi baixado.`
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o arquivo PDF.",
        variant: "destructive"
      });
    }
  };

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return '';
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatCEP = (cep: string) => {
    if (!cep) return '';
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatDate = (date: string) => {
    if (!date) return 'Não informada';
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pendente_processamento': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'em_processamento': { label: 'Em Processamento', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'concluido': { label: 'Concluído', color: 'bg-green-100 text-green-800 border-green-200' },
      'cancelado': { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  // Calcular totais da ordem
  const calcularTotais = () => {
    if (!ordem.notasFiscais || ordem.notasFiscais.length === 0) {
      return { valorTotal: 0, pesoTotal: 0, totalVolumes: 0 };
    }
    
    const valorTotal = ordem.notasFiscais.reduce((total: number, nota: any) => {
      const valor = parseFloat(nota.valor_nota_fiscal?.toString() || '0');
      return total + valor;
    }, 0);
    
    const pesoTotal = ordem.notasFiscais.reduce((total: number, nota: any) => {
      const peso = parseFloat(nota.peso_bruto?.toString() || '0');
      return total + peso;
    }, 0);
    
    const totalVolumes = ordem.notasFiscais.reduce((total: number, nota: any) => {
      const volumes = parseInt(nota.quantidade_volumes?.toString() || '0');
      return total + volumes;
    }, 0);
    
    return { valorTotal, pesoTotal, totalVolumes };
  };

  // Calcular maiores dimensões
  const calcularMaioresDimensoes = () => {
    if (!ordem.volumes || ordem.volumes.length === 0) return 'Dimensões não informadas';
    
    const alturas = ordem.volumes.map(v => parseFloat(v.altura_cm || '0') / 100);
    const larguras = ordem.volumes.map(v => parseFloat(v.largura_cm || '0') / 100);
    const comprimentos = ordem.volumes.map(v => parseFloat(v.comprimento_cm || '0') / 100);
    
    const maxAltura = Math.max(...alturas);
    const maxLargura = Math.max(...larguras);
    const maxComprimento = Math.max(...comprimentos);
    
    // Verificar se há pelo menos uma dimensão maior que zero
    if (maxAltura === 0 && maxLargura === 0 && maxComprimento === 0) {
      return 'Dimensões não informadas';
    }
    
    return `A: ${maxAltura.toFixed(2)} | L: ${maxLargura.toFixed(2)} | C: ${maxComprimento.toFixed(2)}`;
  };

  const totais = calcularTotais();

  return (
    <div className="space-y-4">
      {/* Botões de Ação */}
      <div className="flex gap-3 print:hidden">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
        <Button onClick={handleDownloadPDF} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Documento de Impressão */}
      <div id="ordem-carga-print" className="bg-white p-4 print:p-2 print:shadow-none shadow-lg rounded-lg max-w-4xl mx-auto">
        {/* Cabeçalho Compacto */}
        <div className="border-b border-blue-600 pb-2 mb-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-blue-600 mb-1">ORDEM DE CARGA</h1>
              <div className="text-xs text-gray-600">CrossWMS - Sistema de Gestão Logística | www.crosswms.com.br</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">{ordem.numero_ordem}</div>
              <div className="text-xs text-gray-600">{formatDate(ordem.data_programada || ordem.data_criacao || '')}</div>
            </div>
          </div>
        </div>

        {/* Informações Principais Compactas */}
        <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
          <div className="bg-blue-50 p-2 rounded border-l-2 border-blue-400">
            <div className="font-medium text-gray-600">Tipo</div>
            <div className="font-bold text-blue-700">{ordem.tipo_movimentacao || 'Saída'}</div>
          </div>
          <div className="bg-purple-50 p-2 rounded border-l-2 border-purple-400">
            <div className="font-medium text-gray-600">Operação</div>
            <div className="font-bold text-purple-700">{ordem.subtipo_operacao || 'Carregamento'}</div>
          </div>
          <div className="bg-green-50 p-2 rounded border-l-2 border-green-400">
            <div className="font-medium text-gray-600">Prioridade</div>
            <div className="font-bold text-green-700">{ordem.prioridade || 'Expressa'}</div>
          </div>
          <div className="bg-orange-50 p-2 rounded border-l-2 border-orange-400">
            <div className="font-medium text-gray-600">Módulo</div>
            <div className="font-bold text-orange-700">{ordem.modulo || 'Recebimento'}</div>
          </div>
        </div>

        {/* Dados do Remetente e Destinatário Compactos */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
          {/* Remetente */}
          <div className="border border-blue-200 rounded p-3 bg-blue-50">
            <h3 className="text-sm font-bold text-blue-700 mb-2 border-b border-blue-300 pb-1">
              📤 REMETENTE
            </h3>
            <div className="space-y-1">
              <div>
                <span className="font-bold text-gray-800 block">
                  {ordem.remetente_razao_social || 
                   (ordem.notasFiscais && ordem.notasFiscais.length > 0 ? ordem.notasFiscais[0].emitente_razao_social : null) || 
                   'Não informado'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">CNPJ:</span>
                  <div className="font-medium">
                    {formatCNPJ(ordem.remetente_cnpj || 
                      (ordem.notasFiscais && ordem.notasFiscais.length > 0 ? ordem.notasFiscais[0].emitente_cnpj : null) || 
                      '')}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Telefone:</span>
                  <div className="font-medium">{ordem.remetente_telefone || 'Não informado'}</div>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Endereço:</span>
                <div className="text-xs leading-tight">
                  {ordem.remetente_endereco ? (
                    <>
                      {ordem.remetente_endereco}, {ordem.remetente_numero || 'S/N'}
                      {ordem.remetente_complemento && ` - ${ordem.remetente_complemento}`}
                      <br />
                      {ordem.remetente_bairro} - {ordem.remetente_cidade}/{ordem.remetente_uf} - CEP: {formatCEP(ordem.remetente_cep || '')}
                    </>
                  ) : (
                    'Não informado'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Destinatário */}
          <div className="border border-green-200 rounded p-3 bg-green-50">
            <h3 className="text-sm font-bold text-green-700 mb-2 border-b border-green-300 pb-1">
              📥 DESTINATÁRIO
            </h3>
            <div className="space-y-1">
              <div>
                <span className="font-bold text-gray-800 block">
                  {ordem.destinatario_razao_social || 
                   (ordem.notasFiscais && ordem.notasFiscais.length > 0 ? ordem.notasFiscais[0].destinatario_razao_social : null) || 
                   'Não informado'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">CNPJ:</span>
                  <div className="font-medium">
                    {formatCNPJ(ordem.destinatario_cnpj || 
                      (ordem.notasFiscais && ordem.notasFiscais.length > 0 ? ordem.notasFiscais[0].destinatario_cnpj : null) || 
                      '')}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Telefone:</span>
                  <div className="font-medium">{ordem.destinatario_telefone || 'Não informado'}</div>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Endereço:</span>
                <div className="text-xs leading-tight">
                  {ordem.destinatario_endereco ? (
                    <>
                      {ordem.destinatario_endereco}, {ordem.destinatario_numero || 'S/N'}
                      {ordem.destinatario_complemento && ` - ${ordem.destinatario_complemento}`}
                      <br />
                      {ordem.destinatario_bairro} - {ordem.destinatario_cidade}/{ordem.destinatario_uf} - CEP: {formatCEP(ordem.destinatario_cep || '')}
                    </>
                  ) : (
                    'Não informado'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo da Carga Compacto */}
        <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
          <div className="bg-green-50 p-2 rounded border-l-2 border-green-400 text-center">
            <div className="font-medium text-gray-600">Valor Total</div>
            <div className="text-2xl font-bold text-green-700">
              R$ {totais.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-blue-50 p-2 rounded border-l-2 border-blue-400 text-center">
            <div className="font-medium text-gray-600">Peso Total</div>
            <div className="text-lg font-bold text-blue-700">{totais.pesoTotal.toFixed(2)} kg</div>
          </div>
          <div className="bg-purple-50 p-2 rounded border-l-2 border-purple-400 text-center">
            <div className="font-medium text-gray-600">Volumes</div>
            <div className="text-lg font-bold text-purple-700">{totais.totalVolumes}</div>
          </div>
          <div className="bg-orange-50 p-2 rounded border-l-2 border-orange-400 text-center">
            <div className="font-medium text-gray-600">Maiores Dimensões</div>
            <div className="text-sm font-bold text-orange-700">{calcularMaioresDimensoes()}</div>
          </div>
        </div>

        {/* Detalhes das Notas Fiscais Compactas */}
        {ordem.notasFiscais && ordem.notasFiscais.length > 0 && (
          <div className="mb-3">
            <h3 className="text-sm font-bold text-gray-700 mb-2 border-b border-gray-300 pb-1">
              📋 NOTAS FISCAIS ({ordem.notasFiscais.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-1 py-1 text-left font-medium">Número</th>
                    <th className="border border-gray-300 px-1 py-1 text-left font-medium">Emitente</th>
                    <th className="border border-gray-300 px-1 py-1 text-left font-medium">Destinatário</th>
                    <th className="border border-gray-300 px-1 py-1 text-right font-medium">Valor</th>
                    <th className="border border-gray-300 px-1 py-1 text-right font-medium">Peso</th>
                    <th className="border border-gray-300 px-1 py-1 text-right font-medium">Vol</th>
                  </tr>
                </thead>
                <tbody>
                  {ordem.notasFiscais.map((nota: any, index: number) => (
                    <tr key={index} className="leading-tight">
                      <td className="border border-gray-300 px-1 py-1 font-medium">{nota.numero_nota || 'N/A'}</td>
                      <td className="border border-gray-300 px-1 py-1">{nota.emitente_razao_social || 'N/A'}</td>
                      <td className="border border-gray-300 px-1 py-1">{nota.destinatario_razao_social || 'N/A'}</td>
                      <td className="border border-gray-300 px-1 py-1 text-right">
                        R$ {parseFloat(nota.valor_nota_fiscal?.toString() || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border border-gray-300 px-1 py-1 text-right">{parseFloat(nota.peso_bruto?.toString() || '0').toFixed(2)} kg</td>
                      <td className="border border-gray-300 px-1 py-1 text-right">{nota.quantidade_volumes || '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Observações Compactas */}
        {ordem.observacoes && (
          <div className="mb-3">
            <h3 className="text-sm font-bold text-gray-700 mb-1 border-b border-gray-300 pb-1">
              📝 OBSERVAÇÕES
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
              <p className="text-xs text-gray-800 leading-tight">{ordem.observacoes}</p>
            </div>
          </div>
        )}

        {/* Rodapé Compacto */}
        <div className="border-t border-gray-300 pt-2 mt-3">
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
            <div>
              <span className="font-medium">Criação:</span> {formatDate(ordem.data_criacao || '')}
            </div>
            <div>
              <span className="font-medium">Criado por:</span> {ordem.created_by || 'Sistema'}
            </div>
            <div>
              <span className="font-medium">Módulo:</span> {ordem.modulo || 'Recebimento'}
            </div>
          </div>
          
          <div className="text-center mt-2 pt-1 border-t border-gray-200 text-xs text-gray-500">
            CrossWMS | Gerado em {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
          </div>
        </div>
      </div>
    </div>
  );
}