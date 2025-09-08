
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Check } from 'lucide-react';

// Mock pacotes
const mockPacotes = [
  {
    id: '1',
    nome: 'Básico',
    descricao: 'Acesso às funcionalidades essenciais',
    preco: 199.00,
    modulos: ['Coletas', 'SAC'],
    popular: false,
  },
  {
    id: '2',
    nome: 'Standard',
    descricao: 'Pacote intermediário com mais funcionalidades',
    preco: 399.00,
    modulos: ['Coletas', 'SAC', 'Armazenagem', 'Expedição'],
    popular: true,
  },
  {
    id: '3',
    nome: 'Premium',
    descricao: 'Acesso completo a todas as funcionalidades',
    preco: 799.00,
    modulos: ['Coletas', 'SAC', 'Armazenagem', 'Expedição', 'Relatórios Avançados'],
    popular: false,
  }
];

// Mock pacotes do cliente
const mockClientePacotes = [
  {
    id: '2',
    dataContratacao: '01/06/2023',
    dataVencimento: '01/06/2024',
    status: 'ativo'
  }
];

type ClientePacotesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: any | null;
};

export const ClientePacotesDialog = ({ open, onOpenChange, cliente }: ClientePacotesDialogProps) => {
  const [activeTab, setActiveTab] = useState('atual');
  
  if (!cliente) return null;

  const clientePossuiPacote = (pacoteId: string) => {
    return mockClientePacotes.some(p => p.id === pacoteId);
  };

  const handleContratarPacote = (pacote: any) => {
    toast({
      title: "Pacote contratado",
      description: `O pacote ${pacote.nome} foi vinculado ao cliente ${cliente.razaoSocial} com sucesso.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Pacotes para {cliente.razaoSocial}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="py-4">
          <TabsList className="mb-4">
            <TabsTrigger value="atual">Pacotes Atuais</TabsTrigger>
            <TabsTrigger value="disponivel">Pacotes Disponíveis</TabsTrigger>
          </TabsList>

          <TabsContent value="atual">
            {mockClientePacotes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">O cliente não possui pacotes contratados.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab('disponivel')}
                >
                  Contratar Pacote
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {mockClientePacotes.map(clientePacote => {
                  const pacote = mockPacotes.find(p => p.id === clientePacote.id);
                  if (!pacote) return null;
                  
                  return (
                    <Card key={clientePacote.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{pacote.nome}</CardTitle>
                            <CardDescription>{pacote.descricao}</CardDescription>
                          </div>
                          <Badge variant={clientePacote.status === 'ativo' ? 'default' : 'secondary'}>
                            {clientePacote.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Módulos Inclusos</h4>
                            <ul className="text-sm space-y-1">
                              {pacote.modulos.map(modulo => (
                                <li key={modulo} className="flex items-center gap-2">
                                  <Check className="h-4 w-4 text-green-600" />
                                  {modulo}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <h4 className="text-sm font-semibold">Data de Contratação</h4>
                              <p>{clientePacote.dataContratacao}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold">Data de Vencimento</h4>
                              <p>{clientePacote.dataVencimento}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold">Valor Mensal</h4>
                              <p>R$ {pacote.preco.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline">Renovar</Button>
                        <Button variant="destructive">Cancelar Pacote</Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="disponivel">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockPacotes.map(pacote => {
                const contratado = clientePossuiPacote(pacote.id);
                return (
                  <Card key={pacote.id} className={`overflow-hidden ${pacote.popular ? 'border-primary' : ''}`}>
                    {pacote.popular && (
                      <div className="bg-primary text-primary-foreground text-xs text-center py-1">
                        MAIS POPULAR
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{pacote.nome}</CardTitle>
                      <CardDescription>{pacote.descricao}</CardDescription>
                      <div className="mt-2 text-xl font-bold">
                        R$ {pacote.preco.toFixed(2)}<span className="text-sm font-normal">/mês</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-medium mb-2">Módulos inclusos:</h4>
                      <ul className="space-y-1">
                        {pacote.modulos.map(modulo => (
                          <li key={modulo} className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            <span className="text-sm">{modulo}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        disabled={contratado}
                        onClick={() => handleContratarPacote(pacote)}
                      >
                        {contratado ? 'Pacote Contratado' : 'Contratar Pacote'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
