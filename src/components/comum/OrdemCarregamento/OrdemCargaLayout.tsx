import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface OrdemCargaLayoutProps {
  carregamento: any;
  notasFiscais: any[];
  volumeData: any[];
  motorista?: any;
  veiculo?: any;
}

export default function OrdemCargaLayout({ carregamento, notasFiscais, volumeData, motorista, veiculo }: OrdemCargaLayoutProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById('ordem-carga-layout');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
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

      pdf.save(`ordem-carga-${carregamento?.numero_carregamento || 'documento'}.pdf`);
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  const calcularTotais = () => {
    const totalVolumes = (notasFiscais || []).reduce((sum: number, nf: any) => sum + parseInt(nf.quantidade_volumes || '0'), 0);
    const totalPeso = (notasFiscais || []).reduce((sum: number, nf: any) => sum + parseFloat(nf.peso_bruto || '0'), 0);
    const totalValor = (notasFiscais || []).reduce((sum: number, nf: any) => sum + parseFloat(nf.valor_nota_fiscal || '0'), 0);
    const totalM3 = (volumeData || []).reduce((sum: number, vol: any) => sum + (vol.totalM3 || 0), 0);

    return { totalVolumes, totalPeso, totalValor, totalM3 };
  };

  const totais = calcularTotais();

  // Obter remetentes e destinatários únicos
  const remetentesUnicos = Array.from(new Set(
    (notasFiscais || []).map(nf => nf.emitente_cnpj)
  )).map(cnpj => {
    const nota = (notasFiscais || []).find(nf => nf.emitente_cnpj === cnpj);
    return {
      cnpj: nota?.emitente_cnpj || '',
      razaoSocial: nota?.emitente_razao_social || '',
      endereco: nota?.emitente_endereco || '',
      cidade: nota?.emitente_cidade || '',
      uf: nota?.emitente_uf || '',
      telefone: nota?.emitente_telefone || ''
    };
  });

  const destinatariosUnicos = Array.from(new Set(
    (notasFiscais || []).map(nf => nf.destinatario_cnpj)
  )).map(cnpj => {
    const nota = (notasFiscais || []).find(nf => nf.destinatario_cnpj === cnpj);
    return {
      cnpj: nota?.destinatario_cnpj || '',
      razaoSocial: nota?.destinatario_razao_social || '',
      endereco: nota?.destinatario_endereco || '',
      cidade: nota?.destinatario_cidade || '',
      uf: nota?.destinatario_uf || '',
      telefone: nota?.destinatario_telefone || ''
    };
  });

  return (
    <div className="w-full">
      {/* Layout de Impressão */}
      <div 
        id="ordem-carga-layout" 
        className="bg-white p-8 print:p-6 print:shadow-none shadow-lg max-w-4xl mx-auto text-black"
      >
        {/* Cabeçalho Principal */}
        <div className="border-b-4 border-blue-600 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">ORDEM DE CARGA</h1>
              <div className="text-lg font-semibold">
                Nº {carregamento?.numero_carregamento || 'N/A'} | ID: {carregamento?.id || 'N/A'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">CrossWMS - Sistema de Gestão Logística</div>
              <div className="text-lg font-bold">
                {carregamento?.tipo_operacao || 'N/A'} - {carregamento?.subtipo_operacao || 'N/A'}
              </div>
              <div className="text-sm">
                Data: {carregamento?.data_operacao ? new Date(carregamento.data_operacao).toLocaleDateString('pt-BR') : 'N/A'}
              </div>
              <div className={`inline-block px-3 py-1 rounded text-white text-sm font-medium ${
                carregamento?.prioridade === 'Alta' ? 'bg-red-600' : 
                carregamento?.prioridade === 'Média' ? 'bg-yellow-600' : 'bg-green-600'
              }`}>
                Prioridade: {carregamento?.prioridade || 'Normal'}
              </div>
            </div>
          </div>
        </div>

        {/* Informações Operacionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Dados do Motorista */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-bold text-blue-600 mb-3">MOTORISTA</h3>
            {motorista ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {motorista.foto_url && (
                    <img 
                      src={motorista.foto_url} 
                      alt="Foto do motorista" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-lg">{motorista.nome}</div>
                    <div className="text-sm text-gray-600">CPF: {motorista.cpf}</div>
                    <div className="text-sm text-gray-600">CNH: {motorista.numero_cnh}</div>
                  </div>
                </div>
                <div className="text-sm">
                  <div>Telefone: {motorista.telefone}</div>
                  <div>Categoria CNH: {motorista.categoria_cnh}</div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Motorista não selecionado</div>
            )}
          </div>

          {/* Dados do Veículo */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-bold text-blue-600 mb-3">VEÍCULO</h3>
            {veiculo ? (
              <div className="space-y-2">
                <div className="font-semibold text-lg">{veiculo.modelo} - {veiculo.marca}</div>
                <div className="space-y-1 text-sm">
                  <div>Placa: <span className="font-medium">{veiculo.placa}</span></div>
                  <div>Ano: {veiculo.ano}</div>
                  <div>Capacidade: {veiculo.capacidade_kg}kg</div>
                  <div>Volume Máx: {veiculo.capacidade_m3}m³</div>
                  <div>Tipo: {veiculo.tipo_veiculo}</div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Veículo não selecionado</div>
            )}
          </div>
        </div>

        {/* Remetentes */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-blue-600 mb-3">REMETENTES ({remetentesUnicos.length})</h3>
          <div className="space-y-3">
            {remetentesUnicos.map((remetente: any, index: number) => (
              <div key={index} className="border rounded-lg p-3 bg-blue-50">
                <div className="font-semibold">{remetente.razaoSocial}</div>
                <div className="text-sm text-gray-600">
                  CNPJ: {remetente.cnpj?.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}
                </div>
                <div className="text-sm">
                  {remetente.endereco}, {remetente.cidade}/{remetente.uf}
                </div>
                {remetente.telefone && (
                  <div className="text-sm">Tel: {remetente.telefone}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Destinatários */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-green-600 mb-3">DESTINATÁRIOS ({destinatariosUnicos.length})</h3>
          <div className="space-y-3">
            {destinatariosUnicos.map((destinatario: any, index: number) => (
              <div key={index} className="border rounded-lg p-3 bg-green-50">
                <div className="font-semibold">{destinatario.razaoSocial}</div>
                <div className="text-sm text-gray-600">
                  CNPJ: {destinatario.cnpj?.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}
                </div>
                <div className="text-sm">
                  {destinatario.endereco}, {destinatario.cidade}/{destinatario.uf}
                </div>
                {destinatario.telefone && (
                  <div className="text-sm">Tel: {destinatario.telefone}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tabela de Notas Fiscais */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">NOTAS FISCAIS ({notasFiscais.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Número</th>
                  <th className="border border-gray-300 p-2 text-left">Série</th>
                  <th className="border border-gray-300 p-2 text-left">Emitente</th>
                  <th className="border border-gray-300 p-2 text-left">Destinatário</th>
                  <th className="border border-gray-300 p-2 text-center">Volumes</th>
                  <th className="border border-gray-300 p-2 text-center">Peso (kg)</th>
                  <th className="border border-gray-300 p-2 text-center">Valor (R$)</th>
                </tr>
              </thead>
              <tbody>
                {notasFiscais.map((nf: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2">{nf.numero_nota}</td>
                    <td className="border border-gray-300 p-2">{nf.serie_nota}</td>
                    <td className="border border-gray-300 p-2 text-xs">
                      {nf.emitente_razao_social?.substring(0, 20)}...
                    </td>
                    <td className="border border-gray-300 p-2 text-xs">
                      {nf.destinatario_razao_social?.substring(0, 20)}...
                    </td>
                    <td className="border border-gray-300 p-2 text-center">{nf.quantidade_volumes}</td>
                    <td className="border border-gray-300 p-2 text-center">
                      {parseFloat(nf.peso_bruto || '0').toFixed(1)}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {parseFloat(nf.valor_nota_fiscal || '0').toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumo Totais */}
        <div className="border-t-2 border-gray-300 pt-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">RESUMO GERAL</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-100 p-3 rounded text-center">
              <div className="text-2xl font-bold text-blue-600">{totais.totalVolumes}</div>
              <div className="text-sm text-gray-600">Total Volumes</div>
            </div>
            <div className="bg-green-100 p-3 rounded text-center">
              <div className="text-2xl font-bold text-green-600">{totais.totalPeso.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Total Peso (kg)</div>
            </div>
            <div className="bg-yellow-100 p-3 rounded text-center">
              <div className="text-2xl font-bold text-yellow-600">{totais.totalM3.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total m³</div>
            </div>
            <div className="bg-purple-100 p-3 rounded text-center">
              <div className="text-lg font-bold text-purple-600">
                {totais.totalValor.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </div>
              <div className="text-sm text-gray-600">Total Valor</div>
            </div>
          </div>
        </div>

        {/* Observações */}
        {carregamento?.observacoes && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">OBSERVAÇÕES</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm">{carregamento.observacoes}</p>
            </div>
          </div>
        )}

        {/* Assinaturas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2">
              <div className="font-semibold">Responsável Operacional</div>
              <div className="text-sm text-gray-600">Data: ___/___/___</div>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2">
              <div className="font-semibold">Motorista</div>
              <div className="text-sm text-gray-600">Data: ___/___/___</div>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2">
              <div className="font-semibold">Supervisor</div>
              <div className="text-sm text-gray-600">Data: ___/___/___</div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
          <div>CrossWMS - Sistema de Gestão Logística</div>
          <div>Documento gerado em: {new Date().toLocaleString('pt-BR')}</div>
        </div>
      </div>
    </div>
  );
}