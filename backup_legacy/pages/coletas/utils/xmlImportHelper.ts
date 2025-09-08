
// XML import helper functions that are referenced in the code

export const extractNFInfoFromXML = async (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Check if file is XML
    if (!file.name.toLowerCase().endsWith('.xml')) {
      reject(new Error("O arquivo deve ser um XML válido"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xmlContent = e.target?.result as string;
        
        // In a real implementation, we would parse the XML here
        // For now, simulate a successful parse with mock data
        console.log(`Processando XML: ${file.name}`);
        
        setTimeout(() => {
          // Generate random dimensions for demonstration
          const altura = Math.floor(Math.random() * 50) + 10;
          const largura = Math.floor(Math.random() * 50) + 20;
          const comprimento = Math.floor(Math.random() * 50) + 30;
          const peso = 0; // Set to 0 as weight should come from the nota fiscal
          const pesoTotal = Math.floor(Math.random() * 100) + 10; // Extract total weight from XML
          
          resolve({
            nfInfo: {
              numeroNF: `NF${Math.floor(Math.random() * 100000)}`,
              chaveNF: `${Math.floor(Math.random() * 10000000000000)}`,
              dataEmissao: new Date().toISOString(),
              volumes: [
                { altura: altura, largura: largura, comprimento: comprimento, peso: 0, quantidade: 1 }
              ],
              valorTotal: Math.floor(Math.random() * 10000) + 500,
              pesoTotal: pesoTotal // Add the total weight from XML
            },
            remetente: {
              razaoSocial: 'Empresa Teste',
              cnpj: `${Math.floor(Math.random() * 100000000)}/0001-${Math.floor(Math.random() * 100)}`,
              enderecoFormatado: 'Av. Central, 123 - Centro, São Paulo/SP',
              endereco: {
                logradouro: 'Av. Central',
                numero: '123',
                complemento: '',
                bairro: 'Centro',
                cidade: 'São Paulo',
                uf: 'SP',
                cep: '01234567'
              }
            },
            destinatario: {
              razaoSocial: 'Cliente Final',
              cnpj: `${Math.floor(Math.random() * 100000000)}/0001-${Math.floor(Math.random() * 100)}`,
              enderecoFormatado: 'Rua Principal, 456 - Bairro Novo, Rio de Janeiro/RJ',
              endereco: {
                logradouro: 'Rua Principal',
                numero: '456',
                complemento: '',
                bairro: 'Bairro Novo',
                cidade: 'Rio de Janeiro',
                uf: 'RJ',
                cep: '20000000'
              }
            }
          });
        }, 800);
      } catch (error) {
        console.error("Erro ao processar XML:", error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error("Erro ao ler arquivo:", error);
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

export const processMultipleXMLFiles = async (files: FileList | File[]): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Processando ${files.length} arquivos XML`);
      
      // In a real implementation, we would process each XML file
      // For now, simulate processing with mock data
      setTimeout(() => {
        const notasFiscais = Array.from({ length: files.length }).map((_, index) => {
          const altura = Math.floor(Math.random() * 50) + 10;
          const largura = Math.floor(Math.random() * 50) + 20;
          const comprimento = Math.floor(Math.random() * 50) + 30;
          const peso = Math.floor(Math.random() * 20) + 1;
          
          return { 
            numeroNF: `NF${Math.floor(Math.random() * 100000)}`, 
            chaveNF: `${Math.floor(Math.random() * 10000000000000)}`,
            dataEmissao: new Date().toISOString(),
            volumes: [
              { altura: altura, largura: largura, comprimento: comprimento, peso: peso, quantidade: 1 }
            ],
            remetente: 'Empresa Teste',
            destinatario: 'Cliente Final',
            valorTotal: Math.floor(Math.random() * 10000) + 500,
            pesoTotal: Math.floor(Math.random() * 100) + 10,
            // Additional fields
            enderecoRemetente: 'Av. Central, 123',
            cepRemetente: '01234-567',
            cidadeRemetente: 'São Paulo',
            ufRemetente: 'SP',
            enderecoDestinatario: 'Rua Principal, 456',
            cepDestinatario: '20000-000',
            cidadeDestinatario: 'Rio de Janeiro',
            ufDestinatario: 'RJ'
          };
        });
        
        resolve({
          notasFiscais,
          remetente: {
            razaoSocial: 'Empresa Teste',
            cnpj: '12.345.678/0001-90',
            enderecoFormatado: 'Av. Central, 123 - Centro, São Paulo/SP',
            endereco: {
              logradouro: 'Av. Central',
              numero: '123',
              complemento: '',
              bairro: 'Centro',
              cidade: 'São Paulo',
              uf: 'SP',
              cep: '01234567'
            }
          },
          destinatario: {
            razaoSocial: 'Cliente Final',
            cnpj: '98.765.432/0001-10',
            enderecoFormatado: 'Rua Principal, 456 - Bairro Novo, Rio de Janeiro/RJ',
            endereco: {
              logradouro: 'Rua Principal',
              numero: '456',
              complemento: '',
              bairro: 'Bairro Novo',
              cidade: 'Rio de Janeiro',
              uf: 'RJ',
              cep: '20000000'
            }
          }
        });
      }, 1000);
    } catch (error) {
      console.error("Erro ao processar múltiplos arquivos XML:", error);
      reject(error);
    }
  });
};

export const processExcelFile = async (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Check if file is Excel/CSV
    if (!file.name.toLowerCase().match(/\.(xlsx|xls|csv)$/)) {
      reject(new Error("O arquivo deve ser do tipo Excel (.xlsx) ou CSV (.csv)"));
      return;
    }
    
    console.log(`Processando arquivo Excel/CSV: ${file.name}`);
    
    // In a real implementation, we would parse the Excel/CSV file
    // For now, simulate processing with mock data
    setTimeout(() => {
      // Generate random number of entries
      const numEntries = Math.floor(Math.random() * 5) + 1;
      
      // Generate random notes with volumes
      const notasFiscais = Array.from({ length: numEntries }).map((_, index) => {
        // Generate random number of volumes
        const numVolumes = Math.floor(Math.random() * 3) + 1;
        
        // Generate volumes with random dimensions
        const volumes = Array.from({ length: numVolumes }).map(() => {
          const altura = Math.floor(Math.random() * 50) + 10;
          const largura = Math.floor(Math.random() * 50) + 20;
          const comprimento = Math.floor(Math.random() * 50) + 30;
          const peso = Math.floor(Math.random() * 20) + 1;
          
          return { 
            altura, 
            largura, 
            comprimento, 
            peso, 
            quantidade: Math.floor(Math.random() * 3) + 1 
          };
        });
        
        return { 
          numeroNF: `NF${98000 + index}`, 
          volumes,
          remetente: 'Empresa Excel',
          destinatario: 'Cliente Excel',
          valorTotal: Math.floor(Math.random() * 10000) + 500,
          dataEmissao: new Date().toISOString(),
          chaveNF: `${Math.floor(Math.random() * 10000000000000)}`
        };
      });
      
      resolve({
        notasFiscais,
        remetente: {
          razaoSocial: 'Empresa Excel',
          cnpj: '12.345.678/0001-90',
          enderecoFormatado: 'Av. Excel, 123 - Centro, São Paulo/SP',
          endereco: {
            logradouro: 'Av. Excel',
            numero: '123',
            complemento: '',
            bairro: 'Centro',
            cidade: 'São Paulo',
            uf: 'SP',
            cep: '01234567'
          }
        },
        destinatario: {
          razaoSocial: 'Cliente Excel',
          cnpj: '98.765.432/0001-10',
          enderecoFormatado: 'Rua Planilha, 456 - Bairro Novo, Rio de Janeiro/RJ',
          endereco: {
            logradouro: 'Rua Planilha',
            numero: '456',
            complemento: '',
            bairro: 'Bairro Novo',
            cidade: 'Rio de Janeiro',
            uf: 'RJ',
            cep: '20000000'
          }
        }
      });
    }, 1500);
  });
};

export const generateExcelTemplate = (): void => {
  // In a real implementation, this would generate and download an Excel template
  // For now, simulate a download
  console.log('Gerando template Excel');
  
  // Create a mock CSV content
  const csvContent = [
    'NumeroNF;ChaveNF;Volume;Altura;Largura;Comprimento;Peso;Quantidade;Remetente;Destinatario;ValorTotal;DataEmissao',
    'NF12345;43210987654321;1;50;60;120;10;1;Empresa ABC;Cliente XYZ;1500,00;10/01/2023',
    'NF12345;43210987654321;2;30;40;50;5;2;Empresa ABC;Cliente XYZ;1500,00;10/01/2023',
    'NF67890;98765432109876;1;40;50;60;8;1;Empresa DEF;Cliente UVW;2000,00;11/01/2023',
  ].join('\n');
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'modelo_importacao_nf.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
