import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import ArmazenagemNavbar from '@/components/layout/ArmazenagemNavbar';

import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Truck,
  User,
  ArrowLeft,
  Clipboard,
  Camera,
  FileSignature,
  Download,
  Send
} from 'lucide-react';
import { useLocation } from 'wouter';

const Checklist = () => {
  const [, setLocation] = useLocation();
  const [observacoesFinal, setObservacoesFinal] = useState('');
  const [assinaturaDigital, setAssinaturaDigital] = useState('');
  
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, categoria: 'Documentação', item: 'Romaneio de carga conferido', concluido: false, obrigatorio: true },
    { id: 2, categoria: 'Documentação', item: 'Nota fiscal validada', concluido: true, obrigatorio: true },
    { id: 3, categoria: 'Documentação', item: 'Manifesto de carga assinado', concluido: false, obrigatorio: true },
    { id: 4, categoria: 'Veículo', item: 'Condições da carroceria verificadas', concluido: true, obrigatorio: true },
    { id: 5, categoria: 'Veículo', item: 'Lacres aplicados e registrados', concluido: false, obrigatorio: true },
    { id: 6, categoria: 'Veículo', item: 'Placa e documentação do veículo conferidas', concluido: true, obrigatorio: true },
    { id: 7, categoria: 'Segurança', item: 'EPI do motorista verificado', concluido: false, obrigatorio: true },
    { id: 8, categoria: 'Segurança', item: 'Extintor de incêndio presente', concluido: true, obrigatorio: false },
    { id: 9, categoria: 'Carga', item: 'Volumes posicionados corretamente', concluido: true, obrigatorio: true },
    { id: 10, categoria: 'Carga', item: 'Amarração da carga realizada', concluido: false, obrigatorio: true },
    { id: 11, categoria: 'Carga', item: 'Peso total dentro do limite', concluido: true, obrigatorio: true },
    { id: 12, categoria: 'Final', item: 'Foto da carga tirada', concluido: false, obrigatorio: false },
    { id: 13, categoria: 'Final', item: 'Assinatura do responsável coletada', concluido: false, obrigatorio: true }
  ]);

  const handleChecklistChange = (itemId: number, concluido: boolean) => {
    setChecklistItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, concluido } : item
      )
    );
  };

  const categorias = [...new Set(checklistItems.map(item => item.categoria))];
  
  const estatisticas = {
    total: checklistItems.length,
    concluidos: checklistItems.filter(item => item.concluido).length,
    obrigatorios: checklistItems.filter(item => item.obrigatorio).length,
    obrigatoriosConcluidos: checklistItems.filter(item => item.obrigatorio && item.concluido).length
  };

  const podeLiberar = estatisticas.obrigatoriosConcluidos === estatisticas.obrigatorios;
  const progresso = Math.round((estatisticas.concluidos / estatisticas.total) * 100);

  const dadosCarregamento = {
    ordem: 'ORD-001',
    veiculo: 'ABC-1234',
    motorista: 'João Silva',
    volumes: 12,
    peso: '2.850 kg',
    inicio: '14:30',
    previsaoTermino: '16:00'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ArmazenagemNavbar />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/armazenagem/enderecamento')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white text-xl font-bold">
                    4
                  </div>
                  Checklist Final
                </h1>
                <p className="text-gray-600 mt-1">Verificação final e liberação do carregamento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Carregamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Informações do Carregamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <p className="text-sm text-gray-600">Ordem</p>
                <p className="font-semibold">{dadosCarregamento.ordem}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Veículo</p>
                <p className="font-semibold">{dadosCarregamento.veiculo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Motorista</p>
                <p className="font-semibold">{dadosCarregamento.motorista}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Volumes</p>
                <p className="font-semibold">{dadosCarregamento.volumes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Peso Total</p>
                <p className="font-semibold">{dadosCarregamento.peso}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Previsão</p>
                <p className="font-semibold">{dadosCarregamento.previsaoTermino}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progresso */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Progresso do Checklist</h3>
              <Badge className={podeLiberar ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {podeLiberar ? 'Pronto para Liberação' : 'Pendente'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso Geral</span>
                <span>{progresso}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progresso}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Itens Obrigatórios: {estatisticas.obrigatoriosConcluidos}/{estatisticas.obrigatorios}</span>
                <span>Total: {estatisticas.concluidos}/{estatisticas.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist por Categoria */}
        <div className="space-y-6">
          {categorias.map((categoria) => {
            const itensCategoria = checklistItems.filter(item => item.categoria === categoria);
            const concluidos = itensCategoria.filter(item => item.concluido).length;
            
            return (
              <Card key={categoria}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clipboard className="w-5 h-5" />
                      {categoria}
                    </div>
                    <Badge variant="outline">
                      {concluidos}/{itensCategoria.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {itensCategoria.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={item.concluido}
                            onCheckedChange={(checked) => handleChecklistChange(item.id, !!checked)}
                          />
                          <div>
                            <p className={`font-medium ${item.concluido ? 'line-through text-gray-500' : ''}`}>
                              {item.item}
                            </p>
                            {item.obrigatorio && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {item.concluido ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : item.obrigatorio ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ações Especiais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Ações Especiais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                <Camera className="w-6 h-6" />
                <span>Tirar Foto da Carga</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                <FileSignature className="w-6 h-6" />
                <span>Coletar Assinatura</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                <Download className="w-6 h-6" />
                <span>Gerar Relatório</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Observações Finais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Observações Finais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Adicione observações sobre o carregamento, condições especiais, ocorrências..."
              value={observacoesFinal}
              onChange={(e) => setObservacoesFinal(e.target.value)}
              className="min-h-24"
            />
            
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                Assinatura Digital (Nome do Responsável)
              </label>
              <input
                type="text"
                placeholder="Digite seu nome para assinar digitalmente"
                value={assinaturaDigital}
                onChange={(e) => setAssinaturaDigital(e.target.value)}
                className="w-full p-3 border rounded-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Ações Finais */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-lg font-semibold">
                Status: {podeLiberar ? 'Pronto para Liberação' : 'Verificações Pendentes'}
              </p>
              <p className="text-sm text-gray-600">
                {podeLiberar 
                  ? 'Todos os itens obrigatórios foram concluídos'
                  : `${estatisticas.obrigatorios - estatisticas.obrigatoriosConcluidos} itens obrigatórios pendentes`
                }
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Salvar Rascunho
              </Button>
              
              <Button 
                disabled={!podeLiberar || !assinaturaDigital}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                onClick={() => {
                  // Lógica para liberar carregamento
                  console.log('Carregamento liberado!');
                  setLocation('/armazenagem');
                }}
              >
                <Send className="w-4 h-4" />
                Liberar Carregamento
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checklist;