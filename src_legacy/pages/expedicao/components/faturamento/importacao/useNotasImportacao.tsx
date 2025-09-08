
import { useState } from 'react';
import { NotaFiscal } from '../../../Faturamento';

export const useNotasImportacao = () => {
  const [notasLote, setNotasLote] = useState<Partial<NotaFiscal>[]>([]);
  
  // Função para adicionar uma linha em branco para preenchimento
  const adicionarLinha = () => {
    setNotasLote([...notasLote, {
      data: new Date(),
      cliente: '',
      remetente: '',
      notaFiscal: '',
      pedido: '',
      dataEmissao: new Date(),
      pesoNota: 0,
      valorNF: 0,
      fretePorTonelada: 0,
      pesoMinimo: 0,
      valorFreteTransferencia: 0,
      cteColeta: '',
      valorColeta: 0,
      cteTransferencia: '',
      paletizacao: 0,
      pedagio: 0,
      aliquotaICMS: 0,
      aliquotaExpresso: 0
    }]);
  };
  
  // Função para atualizar dados de uma nota
  const atualizarNota = (index: number, field: keyof NotaFiscal, value: any) => {
    const novasNotas = [...notasLote];
    novasNotas[index] = { ...novasNotas[index], [field]: value };
    setNotasLote(novasNotas);
  };
  
  // Função para remover uma nota
  const removerNota = (index: number) => {
    const novasNotas = [...notasLote];
    novasNotas.splice(index, 1);
    setNotasLote(novasNotas);
  };
  
  // Função para importar de CSV
  const importarDeCSV = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const csvText = e.target.value;
      if (!csvText.trim()) return;
      
      const rows = csvText.trim().split('\n');
      if (rows.length <= 1) {
        alert('CSV vazio ou inválido');
        return;
      }
      
      const headers = rows[0].split(';');
      const newNotas: Partial<NotaFiscal>[] = [];
      
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;
        
        const values = rows[i].split(';');
        const nota: Partial<NotaFiscal> = {
          data: new Date(),
          cliente: '',
          pesoNota: 0,
          fretePorTonelada: 0,
          pesoMinimo: 0,
          aliquotaICMS: 0,
          aliquotaExpresso: 0
        };
        
        // Mapear valores do CSV para os campos da nota
        headers.forEach((header, index) => {
          if (index < values.length) {
            const value = values[index].trim();
            
            switch (header.trim().toLowerCase()) {
              case 'data':
                const dateParts = value.split('/');
                if (dateParts.length === 3) {
                  nota.data = new Date(
                    parseInt(dateParts[2]), 
                    parseInt(dateParts[1]) - 1, 
                    parseInt(dateParts[0])
                  );
                }
                break;
              case 'cliente':
                nota.cliente = value;
                break;
              case 'remetente':
                nota.remetente = value;
                break;
              case 'nota fiscal':
              case 'notafiscal':
              case 'nota':
                nota.notaFiscal = value;
                break;
              case 'pedido':
                nota.pedido = value;
                break;
              case 'data emissão':
              case 'dataemissao':
                const emissaoParts = value.split('/');
                if (emissaoParts.length === 3) {
                  nota.dataEmissao = new Date(
                    parseInt(emissaoParts[2]), 
                    parseInt(emissaoParts[1]) - 1, 
                    parseInt(emissaoParts[0])
                  );
                }
                break;
              case 'peso':
              case 'peso nota':
              case 'peso bruto':
                nota.pesoNota = parseFloat(value);
                break;
              case 'valor nf':
              case 'valornf':
                nota.valorNF = parseFloat(value);
                break;
              case 'frete por tonelada':
              case 'freteportonelada':
                nota.fretePorTonelada = parseFloat(value);
                break;
              case 'peso mínimo':
              case 'pesomínimo':
              case 'peso minimo':
              case 'pesominimo':
                nota.pesoMinimo = parseFloat(value);
                break;
              case 'valor frete transferencia':
              case 'fretetransferencia':
                nota.valorFreteTransferencia = parseFloat(value);
                break;
              case 'cte coleta':
              case 'ctecoleta':
                nota.cteColeta = value;
                break;
              case 'valor coleta':
              case 'valorcoleta':
                nota.valorColeta = parseFloat(value);
                break;
              case 'cte transferencia':
              case 'ctetransferencia':
                nota.cteTransferencia = value;
                break;
              case 'paletização':
              case 'paletizacao':
                nota.paletizacao = parseFloat(value);
                break;
              case 'pedágio':
              case 'pedagio':
                nota.pedagio = parseFloat(value);
                break;
              case 'alíquota icms':
              case 'aliquota icms':
              case 'aliquotaicms':
              case 'icms':
                nota.aliquotaICMS = parseFloat(value);
                break;
              case 'alíquota expresso':
              case 'aliquota expresso':
              case 'aliquotaexpresso':
              case 'expresso':
                nota.aliquotaExpresso = parseFloat(value);
                break;
            }
          }
        });
        
        newNotas.push(nota);
      }
      
      setNotasLote(newNotas);
    } catch (error) {
      console.error("Erro ao importar CSV:", error);
      alert("Erro ao processar o CSV. Verifique o formato e tente novamente.");
    }
  };

  // Função para limpar todas as notas
  const limparTudo = () => {
    setNotasLote([]);
  };
  
  return {
    notasLote,
    adicionarLinha,
    atualizarNota,
    removerNota,
    importarDeCSV,
    limparTudo,
    setNotasLote
  };
};
