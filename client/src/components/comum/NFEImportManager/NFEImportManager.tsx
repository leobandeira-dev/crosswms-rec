import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Package,
  Trash2
} from 'lucide-react';

// Interfaces export
export interface NotaFiscalData {
  id: string;
  chave_nota_fiscal: string;
  numero_nota: string;
  serie_nota: string;
  data_hora_emissao: string;
  natureza_operacao: string;
  emitente_cnpj: string;
  emitente_razao_social: string;
  emitente_telefone: string;
  emitente_uf: string;
  emitente_cidade: string;
  emitente_bairro: string;
  emitente_endereco: string;
  emitente_numero: string;
  emitente_cep: string;
  destinatario_cnpj: string;
  destinatario_razao_social: string;
  destinatario_telefone: string;
  destinatario_uf: string;
  destinatario_cidade: string;
  destinatario_bairro: string;
  destinatario_endereco: string;
  destinatario_numero: string;
  destinatario_cep: string;
  quantidade_volumes: string;
  valor_nota_fiscal: string;
  peso_bruto: string;
  informacoes_complementares: string;
  numero_pedido: string;
  operacao: string;
  cliente_retira?: string;
  tipo_frete?: string;
  custo_extra?: string;
}

export interface NFEImportManagerProps {
  onNotasImported: (notas: NotaFiscalData[]) => void;
  preloadedNotes?: NotaFiscalData[];
  title?: string;
  onClose?: () => void;
}

const NFEImportManager: React.FC<NFEImportManagerProps> = ({
  onNotasImported,
  preloadedNotes = [],
  title = "Busca Avançada de NFe via API",
  onClose
}) => {
  const { toast } = useToast();
  
  // Estados principais - apenas para API
  const [batchInvoices, setBatchInvoices] = useState<NotaFiscalData[]>(preloadedNotes);
  const [isApiLoading, setIsApiLoading] = useState(false);
  
  // Estados para busca API
  const [nfeKey, setNfeKey] = useState('');
  const [nfeKeys, setNfeKeys] = useState<string[]>([]);

  // Referência para evitar chamadas desnecessárias
  const lastNotifiedCount = useRef({ notes: 0 });
  
  // Efeito para sincronizar preloadedNotes apenas na inicialização
  useEffect(() => {
    if (preloadedNotes.length > 0 && batchInvoices.length === 0) {
      setBatchInvoices(preloadedNotes);
      lastNotifiedCount.current.notes = preloadedNotes.length;
    }
  }, [preloadedNotes.length]);

  // Funções de validação
  const validateNfeKey = (key: string): boolean => {
    const cleanKey = key.replace(/\D/g, '');
    return cleanKey.length === 44;
  };

  const isDuplicateKey = (key: string): boolean => {
    return nfeKeys.includes(key) || batchInvoices.some(invoice => invoice.chave_nota_fiscal === key);
  };

  // Função para adicionar chave à coleção
  const handleAddNfeKey = () => {
    const cleanKey = nfeKey.replace(/\D/g, '');
    
    if (!validateNfeKey(cleanKey)) {
      toast({
        title: "Chave inválida",
        description: "A chave NFe deve ter 44 dígitos.",
        variant: "destructive"
      });
      return;
    }

    if (isDuplicateKey(cleanKey)) {
      toast({
        title: "Chave duplicada",
        description: "Esta chave já foi adicionada ou importada.",
        variant: "destructive"
      });
      return;
    }

    setNfeKeys([...nfeKeys, cleanKey]);
    setNfeKey('');
    
    toast({
      title: "Chave adicionada",
      description: `Chave ${cleanKey.substring(0, 10)}... adicionada à lista.`,
    });
  };

  // Função para remover chave da coleção
  const removeNfeKey = (keyToRemove: string) => {
    setNfeKeys(nfeKeys.filter(key => key !== keyToRemove));
  };

  // Funções de importação por API
  const fetchXmlWithNSDocs = async (key: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/xml/fetch-from-nsdocs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ chaveNotaFiscal: key })
    });

    return await response.json();
  };

  const fetchXmlWithCrossXML = async (key: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/xml/fetch-from-crossxml', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ chaveNotaFiscal: key })
    });

    return await response.json();
  };

  const fetchXmlWithLogistica = async (key: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/xml/fetch-from-logistica', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ chaveNotaFiscal: key })
    });

    return await response.json();
  };

  // Função auxiliar para adicionar nota importada com verificação de duplicatas
  const addImportedNote = (noteData: NotaFiscalData, source: string) => {
    // Verificar se a nota já foi importada (por chave ou número)
    const isDuplicate = batchInvoices.some(existing => 
      existing.chave_nota_fiscal === noteData.chave_nota_fiscal ||
      existing.numero_nota === noteData.numero_nota
    );

    if (isDuplicate) {
      console.log(`Nota ${noteData.numero_nota} já importada, ignorando duplicata`);
      toast({
        title: "Nota já importada",
        description: `A nota ${noteData.numero_nota} já está na lista`,
        variant: "destructive"
      });
      return;
    }

    const noteWithSource = {
      ...noteData,
      origem: source,
      id: noteData.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setBatchInvoices(prev => {
      const updated = [...prev, noteWithSource];
      // Notificar mudanças apenas após adicionar nova nota
      setTimeout(() => {
        if (typeof onNotasImported === 'function') {
          onNotasImported(updated);
        }
      }, 100);
      return updated;
    });
  };

  // Função para processar lote de chaves no NSDocs
  const processBatchNSDocsKeys = async () => {
    if (nfeKeys.length === 0) {
      toast({
        title: "Nenhuma chave",
        description: "Adicione pelo menos uma chave NFe antes de importar.",
        variant: "destructive"
      });
      return;
    }

    setIsApiLoading(true);
    let sucessos = 0;

    try {
      for (const key of nfeKeys) {
        try {
          const result = await fetchXmlWithNSDocs(key);
          if (result.success && result.data) {
            addImportedNote(result.data, 'NSDocs API');
            sucessos++;
          }
        } catch (error) {
          console.error(`Erro ao processar chave ${key}:`, error);
        }
      }

      if (sucessos > 0) {
        toast({
          title: "Importação realizada com sucesso!",
          description: `${sucessos} de ${nfeKeys.length} NFe(s) processada(s) via NSDocs API.`
        });
        
        // Limpar lista de chaves após processamento
        setNfeKeys([]);
      } else {
        toast({
          title: "Erro",
          description: "Nenhuma NFe foi encontrada",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Erro na API:', error);
      toast({
        title: "Erro na importação",
        description: "Falha ao buscar dados via API",
        variant: "destructive"
      });
    } finally {
      setIsApiLoading(false);
    }
  };

  // Função para processar lote de chaves no CrossXML
  const processBatchCrossXMLKeys = async () => {
    if (nfeKeys.length === 0) {
      toast({
        title: "Nenhuma chave",
        description: "Adicione pelo menos uma chave NFe antes de importar.",
        variant: "destructive"
      });
      return;
    }

    setIsApiLoading(true);
    let sucessos = 0;

    try {
      for (const key of nfeKeys) {
        try {
          const result = await fetchXmlWithCrossXML(key);
          if (result.success && result.data) {
            addImportedNote(result.data, 'CrossXML API');
            sucessos++;
          }
        } catch (error) {
          console.error(`Erro ao processar chave ${key}:`, error);
        }
      }

      if (sucessos > 0) {
        toast({
          title: "Importação realizada com sucesso!",
          description: `${sucessos} de ${nfeKeys.length} NFe(s) processada(s) via CrossXML API.`
        });
        
        // Limpar lista de chaves após processamento
        setNfeKeys([]);
      } else {
        toast({
          title: "Erro",
          description: "Nenhuma NFe foi encontrada",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Erro na API:', error);
      toast({
        title: "Erro na importação",
        description: "Falha ao buscar dados via API",
        variant: "destructive"
      });
    } finally {
      setIsApiLoading(false);
    }
  };

  // Função para processar lote de chaves na Logística da Informação
  const processBatchLogisticaKeys = async () => {
    if (nfeKeys.length === 0) {
      toast({
        title: "Nenhuma chave",
        description: "Adicione pelo menos uma chave NFe antes de importar.",
        variant: "destructive"
      });
      return;
    }

    setIsApiLoading(true);
    let sucessos = 0;

    try {
      for (const key of nfeKeys) {
        try {
          const result = await fetchXmlWithLogistica(key);
          if (result.success && result.data) {
            addImportedNote(result.data, 'Logística da Informação API');
            sucessos++;
          }
        } catch (error) {
          console.error(`Erro ao processar chave ${key}:`, error);
        }
      }

      if (sucessos > 0) {
        toast({
          title: "Importação realizada com sucesso!",
          description: `${sucessos} de ${nfeKeys.length} NFe(s) processada(s) via Logística da Informação API.`
        });
        
        // Limpar lista de chaves após processamento
        setNfeKeys([]);
      } else {
        toast({
          title: "Erro",
          description: "Nenhuma NFe foi encontrada",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Erro na API:', error);
      toast({
        title: "Erro na importação",
        description: "Falha ao buscar dados via API",
        variant: "destructive"
      });
    } finally {
      setIsApiLoading(false);
    }
  };

  // Handler para tecla Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddNfeKey();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>
        )}
      </div>

      {/* Busca por API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Busca via API - Triple NFe Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input de chaves */}
          <div className="flex gap-2">
            <Input
              placeholder="Digite a chave de 44 dígitos da NFe"
              value={nfeKey}
              onChange={(e) => setNfeKey(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={44}
              className="flex-1"
            />
            <Button
              onClick={handleAddNfeKey}
              disabled={!nfeKey.trim()}
              className="min-w-[120px]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>

          {/* Lista de chaves coletadas */}
          {nfeKeys.length > 0 && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="text-sm font-medium mb-2">
                Chaves coletadas ({nfeKeys.length}):
              </div>
              <div className="space-y-2">
                {nfeKeys.map((key, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="font-mono text-sm">{key}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeNfeKey(key)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botões de importação por API */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={processBatchNSDocsKeys}
              disabled={isApiLoading || nfeKeys.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isApiLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Buscar NSDocs API
            </Button>

            <Button
              onClick={processBatchCrossXMLKeys}
              disabled={isApiLoading || nfeKeys.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isApiLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Buscar CrossXML API
            </Button>

            <Button
              onClick={processBatchLogisticaKeys}
              disabled={isApiLoading || nfeKeys.length === 0}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isApiLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Buscar Logística API
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de notas importadas */}
      {batchInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Notas Fiscais Importadas ({batchInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {batchInvoices.map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{invoice.numero_nota}</span>
                      <Badge variant="secondary" className="text-xs">
                        {(invoice as any).origem || 'API'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {invoice.emitente_razao_social} → {invoice.destinatario_razao_social}
                    </div>
                    <div className="text-xs text-gray-500">
                      R$ {parseFloat(invoice.valor_nota_fiscal || '0').toFixed(2)} | {invoice.quantidade_volumes} vol(s)
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              ))}
            </div>
            
            {/* Botão Finalizar Importação */}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => {
                  onNotasImported(batchInvoices);
                  onClose?.();
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Finalizar Importação ({batchInvoices.length} nota{batchInvoices.length !== 1 ? 's' : ''})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Instruções de uso:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Digite ou escaneie as chaves de 44 dígitos das NFe</li>
                <li>Clique em "Adicionar" para cada chave ou pressione Enter</li>
                <li>Use os botões coloridos para buscar via APIs específicas</li>
                <li>NSDocs (azul), CrossXML (verde), Logística (laranja)</li>
                <li>As notas encontradas serão automaticamente importadas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NFEImportManager;