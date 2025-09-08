import React from 'react';
import { formatDate } from '@/lib/utils';

interface OrdemCargaLayoutProps {
  data: any;
}

const OrdemCargaLayout: React.FC<OrdemCargaLayoutProps> = ({ data }) => {
  const { formData, nfesToDisplay = [] } = data;

  // Calcular totais
  const totals = nfesToDisplay.reduce((acc: any, nfe: any) => ({
    volumes: acc.volumes + (nfe.volume || 0),
    peso: acc.peso + (nfe.peso || 0),
    valor: acc.valor + (nfe.valorDeclarado || 0),
  }), { volumes: 0, peso: 0, valor: 0 });

  return (
    <>
      {/* CSS para impressão */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            .no-print, .no-print * { display: none !important; }
            @page { margin: 2cm 1.5cm; size: A4; }
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              color: black !important;
              font-family: Arial, sans-serif !important;
              font-size: 12pt !important;
              line-height: 1.4 !important;
            }
            .print-content {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              width: 100% !important;
            }
            table {
              border-collapse: collapse !important;
              width: 100% !important;
              margin: 8px 0 15px 0 !important;
              page-break-inside: avoid !important;
              font-size: 8pt !important;
              background: white !important;
            }
            th, td {
              border: 1px solid #666 !important;
              padding: 2px 3px !important;
              text-align: left !important;
              vertical-align: top !important;
              font-size: 8pt !important;
              line-height: 1.1 !important;
            }
            th {
              background-color: #e8e8e8 !important;
              font-weight: bold !important;
              font-size: 7pt !important;
              text-align: center !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            table th:nth-child(1), table td:nth-child(1) { width: 8% !important; }
            table th:nth-child(2), table td:nth-child(2) { width: 15% !important; }
            table th:nth-child(3), table td:nth-child(3) { width: 10% !important; }
            table th:nth-child(4), table td:nth-child(4) { width: 15% !important; }
            table th:nth-child(5), table td:nth-child(5) { width: 10% !important; }
            table th:nth-child(6), table td:nth-child(6) { width: 25% !important; }
            table th:nth-child(7), table td:nth-child(7) { width: 6% !important; text-align: center !important; }
            table th:nth-child(8), table td:nth-child(8) { width: 7% !important; text-align: center !important; }
            table th:nth-child(9), table td:nth-child(9) { width: 9% !important; text-align: center !important; }
            tbody td {
              font-size: 7pt !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }
            tfoot td {
              background-color: #f0f0f0 !important;
              font-weight: bold !important;
              font-size: 8pt !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .font-mono {
              font-family: 'Courier New', monospace !important;
              font-size: 6pt !important;
              letter-spacing: 0.2px !important;
            }
            h1, h2, h3 { color: black !important; margin: 10px 0 !important; }
            .text-xl { font-size: 16pt !important; font-weight: bold !important; }
            .text-lg { font-size: 14pt !important; }
            .text-base { font-size: 12pt !important; }
            .text-sm { font-size: 11pt !important; }
            .text-xs { font-size: 10pt !important; }
            .font-bold { font-weight: bold !important; }
            .font-medium { font-weight: 500 !important; }
            .font-semibold { font-weight: 600 !important; }
            .grid { display: grid !important; }
            .grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
            .grid-cols-4 { grid-template-columns: repeat(4, 1fr) !important; }
            .gap-6 { gap: 20px !important; }
            .gap-8 { gap: 25px !important; }
            .flex { display: flex !important; }
            .justify-between { justify-content: space-between !important; }
            .justify-center { justify-content: center !important; }
            .items-center { align-items: center !important; }
            .items-start { align-items: flex-start !important; }
            .mb-1 { margin-bottom: 5px !important; }
            .mb-2 { margin-bottom: 8px !important; }
            .mb-3 { margin-bottom: 12px !important; }
            .mb-4 { margin-bottom: 15px !important; }
            .mb-6 { margin-bottom: 20px !important; }
            .mt-2 { margin-top: 8px !important; }
            .mt-4 { margin-top: 15px !important; }
            .mt-8 { margin-top: 25px !important; }
            .p-1 { padding: 3px !important; }
            .p-2 { padding: 6px !important; }
            .p-3 { padding: 10px !important; }
            .pr-2 { padding-right: 6px !important; }
            .pr-4 { padding-right: 15px !important; }
            .pl-4 { padding-left: 15px !important; }
            .border { border: 1px solid #000 !important; }
            .border-r { border-right: 1px solid #ccc !important; }
            .border-t { border-top: 1px solid #ccc !important; }
            .border-gray-300 { border-color: #d1d5db !important; }
            .border-gray-400 { border-color: #9ca3af !important; }
            .bg-gray-50 {
              background-color: #f9fafb !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .bg-gray-100 {
              background-color: #f3f4f6 !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .bg-blue-100 {
              background-color: #dbeafe !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .bg-green-100 {
              background-color: #dcfce7 !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .bg-white {
              background-color: white !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .text-blue-800 { color: #1e40af !important; }
            .text-green-800 { color: #166534 !important; }
            .text-gray-600 { color: #4b5563 !important; }
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            .page-break-inside-avoid,
            .space-y-2 > *,
            .rounded {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .space-y-2 > * + * { margin-top: 8px !important; }
            .rounded { border-radius: 3px !important; }
          }
        `
      }} />
      
      {/* Cabeçalho */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold">ROMANEIO</h1>
        <div className="flex justify-between items-center mt-2">
          <div>
            <span className="font-medium">Tipo:</span> {formData?.subtipo_operacao || 'Coleta'}
          </div>
          <div>
            <span className="font-medium">Data de Emissão:</span> {formatDate(new Date())}
          </div>
        </div>
      </div>

      {/* Informações de Remetente e Destinatário */}
      <div className="grid grid-cols-2 gap-6 mb-6 text-sm border border-gray-300 p-3 bg-gray-50">
        <div className="border-r border-gray-300 pr-4">
          <h3 className="font-bold text-base mb-3 text-blue-800 bg-blue-100 p-2 rounded">REMETENTES</h3>
          <div className="space-y-2">
            <div className="font-bold">
              {formData?.remetente_razao_social || 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA'}
            </div>
            <div>
              <span className="font-medium">CNPJ:</span> {formData?.remetente_cnpj ? 
                `${formData.remetente_cnpj.slice(0,2)}.${formData.remetente_cnpj.slice(2,5)}.${formData.remetente_cnpj.slice(5,8)}/${formData.remetente_cnpj.slice(8,12)}-${formData.remetente_cnpj.slice(12)}` : 
                '85.179.240/0002-39'}
            </div>
            <div>
              <span className="font-medium">UF:</span> {formData?.remetente_uf || 'SC'}
            </div>
            <div>
              <span className="font-medium">Telefone:</span> {formData?.remetente_telefone ? 
                `(${formData.remetente_telefone.slice(0,2)}) ${formData.remetente_telefone.slice(2,7)}-${formData.remetente_telefone.slice(7)}` : 
                'N/A'}
            </div>
            <div>
              <span className="font-medium">Endereço:</span> {formData?.remetente_endereco ? 
                `${formData.remetente_endereco}, ${formData.remetente_numero || 'S/N'}` : 
                'Endereço não informado'}
            </div>
            <div>
              <span className="font-medium">Bairro:</span> {formData?.remetente_bairro || 'N/A'} - {formData?.remetente_cidade || 'N/A'}
            </div>
            <div>
              <span className="font-medium">CEP:</span> {formData?.remetente_cep ? 
                `${formData.remetente_cep.slice(0,5)}-${formData.remetente_cep.slice(5)}` : 
                'N/A'}
            </div>
          </div>
        </div>
        
        <div className="pl-4">
          <h3 className="font-bold text-base mb-3 text-green-800 bg-green-100 p-2 rounded">DESTINATÁRIOS</h3>
          <div className="space-y-2">
            <div className="font-bold">
              {formData?.destinatario_razao_social || 'CONSORCIO DE ALUMINIO DO MARANHAO CONSORCIO ALUMAR'}
            </div>
            <div>
              <span className="font-medium">CNPJ:</span> {formData?.destinatario_cnpj ? 
                `${formData.destinatario_cnpj.slice(0,2)}.${formData.destinatario_cnpj.slice(2,5)}.${formData.destinatario_cnpj.slice(5,8)}/${formData.destinatario_cnpj.slice(8,12)}-${formData.destinatario_cnpj.slice(12)}` : 
                '00.655.209/0001-93'}
            </div>
            <div>
              <span className="font-medium">UF:</span> {formData?.destinatario_uf || 'MA'}
            </div>
            <div>
              <span className="font-medium">Telefone:</span> {formData?.destinatario_telefone ? 
                `(${formData.destinatario_telefone.slice(0,2)}) ${formData.destinatario_telefone.slice(2,7)}-${formData.destinatario_telefone.slice(7)}` : 
                'N/A'}
            </div>
            <div>
              <span className="font-medium">Endereço:</span> {formData?.destinatario_endereco ? 
                `${formData.destinatario_endereco}, ${formData.destinatario_numero || 'S/N'}` : 
                'Endereço não informado'}
            </div>
            <div>
              <span className="font-medium">Bairro:</span> {formData?.destinatario_bairro || 'N/A'} - {formData?.destinatario_cidade || 'N/A'}
            </div>
            <div>
              <span className="font-medium">CEP:</span> {formData?.destinatario_cep ? 
                `${formData.destinatario_cep.slice(0,5)}-${formData.destinatario_cep.slice(5)}` : 
                'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de NFes */}
      <div className="mb-4">
        <table className="w-full border-collapse border border-gray-400 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 p-1 text-left">NFe</th>
              <th className="border border-gray-400 p-1 text-left">Remetente</th>
              <th className="border border-gray-400 p-1 text-left">Cidade-UF</th>
              <th className="border border-gray-400 p-1 text-left">Destinatário</th>
              <th className="border border-gray-400 p-1 text-left">Cidade-UF</th>
              <th className="border border-gray-400 p-1 text-left">Chave de Acesso</th>
              <th className="border border-gray-400 p-1 text-center">Vol</th>
              <th className="border border-gray-400 p-1 text-center">Peso</th>
              <th className="border border-gray-400 p-1 text-center">Valor</th>
            </tr>
          </thead>
          <tbody>
            {nfesToDisplay.map((nfe: any) => (
              <tr key={nfe.id}>
                <td className="border border-gray-400 p-1">{nfe.numero}</td>
                <td className="border border-gray-400 p-1">
                  {((nfe.remetente?.razaoSocial) || 'CORSUL COMERCIO E RE').substring(0, 18)}
                </td>
                <td className="border border-gray-400 p-1">
                  {(nfe.remetente?.cidade || 'JOINVILLE')}-{(nfe.remetente?.uf || 'SC')}
                </td>
                <td className="border border-gray-400 p-1">
                  {(nfe.destinatario?.razaoSocial || 'CONSORCIO DE ALUMINI').substring(0, 20)}
                </td>
                <td className="border border-gray-400 p-1">
                  {(nfe.destinatario?.cidade || 'SAO LUIS')}-{(nfe.destinatario?.uf || 'MA')}
                </td>
                <td className="border border-gray-400 p-1 font-mono text-xs">
                  {nfe.chaveAcesso}
                </td>
                <td className="border border-gray-400 p-1 text-center">{nfe.volume}</td>
                <td className="border border-gray-400 p-1 text-center">
                  {nfe.peso.toFixed(1)} kg
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  R$ {nfe.valorDeclarado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100">
              <td colSpan={6} className="border border-gray-400 p-1 text-center font-bold">
                TOTAIS
              </td>
              <td className="border border-gray-400 p-1 text-center font-bold">
                {totals.volumes}
              </td>
              <td className="border border-gray-400 p-1 text-center font-bold">
                {totals.peso.toFixed(1)} kg
              </td>
              <td className="border border-gray-400 p-1 text-center font-bold">
                R$ {totals.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Rodapé */}
      <div className="mt-8 text-center text-xs text-gray-600">
        <div className="border-t border-gray-300 pt-2">
          <p>CrossWMS - Sistema de Gestão Logística | www.crosswms.com.br</p>
          <p>Gerado em {formatDate(new Date())}, {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
    </>
  );
};

export default OrdemCargaLayout;