
import React from 'react';
import { notasFiscais } from '../data/mockData';
import { formatCNPJ, formatDate, formatCurrency } from '../../utils/formatters';

interface NotaPrintTemplateProps {
  notaId: string;
}

const NotaPrintTemplate: React.FC<NotaPrintTemplateProps> = ({ notaId }) => {
  const nota = notasFiscais.find(nota => nota.id === notaId);
  
  return (
    <div className="p-4 bg-white">
      <h2 className="text-xl font-bold mb-4">Nota Fiscal - {notaId}</h2>
      <div className="border p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Emitente section */}
          <div className="border border-gray-300 p-3 rounded">
            <h3 className="font-bold text-lg mb-2">Dados do Emitente</h3>
            {nota && (
              <div className="space-y-2">
                <p><span className="font-semibold">Razão Social:</span> {nota.emitenteRazaoSocial}</p>
                <p><span className="font-semibold">CNPJ:</span> {formatCNPJ(nota.emitenteCNPJ)}</p>
                <p><span className="font-semibold">Endereço:</span> {nota.emitenteEndereco}</p>
                <p><span className="font-semibold">Cidade/UF:</span> {nota.emitenteCidade}/{nota.emitenteUF}</p>
              </div>
            )}
          </div>
          
          {/* Destinatário section */}
          <div className="border border-gray-300 p-3 rounded">
            <h3 className="font-bold text-lg mb-2">Dados do Destinatário</h3>
            {nota && (
              <div className="space-y-2">
                <p><span className="font-semibold">Razão Social:</span> {nota.destinatarioRazaoSocial}</p>
                <p><span className="font-semibold">CNPJ:</span> {formatCNPJ(nota.destinatarioCNPJ)}</p>
                <p><span className="font-semibold">Endereço:</span> {nota.destinatarioEndereco}</p>
                <p><span className="font-semibold">Cidade/UF:</span> {nota.destinatarioCidade}/{nota.destinatarioUF}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Nota Fiscal Details */}
        <div className="mt-4 border border-gray-300 p-3 rounded">
          <h3 className="font-bold text-lg mb-2">Detalhes da Nota Fiscal</h3>
          {nota && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="font-semibold">Número:</p>
                <p>{nota.numero}</p>
              </div>
              <div>
                <p className="font-semibold">Série:</p>
                <p>{nota.serieNF}</p>
              </div>
              <div>
                <p className="font-semibold">Data de Emissão:</p>
                <p>{formatDate(nota.dataHoraEmissao)}</p>
              </div>
              <div>
                <p className="font-semibold">Valor Total:</p>
                <p>{formatCurrency(nota.valor)}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Chave de Acesso */}
        <div className="mt-4 border border-gray-300 p-3 rounded">
          <h3 className="font-bold text-lg mb-2">Chave de Acesso</h3>
          {nota && (
            <p className="font-mono text-center text-sm">{nota.chaveNF}</p>
          )}
        </div>
        
        {/* Produtos */}
        <div className="mt-4 border border-gray-300 p-3 rounded">
          <h3 className="font-bold text-lg mb-2">Produtos</h3>
          {nota && nota.itens && nota.itens.length > 0 ? (
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-2 text-left">Descrição</th>
                  <th className="border border-gray-300 p-2 text-center">NCM</th>
                  <th className="border border-gray-300 p-2 text-center">Qtde</th>
                  <th className="border border-gray-300 p-2 text-right">Valor Unit.</th>
                  <th className="border border-gray-300 p-2 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {nota.itens.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-300 p-2">{item.descricao}</td>
                    <td className="border border-gray-300 p-2 text-center">{item.ncm}</td>
                    <td className="border border-gray-300 p-2 text-center">{item.quantidade}</td>
                    <td className="border border-gray-300 p-2 text-right">{formatCurrency(item.valor)}</td>
                    <td className="border border-gray-300 p-2 text-right">{formatCurrency(item.valor * item.quantidade)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan={4} className="border border-gray-300 p-2 text-right font-bold">Valor Total:</td>
                  <td className="border border-gray-300 p-2 text-right font-bold">{formatCurrency(nota.valor)}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 italic">Nenhum produto disponível</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotaPrintTemplate;
