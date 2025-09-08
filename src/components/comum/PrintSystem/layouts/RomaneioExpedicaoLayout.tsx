import React, { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import JsBarcode from 'jsbarcode';

interface RomaneioExpedicaoLayoutProps {
  data: any;
}

const RomaneioExpedicaoLayout: React.FC<RomaneioExpedicaoLayoutProps> = ({ data }) => {
  const { formData, nfesToDisplay = [] } = data;
  const [barcodes, setBarcodes] = useState<Record<string, string>>({});

  // Gerar códigos de barras
  useEffect(() => {
    const newBarcodes: Record<string, string> = {};
    
    nfesToDisplay.forEach((nfe: any) => {
      if (nfe.chaveAcesso) {
        try {
          const canvas = document.createElement('canvas');
          JsBarcode(canvas, nfe.chaveAcesso, {
            format: 'CODE128',
            width: 1,
            height: 40,
            displayValue: false,
            margin: 0,
            background: '#ffffff',
            lineColor: '#000000'
          });
          newBarcodes[nfe.id] = canvas.toDataURL();
        } catch (error) {
          console.error('Erro ao gerar código de barras:', error);
        }
      }
    });
    
    setBarcodes(newBarcodes);
  }, [nfesToDisplay]);

  // Calcular totais
  const totals = nfesToDisplay.reduce((acc: any, nfe: any) => ({
    volumes: acc.volumes + (nfe.volume || 0),
    peso: acc.peso + (nfe.peso || 0),
    valor: acc.valor + (nfe.valorDeclarado || 0),
    quantidade: acc.quantidade + 1,
  }), { volumes: 0, peso: 0, valor: 0, quantidade: 0 });

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
            h1, h2, h3 { color: black !important; margin: 10px 0 !important; }
            .text-xl { font-size: 18pt !important; font-weight: bold !important; }
            .text-lg { font-size: 16pt !important; font-weight: bold !important; }
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
            .p-4 { padding: 15px !important; }
            .pr-2 { padding-right: 6px !important; }
            .pr-4 { padding-right: 15px !important; }
            .pl-4 { padding-left: 15px !important; }
            .border { border: 1px solid #000 !important; }
            .border-2 { border: 2px solid #000 !important; }
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
            .space-y-2 > * + * { margin-top: 8px !important; }
            .space-y-4 > * + * { margin-top: 15px !important; }
            .space-y-6 > * + * { margin-top: 20px !important; }
            .rounded { border-radius: 3px !important; }
            .rounded-lg { border-radius: 8px !important; }
            .barcode-image {
              max-width: 100% !important;
              height: auto !important;
              border: none !important;
              background: white !important;
              page-break-inside: avoid !important;
              display: block !important;
              margin: 0 auto !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .nfe-card {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .summary-grid {
              display: grid !important;
              grid-template-columns: repeat(4, 1fr) !important;
              gap: 15px !important;
            }
            .summary-item {
              text-align: center !important;
              padding: 10px !important;
              border: 1px solid #ccc !important;
              border-radius: 3px !important;
              background-color: #f9fafb !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .summary-value {
              font-size: 16pt !important;
              font-weight: bold !important;
              color: #1e40af !important;
            }
            .summary-label {
              font-size: 10pt !important;
              color: #4b5563 !important;
            }
          }
        `
      }} />
      
      {/* Cabeçalho */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">ROMANEIO</h1>
        <div className="flex justify-between items-center mt-2">
          <div>
            <span className="font-medium">Tipo:</span> {formData?.subtipo_operacao || 'Coleta'}
          </div>
          <div>
            <span className="font-medium">Data de Emissão:</span> {formatDate(new Date())} - {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div className="text-right text-sm text-gray-600 mt-2">
          {formData?.numero_ordem && (
            <span className="font-medium">Ordem: {formData.numero_ordem}</span>
          )}
        </div>
      </div>

      {/* Informações de Remetente e Destinatário */}
      <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
        <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-300">
          <h3 className="font-bold text-lg mb-3 text-blue-800">REMETENTES</h3>
          <div className="space-y-2">
            <div className="font-bold text-base">
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
                '(47) 31458-100'}
            </div>
            <div>
              <span className="font-medium">Endereço:</span> {formData?.remetente_endereco ? 
                `${formData.remetente_endereco}, ${formData.remetente_numero || 'S/N'}` : 
                'RUA GUARUJA, 434'}
            </div>
          </div>
        </div>
        
        <div className="bg-green-100 p-4 rounded-lg border-2 border-green-300">
          <h3 className="font-bold text-lg mb-3 text-green-800">DESTINATÁRIOS</h3>
          <div className="space-y-2">
            <div className="font-bold text-base">
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
                '(35) 21075-167'}
            </div>
            <div>
              <span className="font-medium">Endereço:</span> {formData?.destinatario_endereco ? 
                `${formData.destinatario_endereco}, ${formData.destinatario_numero || 'S/N'}` : 
                'RODOVIA BR 135, SN'}
            </div>
          </div>
        </div>
      </div>

      {/* Título da seção de NFEs */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-center mb-4">NOTAS FISCAIS COM CÓDIGOS DE BARRAS</h2>
      </div>

      {/* Lista de NFEs com códigos de barras */}
      <div className="space-y-6 mb-6">
        {nfesToDisplay.map((nfe: any, index: number) => (
          <div key={nfe.id} className="nfe-card border-2 border-gray-400 p-4 rounded-lg bg-white">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="font-bold text-base mb-2">NFe: {nfe.numero}</div>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Chave:</span> {nfe.chaveAcesso}</div>
                  <div><span className="font-medium">Remetente:</span> {nfe.remetente?.razaoSocial || 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA'}</div>
                  <div><span className="font-medium">Destinatário:</span> {nfe.destinatario?.razaoSocial || 'CONSORCIO DE ALUMINIO DO MARANHAO CONSORCIO ALUMAR'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Volumes:</span> {nfe.volume}</div>
                  <div><span className="font-medium">Peso:</span> {nfe.peso.toFixed(1)} kg</div>
                  <div><span className="font-medium">Valor:</span> R$ {nfe.valorDeclarado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                </div>
              </div>
            </div>
            
            {/* Código de barras */}
            <div className="text-center mt-4 border-t border-gray-300 pt-3">
              {barcodes[nfe.id] && (
                <div>
                  <div className="text-xs text-gray-600 mb-1">Código de Barras da Chave de Acesso:</div>
                  <img 
                    src={barcodes[nfe.id]} 
                    alt={`Código de barras NFe ${nfe.numero}`}
                    className="barcode-image mx-auto max-w-full h-auto"
                    style={{ maxHeight: '60px' }}
                  />
                  <div className="text-xs text-gray-600 mt-1 font-mono">{nfe.chaveAcesso}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resumo dos totais */}
      <div className="mb-6 border-2 border-gray-400 p-4 rounded-lg bg-gray-50">
        <h3 className="text-lg font-bold text-center mb-4">RESUMO GERAL</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-value">{totals.volumes}</div>
            <div className="summary-label">Volumes</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">{totals.peso.toFixed(1)} kg</div>
            <div className="summary-label">Peso Total</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">R$ {totals.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            <div className="summary-label">Valor Total</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">{totals.quantidade}</div>
            <div className="summary-label">Quantidade NFEs</div>
          </div>
        </div>
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

export default RomaneioExpedicaoLayout;