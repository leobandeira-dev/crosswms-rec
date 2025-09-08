
import React, { useEffect, useState } from 'react';
import { formatCNPJ, formatDate, formatCurrency, formatNumber } from '../../../utils/formatters';
import { generateCode128Barcode } from './barcode/barcodeGenerator';
import { generateQRCode } from './qrcode/qrCodeGenerator';

interface DANFELayoutProps {
  notaFiscalData: any;
  simplified?: boolean;
}

const DANFELayout: React.FC<DANFELayoutProps> = ({ notaFiscalData, simplified = false }) => {
  // State to store the QR code SVG
  const [qrCode, setQrCode] = useState<string>('');
  
  // Use default data if notaFiscalData is not provided
  const data = notaFiscalData || {
    chaveNF: '12345678901234567890123456789012345678901234',
    numeroNF: '123456',
    serieNF: '001',
    dataHoraEmissao: '2023-05-10',
    valorTotal: '1850.75',
    emitenteCNPJ: '12345678901234',
    emitenteRazaoSocial: 'EMPRESA EMITENTE LTDA',
    emitenteEndereco: 'RUA EXEMPLO, 123',
    emitenteBairro: 'CENTRO',
    emitenteCidade: 'SÃO PAULO',
    emitenteUF: 'SP',
    emitenteCEP: '01234567',
    destinatarioCNPJ: '98765432101234',
    destinatarioRazaoSocial: 'EMPRESA DESTINATÁRIA LTDA',
    destinatarioEndereco: 'AVENIDA MODELO, 456',
    destinatarioBairro: 'BAIRRO EXEMPLO',
    destinatarioCidade: 'RIO DE JANEIRO',
    destinatarioUF: 'RJ',
    destinatarioCEP: '12345678',
    itens: [
      { cProd: 'PROD001', descricao: 'PRODUTO EXEMPLO 1', quantidade: 10, unidade: 'UN', valorUnitario: 100.00, valorTotal: 1000.00, ncm: '12345678' },
      { cProd: 'PROD002', descricao: 'PRODUTO EXEMPLO 2', quantidade: 5, unidade: 'KG', valorUnitario: 150.00, valorTotal: 750.00, ncm: '87654321' },
    ],
    transporte: {
      modalidadeFrete: '0',
      transportadora: 'TRANSPORTADORA EXEMPLO LTDA',
      cnpj: '12345678901234',
      endereco: 'RUA DO TRANSPORTE, 789',
      municipio: 'SÃO PAULO',
      uf: 'SP',
      placa: 'ABC1234',
      ufVeiculo: 'SP'
    },
    pagamento: {
      formaPagamento: '01', // 01 = Dinheiro
      valor: '1850.75',
      troco: '0.00'
    },
    informacoesComplementares: 'Documento emitido por ME ou EPP optante pelo Simples Nacional. Não gera direito a crédito fiscal de IPI.',
    informacoesFisco: 'Informações de interesse do Fisco'
  };
  
  console.log("Renderizando DANFE com dados:", data);

  // Generate QR code when component mounts or data changes
  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrSvg = await generateQRCode(data);
        setQrCode(qrSvg);
      } catch (error) {
        console.error("Error generating QR code:", error);
        setQrCode('<svg width="100" height="100"><text x="10" y="50" fill="red">QR Error</text></svg>');
      }
    };
    
    generateQR();
  }, [data]);

  if (simplified) {
    return (
      <div className="bg-white p-4 w-full font-mono text-[8pt] print:block print:visible" style={{minHeight: '250px'}}>
        <div className="border-2 border-black p-2 text-center mb-2">
          <div className="text-[10pt] font-bold">DANFE SIMPLIFICADO</div>
          <div>DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA</div>
          <div className="text-[6pt] mt-1">NF-e não possui valor fiscal. Simples representação da NF-e.</div>
        </div>
        
        <div className="border border-black p-2 mb-2">
          <div className="font-bold mb-1">CHAVE DE ACESSO</div>
          <div className="text-center">{data.chaveNF}</div>
          {/* Código de barras em CODE-128C */}
          <div className="flex justify-center my-2">
            <div style={{ minHeight: '30px', minWidth: '115px', margin: '0 auto' }} 
                 dangerouslySetInnerHTML={{ __html: generateCode128Barcode(data.chaveNF) }} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="border border-black p-2">
            <div className="font-bold">EMITENTE</div>
            <div>{data.emitenteRazaoSocial}</div>
            <div>CNPJ: {formatCNPJ(data.emitenteCNPJ)}</div>
          </div>
          
          <div className="border border-black p-2">
            <div className="font-bold">NF-e</div>
            <div>Nº {data.numeroNF}</div>
            <div>SÉRIE: {data.serieNF}</div>
            <div>EMISSÃO: {formatDate(data.dataHoraEmissao)}</div>
          </div>
        </div>
        
        <div className="border border-black p-2 mb-2">
          <div className="font-bold">DESTINATÁRIO</div>
          <div>{data.destinatarioRazaoSocial}</div>
          <div>CNPJ: {formatCNPJ(data.destinatarioCNPJ)}</div>
        </div>
        
        <div className="border border-black p-2 mb-2">
          <div className="font-bold">RESUMO DOS PRODUTOS/SERVIÇOS</div>
          <table className="w-full text-[6pt]">
            <thead>
              <tr className="border-b border-black">
                <th className="text-left">PRODUTO</th>
                <th className="text-right">VALOR</th>
              </tr>
            </thead>
            <tbody>
              {data.itens ? data.itens.map((item: any, index: number) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="text-left">{item.cProd} - {item.descricao.substring(0, 20)}{item.descricao.length > 20 ? '...' : ''}</td>
                  <td className="text-right">{formatCurrency(item.valorTotal || (item.quantidade * item.valorUnitario))}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={2} className="text-center py-1">Sem itens disponíveis</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="border border-black p-2">
          <div className="font-bold text-center border-b border-black pb-1 mb-1">VALOR TOTAL DA NOTA FISCAL</div>
          <div className="text-center text-lg font-bold">{formatCurrency(data.valorTotal)}</div>
        </div>
        
        {/* QR Code conforme especificação */}
        <div className="flex justify-center mt-2">
          <div style={{ width: '100px', height: '100px' }} 
               dangerouslySetInnerHTML={{ __html: qrCode }} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 w-full font-mono text-[6pt] print:block print:visible" style={{minHeight: '800px', maxWidth: '210mm'}}>
      {/* CABEÇALHO */}
      <div className="grid grid-cols-3 border-2 border-black">
        {/* Quadro emitente */}
        <div className="col-span-1 border-r-2 border-black p-2">
          <div className="text-center">
            <div className="font-bold text-[9pt]">{data.emitenteRazaoSocial}</div>
            <div>{data.emitenteEndereco}</div>
            <div>{data.emitenteBairro} - {data.emitenteCidade}/{data.emitenteUF}</div>
            <div>CEP: {data.emitenteCEP} - CNPJ: {formatCNPJ(data.emitenteCNPJ)}</div>
          </div>
        </div>
        
        {/* Quadro título e tipo */}
        <div className="col-span-2 p-2">
          <div className="text-center text-2xl font-bold">DANFE</div>
          <div className="text-center">DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA</div>
          <div className="text-center text-[6pt]">0 - ENTRADA / 1 - SAÍDA</div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="border border-black p-1 text-center">
              <div className="text-center border border-black p-1 text-[14pt] font-bold">
                {data.tipoOperacao === '0' ? '0' : '1'}
              </div>
            </div>
            <div className="border border-black p-1">
              <div className="font-bold">Nº {data.numeroNF}</div>
              <div>SÉRIE: {data.serieNF}</div>
              <div>FOLHA: 1/1</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CHAVE DE ACESSO */}
      <div className="border-x-2 border-b-2 border-black p-2">
        <div className="font-bold">CHAVE DE ACESSO</div>
        <div className="text-center text-[8pt] font-mono mt-1">{data.chaveNF}</div>
        {/* Código de barras CODE-128C com margem clara */}
        <div className="flex justify-center my-2">
          <div className="bg-white px-3 py-1" style={{ minHeight: '30px', minWidth: '250px' }}>
            <div dangerouslySetInnerHTML={{ __html: generateCode128Barcode(data.chaveNF) }} />
          </div>
        </div>
      </div>
      
      {/* NATUREZA DA OPERAÇÃO E PROTOCOLO */}
      <div className="border-x-2 border-b-2 border-black p-2 mt-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-bold">NATUREZA DA OPERAÇÃO</div>
            <div>{data.naturezaOperacao || "VENDA DE MERCADORIA"}</div>
          </div>
          <div>
            <div className="font-bold">PROTOCOLO DE AUTORIZAÇÃO</div>
            <div>{data.protocoloAutorizacao || "123456789012345"} - {formatDate(data.dataHoraEmissao)}</div>
          </div>
        </div>
      </div>
      
      {/* DESTINATÁRIO / REMETENTE */}
      <div className="border-x-2 border-b-2 border-black mt-2">
        <div className="font-bold border-b-2 border-black p-1 bg-gray-100">DESTINATÁRIO / REMETENTE</div>
        <div className="grid grid-cols-2 gap-2 p-2">
          <div>
            <div className="font-bold">NOME / RAZÃO SOCIAL</div>
            <div>{data.destinatarioRazaoSocial}</div>
          </div>
          <div>
            <div className="font-bold">CNPJ/CPF</div>
            <div>{formatCNPJ(data.destinatarioCNPJ)}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 p-2 border-t border-black">
          <div className="col-span-2">
            <div className="font-bold">ENDEREÇO</div>
            <div>{data.destinatarioEndereco}</div>
          </div>
          <div>
            <div className="font-bold">BAIRRO/DISTRITO</div>
            <div>{data.destinatarioBairro}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 p-2 border-t border-black">
          <div>
            <div className="font-bold">MUNICÍPIO</div>
            <div>{data.destinatarioCidade}</div>
          </div>
          <div>
            <div className="font-bold">UF</div>
            <div>{data.destinatarioUF}</div>
          </div>
          <div>
            <div className="font-bold">CEP</div>
            <div>{data.destinatarioCEP}</div>
          </div>
        </div>
      </div>
      
      {/* PRODUTOS/SERVIÇOS */}
      <div className="border-x-2 border-b-2 border-black mt-2">
        <div className="font-bold border-b-2 border-black p-1 text-center bg-gray-100">DADOS DOS PRODUTOS/SERVIÇOS</div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-black bg-gray-100 text-[6pt]">
              <th className="border-r border-black p-1 w-2/12">CÓDIGO</th>
              <th className="border-r border-black p-1 w-4/12">DESCRIÇÃO DO PRODUTO</th>
              <th className="border-r border-black p-1 w-1/12">NCM/SH</th>
              <th className="border-r border-black p-1 w-1/12">CST</th>
              <th className="border-r border-black p-1 w-1/12">QTDE</th>
              <th className="border-r border-black p-1 w-1/12">UNID</th>
              <th className="border-r border-black p-1 w-1/12">VALOR UNIT</th>
              <th className="p-1 w-1/12">VALOR TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {data.itens ? data.itens.map((item: any, index: number) => (
              <tr key={index} className="border-b border-black text-[7pt]">
                <td className="border-r border-black p-1">{item.cProd}</td>
                <td className="border-r border-black p-1">{item.descricao}</td>
                <td className="border-r border-black p-1 text-center">{item.ncm}</td>
                <td className="border-r border-black p-1 text-center">{item.cst || "000"}</td>
                <td className="border-r border-black p-1 text-right">{formatNumber(item.quantidade)}</td>
                <td className="border-r border-black p-1 text-center">{item.unidade}</td>
                <td className="border-r border-black p-1 text-right">{formatNumber(item.valorUnitario)}</td>
                <td className="p-1 text-right">{formatNumber(item.valorTotal || (item.valorUnitario * item.quantidade))}</td>
              </tr>
            )) : (
              <tr className="border-b border-black">
                <td colSpan={8} className="p-2 text-center">Sem itens disponíveis</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* TRANSPORTADOR */}
      <div className="border-x-2 border-b-2 border-black mt-2">
        <div className="font-bold border-b-2 border-black p-1 bg-gray-100">TRANSPORTADOR/VOLUMES TRANSPORTADOS</div>
        <div className="grid grid-cols-3 gap-2 p-2 border-b border-black">
          <div>
            <div className="font-bold">RAZÃO SOCIAL</div>
            <div>{data.transporte?.transportadora || "TRANSPORTADORA NÃO INFORMADA"}</div>
          </div>
          <div>
            <div className="font-bold">FRETE POR CONTA</div>
            <div>{data.transporte?.modalidadeFrete === '0' ? 'EMITENTE' : 'DESTINATÁRIO'}</div>
          </div>
          <div>
            <div className="font-bold">CNPJ/CPF</div>
            <div>{data.transporte?.cnpj ? formatCNPJ(data.transporte.cnpj) : "-"}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 p-2 border-b border-black">
          <div>
            <div className="font-bold">ENDEREÇO</div>
            <div>{data.transporte?.endereco || "-"}</div>
          </div>
          <div>
            <div className="font-bold">MUNICÍPIO</div>
            <div>{data.transporte?.municipio || "-"}</div>
          </div>
          <div>
            <div className="font-bold">UF</div>
            <div>{data.transporte?.uf || "-"}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 p-2">
          <div>
            <div className="font-bold">PLACA DO VEÍCULO</div>
            <div>{data.transporte?.placa || "-"}</div>
          </div>
          <div>
            <div className="font-bold">UF</div>
            <div>{data.transporte?.ufVeiculo || "-"}</div>
          </div>
          <div>
            <div className="font-bold">QUANTIDADE</div>
            <div>{data.transporte?.quantidade || "-"}</div>
          </div>
        </div>
      </div>
      
      {/* VALORES TOTAIS */}
      <div className="border-x-2 border-b-2 border-black mt-2">
        <div className="font-bold border-b-2 border-black p-1 bg-gray-100">CÁLCULO DO IMPOSTO</div>
        <div className="grid grid-cols-4 gap-2 p-2">
          <div>
            <div className="font-bold">BASE DE CÁLCULO ICMS</div>
            <div>{formatCurrency(data.baseCalculoIcms || "0.00")}</div>
          </div>
          <div>
            <div className="font-bold">VALOR DO ICMS</div>
            <div>{formatCurrency(data.valorIcms || "0.00")}</div>
          </div>
          <div>
            <div className="font-bold">VALOR DO FRETE</div>
            <div>{formatCurrency(data.valorFrete || "0.00")}</div>
          </div>
          <div>
            <div className="font-bold">VALOR DO SEGURO</div>
            <div>{formatCurrency(data.valorSeguro || "0.00")}</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 p-2 border-t border-black">
          <div>
            <div className="font-bold">DESCONTO</div>
            <div>{formatCurrency(data.valorDesconto || "0.00")}</div>
          </div>
          <div>
            <div className="font-bold">OUTRAS DESPESAS</div>
            <div>{formatCurrency(data.valorOutrasDespesas || "0.00")}</div>
          </div>
          <div>
            <div className="font-bold">VALOR DO IPI</div>
            <div>{formatCurrency(data.valorIPI || "0.00")}</div>
          </div>
          <div>
            <div className="font-bold">VALOR TOTAL DA NOTA</div>
            <div className="text-[9pt] font-bold">{formatCurrency(data.valorTotal)}</div>
          </div>
        </div>
      </div>
      
      {/* PAGAMENTO */}
      <div className="border-x-2 border-b-2 border-black mt-2">
        <div className="font-bold border-b-2 border-black p-1 bg-gray-100">FORMA DE PAGAMENTO</div>
        <div className="grid grid-cols-3 gap-2 p-2">
          <div>
            <div className="font-bold">FORMA</div>
            <div>{data.pagamento?.formaPagamento === '01' ? 'DINHEIRO' : 
                  data.pagamento?.formaPagamento === '02' ? 'CHEQUE' :
                  data.pagamento?.formaPagamento === '03' ? 'CARTÃO DE CRÉDITO' :
                  data.pagamento?.formaPagamento === '04' ? 'CARTÃO DE DÉBITO' : 
                  data.pagamento?.formaPagamento || 'NÃO INFORMADO'}
            </div>
          </div>
          <div>
            <div className="font-bold">VALOR PAGO</div>
            <div>{formatCurrency(data.pagamento?.valor || "0.00")}</div>
          </div>
          <div>
            <div className="font-bold">TROCO</div>
            <div>{formatCurrency(data.pagamento?.troco || "0.00")}</div>
          </div>
        </div>
      </div>
      
      {/* INFORMAÇÕES ADICIONAIS */}
      <div className="border-x-2 border-b-2 border-black mt-2">
        <div className="font-bold border-b-2 border-black p-1 bg-gray-100">INFORMAÇÕES ADICIONAIS</div>
        <div className="grid grid-cols-1 gap-2 p-2">
          <div>
            <div className="font-bold">INFORMAÇÕES DE INTERESSE DO FISCO</div>
            <div className="text-[7pt]">{data.informacoesFisco || ""}</div>
          </div>
          <div className="mt-2">
            <div className="font-bold">INFORMAÇÕES COMPLEMENTARES</div>
            <div className="text-[7pt]">{data.informacoesComplementares || ""}</div>
          </div>
        </div>
      </div>
      
      {/* QR CODE quando exigido */}
      <div className="border-x-2 border-b-2 border-black mt-2 p-2 flex">
        <div className="flex-grow">
          <div className="font-bold">RESERVADO AO FISCO</div>
        </div>
        <div style={{ width: '100px', height: '100px', flexShrink: 0 }} 
             dangerouslySetInnerHTML={{ __html: qrCode }} />
      </div>
    </div>
  );
};

export default DANFELayout;
