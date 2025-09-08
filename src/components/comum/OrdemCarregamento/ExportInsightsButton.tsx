import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

interface NotaFiscalData {
  id: string;
  chave_nota_fiscal: string;
  numero_nota: string;
  serie_nota: string;
  valor_nota_fiscal: number;
  peso_bruto: number;
  quantidade_volumes: number;
  emitente_razao_social: string;
  emitente_cnpj: string;
  emitente_uf: string;
  emitente_cidade: string;
  emitente_telefone?: string;
  destinatario_razao_social: string;
  destinatario_cnpj: string;
  destinatario_uf: string;
  destinatario_cidade: string;
  destinatario_telefone?: string;
}

interface VolumeData {
  notaId: string;
  numeroNota: string;
  volumes: Array<{
    volume: number;
    altura: number;
    largura: number;
    comprimento: number;
    m3: number;
  }>;
  totalM3: number;
  pesoTotal: number;
}

interface ExportInsightsProps {
  notasFiscais: NotaFiscalData[];
  volumeData: VolumeData[];
  title?: string;
}

export default function ExportInsightsButton({ 
  notasFiscais, 
  volumeData, 
  title = "Relatório de Insights NFe" 
}: ExportInsightsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const generateInsights = () => {
    // Calculate totals
    const totalNotas = notasFiscais.length;
    const totalValor = notasFiscais.reduce((sum, nf) => sum + (nf.valor_nota_fiscal || 0), 0);
    const totalPeso = notasFiscais.reduce((sum, nf) => sum + (nf.peso_bruto || 0), 0);
    const totalVolumes = notasFiscais.reduce((sum, nf) => sum + (nf.quantidade_volumes || 0), 0);
    const totalM3 = volumeData.reduce((sum, vol) => sum + (vol.totalM3 || 0), 0);

    // Group by emitente
    const emitenteGroups = notasFiscais.reduce((acc, nf) => {
      const key = nf.emitente_cnpj;
      if (!acc[key]) {
        acc[key] = {
          razaoSocial: nf.emitente_razao_social,
          cnpj: nf.emitente_cnpj,
          uf: nf.emitente_uf,
          cidade: nf.emitente_cidade,
          telefone: nf.emitente_telefone,
          notas: 0,
          valor: 0,
          peso: 0,
          volumes: 0
        };
      }
      acc[key].notas += 1;
      acc[key].valor += nf.valor_nota_fiscal || 0;
      acc[key].peso += nf.peso_bruto || 0;
      acc[key].volumes += nf.quantidade_volumes || 0;
      return acc;
    }, {} as Record<string, any>);

    // Group by destinatario
    const destinatarioGroups = notasFiscais.reduce((acc, nf) => {
      const key = nf.destinatario_cnpj;
      if (!acc[key]) {
        acc[key] = {
          razaoSocial: nf.destinatario_razao_social,
          cnpj: nf.destinatario_cnpj,
          uf: nf.destinatario_uf,
          cidade: nf.destinatario_cidade,
          telefone: nf.destinatario_telefone,
          notas: 0,
          valor: 0,
          peso: 0,
          volumes: 0
        };
      }
      acc[key].notas += 1;
      acc[key].valor += nf.valor_nota_fiscal || 0;
      acc[key].peso += nf.peso_bruto || 0;
      acc[key].volumes += nf.quantidade_volumes || 0;
      return acc;
    }, {} as Record<string, any>);

    // Group by UF
    const ufGroups = notasFiscais.reduce((acc, nf) => {
      const emitenteUF = nf.emitente_uf;
      const destinatarioUF = nf.destinatario_uf;
      
      if (!acc[emitenteUF]) acc[emitenteUF] = { emitente: 0, destinatario: 0 };
      if (!acc[destinatarioUF]) acc[destinatarioUF] = { emitente: 0, destinatario: 0 };
      
      acc[emitenteUF].emitente += 1;
      acc[destinatarioUF].destinatario += 1;
      
      return acc;
    }, {} as Record<string, any>);

    // Volume insights
    const volumesComDimensoes = volumeData.reduce((acc, vol) => {
      const dimensionados = vol.volumes.filter(v => v.altura > 0 || v.largura > 0 || v.comprimento > 0).length;
      return acc + dimensionados;
    }, 0);

    const volumesSemDimensoes = totalVolumes - volumesComDimensoes;

    return {
      resumo: {
        totalNotas,
        totalValor,
        totalPeso,
        totalVolumes,
        totalM3,
        volumesComDimensoes,
        volumesSemDimensoes,
        percentualDimensionado: totalVolumes > 0 ? (volumesComDimensoes / totalVolumes * 100) : 0
      },
      emitentes: Object.values(emitenteGroups),
      destinatarios: Object.values(destinatarioGroups),
      geografico: ufGroups,
      detalhesVolumes: volumeData
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number, decimals = 2) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const insights = generateInsights();
      const workbook = XLSX.utils.book_new();

      // Resumo sheet
      const resumoData = [
        ["RELATÓRIO DE INSIGHTS - NFe COLLECTION"],
        ["Data de Geração:", new Date().toLocaleString('pt-BR')],
        [""],
        ["RESUMO GERAL"],
        ["Total de Notas Fiscais:", insights.resumo.totalNotas],
        ["Valor Total:", formatCurrency(insights.resumo.totalValor)],
        ["Peso Total (kg):", formatNumber(insights.resumo.totalPeso)],
        ["Total de Volumes:", insights.resumo.totalVolumes],
        ["Volume Total (m³):", formatNumber(insights.resumo.totalM3)],
        [""],
        ["ANÁLISE DE CUBAGEM"],
        ["Volumes com Dimensões:", insights.resumo.volumesComDimensoes],
        ["Volumes sem Dimensões:", insights.resumo.volumesSemDimensoes],
        ["% Dimensionado:", formatNumber(insights.resumo.percentualDimensionado) + "%"],
      ];

      const resumoSheet = XLSX.utils.aoa_to_sheet(resumoData);
      XLSX.utils.book_append_sheet(workbook, resumoSheet, "Resumo");

      // Emitentes sheet
      const emitentesData = [
        ["CNPJ", "Razão Social", "UF", "Cidade", "Telefone", "Qtd Notas", "Valor Total", "Peso Total", "Volumes"]
      ];
      insights.emitentes.forEach(emit => {
        emitentesData.push([
          emit.cnpj,
          emit.razaoSocial,
          emit.uf,
          emit.cidade,
          emit.telefone || "",
          emit.notas.toString(),
          emit.valor.toString(),
          emit.peso.toString(),
          emit.volumes.toString()
        ]);
      });

      const emitentesSheet = XLSX.utils.aoa_to_sheet(emitentesData);
      XLSX.utils.book_append_sheet(workbook, emitentesSheet, "Emitentes");

      // Destinatários sheet
      const destinatariosData = [
        ["CNPJ", "Razão Social", "UF", "Cidade", "Telefone", "Qtd Notas", "Valor Total", "Peso Total", "Volumes"]
      ];
      insights.destinatarios.forEach(dest => {
        destinatariosData.push([
          dest.cnpj,
          dest.razaoSocial,
          dest.uf,
          dest.cidade,
          dest.telefone || "",
          dest.notas.toString(),
          dest.valor.toString(),
          dest.peso.toString(),
          dest.volumes.toString()
        ]);
      });

      const destinatariosSheet = XLSX.utils.aoa_to_sheet(destinatariosData);
      XLSX.utils.book_append_sheet(workbook, destinatariosSheet, "Destinatários");

      // Distribuição Geográfica sheet
      const geograficoData = [
        ["UF", "Como Emitente", "Como Destinatário", "Total"]
      ];
      Object.entries(insights.geografico).forEach(([uf, data]: [string, any]) => {
        geograficoData.push([
          uf,
          (data.emitente || 0).toString(),
          (data.destinatario || 0).toString(),
          ((data.emitente || 0) + (data.destinatario || 0)).toString()
        ]);
      });

      const geograficoSheet = XLSX.utils.aoa_to_sheet(geograficoData);
      XLSX.utils.book_append_sheet(workbook, geograficoSheet, "Distribuição UF");

      // Detalhes de Volumes sheet
      const volumesData = [
        ["Número Nota", "Volume", "Altura (m)", "Largura (m)", "Comprimento (m)", "m³", "Status"]
      ];
      insights.detalhesVolumes.forEach(vol => {
        vol.volumes.forEach(v => {
          const temDimensoes = v.altura > 0 || v.largura > 0 || v.comprimento > 0;
          volumesData.push([
            vol.numeroNota,
            v.volume.toString(),
            v.altura.toString(),
            v.largura.toString(),
            v.comprimento.toString(),
            v.m3.toString(),
            temDimensoes ? "Dimensionado" : "Pendente"
          ]);
        });
      });

      const volumesSheet = XLSX.utils.aoa_to_sheet(volumesData);
      XLSX.utils.book_append_sheet(workbook, volumesSheet, "Detalhes Volumes");

      // Export file
      const fileName = `insights-nfe-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Relatório Exportado!",
        description: `Arquivo ${fileName} baixado com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao exportar para Excel:", error);
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível gerar o arquivo Excel.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const insights = generateInsights();
      const pdf = new jsPDF();
      let yPosition = 20;

      // Title
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("RELATÓRIO DE INSIGHTS - NFe COLLECTION", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Data de Geração: ${new Date().toLocaleString('pt-BR')}`, 20, yPosition);
      yPosition += 20;

      // Resumo Geral
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("RESUMO GERAL", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      
      const resumoItems = [
        `Total de Notas Fiscais: ${insights.resumo.totalNotas}`,
        `Valor Total: ${formatCurrency(insights.resumo.totalValor)}`,
        `Peso Total: ${formatNumber(insights.resumo.totalPeso)} kg`,
        `Total de Volumes: ${insights.resumo.totalVolumes}`,
        `Volume Total: ${formatNumber(insights.resumo.totalM3)} m³`,
      ];

      resumoItems.forEach(item => {
        pdf.text(item, 20, yPosition);
        yPosition += 6;
      });

      yPosition += 10;

      // Análise de Cubagem
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("ANÁLISE DE CUBAGEM", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      
      const cubagemItems = [
        `Volumes com Dimensões: ${insights.resumo.volumesComDimensoes}`,
        `Volumes sem Dimensões: ${insights.resumo.volumesSemDimensoes}`,
        `Percentual Dimensionado: ${formatNumber(insights.resumo.percentualDimensionado)}%`,
      ];

      cubagemItems.forEach(item => {
        pdf.text(item, 20, yPosition);
        yPosition += 6;
      });

      // Top Emitentes
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("TOP EMITENTES", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      
      const topEmitentes = insights.emitentes
        .sort((a, b) => b.notas - a.notas)
        .slice(0, 10);

      topEmitentes.forEach((emit, index) => {
        const text = `${index + 1}. ${emit.razaoSocial} (${emit.uf}) - ${emit.notas} notas - ${formatCurrency(emit.valor)}`;
        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(text, 20, yPosition);
        yPosition += 5;
      });

      // Top Destinatários
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("TOP DESTINATÁRIOS", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      
      const topDestinatarios = insights.destinatarios
        .sort((a, b) => b.notas - a.notas)
        .slice(0, 10);

      topDestinatarios.forEach((dest, index) => {
        const text = `${index + 1}. ${dest.razaoSocial} (${dest.uf}) - ${dest.notas} notas - ${formatCurrency(dest.valor)}`;
        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(text, 20, yPosition);
        yPosition += 5;
      });

      const fileName = `insights-nfe-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Relatório Exportado!",
        description: `Arquivo ${fileName} baixado com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao exportar para PDF:", error);
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível gerar o arquivo PDF.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = async () => {
    setIsExporting(true);
    try {
      const insights = generateInsights();
      const jsonData = {
        metadata: {
          titulo: title,
          dataGeracao: new Date().toISOString(),
          versao: "1.0"
        },
        insights: insights,
        notasFiscais: notasFiscais,
        volumeData: volumeData
      };

      const dataStr = JSON.stringify(jsonData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `insights-nfe-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Dados Exportados!",
        description: "Arquivo JSON baixado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao exportar JSON:", error);
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível gerar o arquivo JSON.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (notasFiscais.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4" />
              Exportar Insights
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportToExcel} className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-green-600" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-red-600" />
          PDF (.pdf)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON} className="flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-600" />
          JSON (.json)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}