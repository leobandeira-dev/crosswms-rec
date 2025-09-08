import React from 'react';
import JsBarcode from 'jsbarcode';

interface EtiquetaData {
  chave_nota: string;
  numero_nota: string;
  emitente: string;
  destinatario: string;
  volumes: string;
  numero_pedido: string;
  peso_total: string;
  codigo?: string;
}

interface EtiquetasLayoutProps {
  data: {
    etiquetas: EtiquetaData[];
    ordemNumero?: string;
  };
}

const EtiquetasLayout: React.FC<EtiquetasLayoutProps> = ({ data }) => {
  const { etiquetas, ordemNumero } = data;

  // Função para extrair e formatar data de criação do código da etiqueta
  const formatCreationDate = (codigo: string): string => {
    // Extrai data do formato: NOTA-VOL-DDMMYYYY-HHMM
    const parts = codigo.split('-')
    if (parts.length >= 4) {
      const datePart = parts[2] // DDMMYYYY
      const timePart = parts[3] // HHMM
      
      if (datePart.length === 8 && timePart.length === 4) {
        const day = datePart.substring(0, 2)
        const month = datePart.substring(2, 4)
        const year = datePart.substring(4, 8)
        const hour = timePart.substring(0, 2)
        const minute = timePart.substring(2, 4)
        
        return `${day}/${month}/${year} ${hour}:${minute}`
      }
    }
    
    // Fallback para data/hora atual se não conseguir extrair
    return new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Função para gerar código de barras como SVG
  const generateBarcode = (text: string): string => {
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, text, {
        format: 'CODE128',
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 12,
        margin: 10
      });
      return canvas.toDataURL();
    } catch (error) {
      console.error('Erro ao gerar código de barras:', error);
      return '';
    }
  };

  if (!etiquetas || etiquetas.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Nenhuma etiqueta para imprimir</p>
      </div>
    );
  }

  return (
    <div className="print-container">
      <style>{`
        @media print {
          @page {
            margin: 0.5cm;
            size: A4;
          }
          
          .etiqueta-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .no-print {
            display: none !important;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
        
        .etiquetas-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin: 1rem 0;
        }
        
        .etiqueta-card {
          border: 2px solid #000;
          padding: 1rem;
          background: white;
          min-height: 12cm;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .etiqueta-header {
          text-align: center;
          border-bottom: 1px solid #ccc;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .etiqueta-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        
        .etiqueta-footer {
          border-top: 1px solid #ccc;
          padding-top: 0.5rem;
          text-align: center;
        }
        
        .campo {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        
        .campo-label {
          font-weight: bold;
          font-size: 0.8rem;
          color: #444;
          text-transform: uppercase;
        }
        
        .campo-valor {
          font-size: 0.9rem;
          color: #000;
          word-wrap: break-word;
        }
        
        .barcode-container {
          text-align: center;
          margin: 0.5rem 0;
        }
        
        .barcode-image {
          max-width: 100%;
          height: auto;
        }
      `}</style>

      {/* Cabeçalho da impressão */}
      <div className="text-center mb-6 no-print">
        <h2 className="text-2xl font-bold text-gray-800">
          Impressão de Etiquetas - {ordemNumero || 'Múltiplas NFes'}
        </h2>
        <p className="text-gray-600">
          {etiquetas.length} etiqueta{etiquetas.length !== 1 ? 's' : ''} para impressão
        </p>
      </div>

      {/* Grid de etiquetas */}
      <div className="etiquetas-grid">
        {etiquetas.map((etiqueta, index) => (
          <div key={index} className="etiqueta-card">
            {/* Cabeçalho da etiqueta */}
            <div className="etiqueta-header">
              <h3 className="text-lg font-bold">NOTA FISCAL ELETRÔNICA</h3>
              <p className="text-sm font-semibold">Nº {etiqueta.numero_nota}</p>
            </div>

            {/* Corpo da etiqueta */}
            <div className="etiqueta-body">
              {/* Remetente */}
              <div className="campo">
                <div className="campo-label">Remetente:</div>
                <div className="campo-valor">{etiqueta.emitente}</div>
              </div>

              {/* Destinatário */}
              <div className="campo">
                <div className="campo-label">Destinatário:</div>
                <div className="campo-valor">{etiqueta.destinatario}</div>
              </div>

              {/* Data de Entrada */}
              <div className="campo">
                <div className="campo-label">Entrada:</div>
                <div className="campo-valor text-sm">
                  {/* Extrair data do número da nota fiscal - formato temporal */}
                  {(() => {
                    // Tentar extrair do código se disponível
                    if (etiqueta.codigo) {
                      return formatCreationDate(etiqueta.codigo);
                    }
                    // Tentar gerar a partir do número da nota fiscal usando timestamp atual
                    const now = new Date();
                    const timeString = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
                    const mockCode = `${etiqueta.numero_nota}-001-${timeString}`;
                    return formatCreationDate(mockCode);
                  })()}
                </div>
              </div>

              {/* Informações de volumes e peso */}
              <div className="grid grid-cols-2 gap-4">
                <div className="campo">
                  <div className="campo-label">Volumes:</div>
                  <div className="campo-valor text-xl font-bold">{etiqueta.volumes}</div>
                </div>
                <div className="campo">
                  <div className="campo-label">Peso (kg):</div>
                  <div className="campo-valor text-xl font-bold">{etiqueta.peso_total}</div>
                </div>
              </div>

              {/* Número do pedido */}
              {etiqueta.numero_pedido && etiqueta.numero_pedido !== 'undefined' && (
                <div className="campo">
                  <div className="campo-label">Pedido:</div>
                  <div className="campo-valor">{etiqueta.numero_pedido}</div>
                </div>
              )}

              {/* Código de barras da chave da NFe */}
              {etiqueta.chave_nota && etiqueta.chave_nota !== 'undefined' && (
                <div className="barcode-container">
                  <div className="campo-label mb-2">Chave da NFe:</div>
                  <img 
                    src={generateBarcode(etiqueta.chave_nota)} 
                    alt={`Código de barras: ${etiqueta.chave_nota}`}
                    className="barcode-image"
                  />
                </div>
              )}
            </div>

            {/* Rodapé da etiqueta */}
            <div className="etiqueta-footer">
              <p className="text-xs text-gray-600">
                {ordemNumero && `Ordem: ${ordemNumero} • `}
                Impresso em: {new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Informações adicionais */}
      <div className="mt-6 text-center text-sm text-gray-600 no-print">
        <p>
          Total: {etiquetas.length} etiqueta{etiquetas.length !== 1 ? 's' : ''}
        </p>
        <p>
          Etiquetas preparadas para impressão em formato A4 (2 por página)
        </p>
      </div>
    </div>
  );
};

export default EtiquetasLayout;