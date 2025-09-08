
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { FileUp, Download, Eye, Send, MoreHorizontal, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock notas fiscais
const mockNotasFiscais = [
  {
    id: '1',
    numero: 'NF-10001',
    dataEmissao: '10/05/2023',
    valor: 1250.99,
    status: 'emitida',
  },
  {
    id: '2',
    numero: 'NF-10002',
    dataEmissao: '15/05/2023',
    valor: 3489.50,
    status: 'enviada',
  },
  {
    id: '3',
    numero: 'NF-10003',
    dataEmissao: '20/05/2023',
    valor: 875.25,
    status: 'pendente',
  },
];

// Mock recibos
const mockRecibos = [
  {
    id: '1',
    numero: 'REC-5001',
    dataEmissao: '12/05/2023',
    valor: 1250.99,
    status: 'pago',
  },
  {
    id: '2',
    numero: 'REC-5002',
    dataEmissao: '17/05/2023',
    valor: 3489.50,
    status: 'pendente',
  },
];

type ClienteDocumentosDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: any | null;
};

export const ClienteDocumentosDialog = ({ open, onOpenChange, cliente }: ClienteDocumentosDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>('notas');
  const [file, setFile] = useState<File | null>(null);

  if (!cliente) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = () => {
    if (file) {
      toast({
        title: "Arquivo enviado",
        description: `${file.name} foi enviado com sucesso.`,
      });
      setFile(null);
    } else {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para enviar.",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = (documento: any) => {
    toast({
      title: "E-mail enviado",
      description: `O documento ${documento.numero} foi enviado por e-mail para ${cliente.email}.`,
    });
  };

  const handleViewDocument = (documento: any) => {
    toast({
      title: "Visualização",
      description: `Visualizando documento ${documento.numero}.`,
    });
  };

  const handleDownloadDocument = (documento: any) => {
    toast({
      title: "Download",
      description: `Download do documento ${documento.numero} iniciado.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'emitida':
      case 'pago':
        return 'text-green-600';
      case 'enviada':
        return 'text-blue-600';
      case 'pendente':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Documentos de {cliente.razaoSocial}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="py-4">
          <TabsList className="mb-4">
            <TabsTrigger value="notas">Notas Fiscais</TabsTrigger>
            <TabsTrigger value="recibos">Recibos</TabsTrigger>
            <TabsTrigger value="upload">Enviar Documento</TabsTrigger>
          </TabsList>

          <TabsContent value="notas">
            <Card>
              <CardHeader>
                <CardTitle>Notas Fiscais</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Data Emissão</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockNotasFiscais.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          Nenhuma nota fiscal encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      mockNotasFiscais.map(nota => (
                        <TableRow key={nota.id}>
                          <TableCell>{nota.numero}</TableCell>
                          <TableCell>{nota.dataEmissao}</TableCell>
                          <TableCell>R$ {nota.valor.toFixed(2)}</TableCell>
                          <TableCell className={getStatusColor(nota.status)}>
                            {nota.status.charAt(0).toUpperCase() + nota.status.slice(1)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDocument(nota)}>
                                  <Eye className="h-4 w-4 mr-2" /> Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendEmail(nota)}>
                                  <Send className="h-4 w-4 mr-2" /> Enviar por E-mail
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadDocument(nota)}>
                                  <Download className="h-4 w-4 mr-2" /> Download
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recibos">
            <Card>
              <CardHeader>
                <CardTitle>Recibos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Data Emissão</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRecibos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          Nenhum recibo encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      mockRecibos.map(recibo => (
                        <TableRow key={recibo.id}>
                          <TableCell>{recibo.numero}</TableCell>
                          <TableCell>{recibo.dataEmissao}</TableCell>
                          <TableCell>R$ {recibo.valor.toFixed(2)}</TableCell>
                          <TableCell className={getStatusColor(recibo.status)}>
                            {recibo.status.charAt(0).toUpperCase() + recibo.status.slice(1)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDocument(recibo)}>
                                  <Eye className="h-4 w-4 mr-2" /> Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendEmail(recibo)}>
                                  <Send className="h-4 w-4 mr-2" /> Enviar por E-mail
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadDocument(recibo)}>
                                  <Download className="h-4 w-4 mr-2" /> Download
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Novo Documento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="doc-type">Tipo de Documento</Label>
                      <select
                        id="doc-type"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="nf">Nota Fiscal</option>
                        <option value="recibo">Recibo</option>
                        <option value="contrato">Contrato</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-number">Número do Documento</Label>
                      <Input id="doc-number" placeholder="Ex: NF-12345" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doc-file">Arquivo</Label>
                    <div className="flex gap-4">
                      <Input 
                        id="doc-file" 
                        type="file" 
                        onChange={handleFileChange} 
                      />
                      <Button onClick={handleFileUpload}>
                        <FileUp className="h-4 w-4 mr-2" /> Enviar
                      </Button>
                    </div>
                    {file && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <FileText className="h-4 w-4 inline mr-1" />
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
