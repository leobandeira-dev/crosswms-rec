
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { FileText, Truck, Map, Package, FileDown, Eye, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NotaFiscalDetailCardProps {
  notaFiscalData: any;
  xmlContent?: string | null;
  onViewDanfe?: () => void;
  onViewXml?: () => void;
  onDownload?: () => void;
}

const NotaFiscalDetailCard: React.FC<NotaFiscalDetailCardProps> = ({ 
  notaFiscalData, 
  xmlContent,
  onViewDanfe,
  onViewXml,
  onDownload
}) => {
  const [activeTab, setActiveTab] = useState('geral');

  if (!notaFiscalData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Nota Fiscal</CardTitle>
          <CardDescription>Nenhuma nota fiscal selecionada</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência.`
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2 text-cross-blue" />
          Nota Fiscal {notaFiscalData.numeroNF} {notaFiscalData.serieNF ? `- Série ${notaFiscalData.serieNF}` : ''}
        </CardTitle>
        <CardDescription>
          {notaFiscalData.emitenteRazaoSocial && notaFiscalData.destinatarioRazaoSocial
            ? `De ${notaFiscalData.emitenteRazaoSocial} para ${notaFiscalData.destinatarioRazaoSocial}`
            : 'Detalhes da nota fiscal'}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="emitente">Emitente</TabsTrigger>
            <TabsTrigger value="destinatario">Destinatário</TabsTrigger>
            <TabsTrigger value="transporte">Transporte</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {notaFiscalData.chaveNF && (
                <div>
                  <Label className="text-sm text-muted-foreground">Chave de Acesso</Label>
                  <div className="flex items-center mt-1">
                    <p className="text-sm font-medium truncate">{notaFiscalData.chaveNF}</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => copyToClipboard(notaFiscalData.chaveNF, 'Chave')}
                    >
                      <FileDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              <div>
                <Label className="text-sm text-muted-foreground">Data de Emissão</Label>
                <p className="text-sm font-medium">
                  {notaFiscalData.dataHoraEmissao ? new Date(notaFiscalData.dataHoraEmissao).toLocaleString() : 'N/D'}
                </p>
              </div>
              
              {notaFiscalData.valorTotal && (
                <div>
                  <Label className="text-sm text-muted-foreground">Valor Total</Label>
                  <p className="text-sm font-medium">
                    R$ {notaFiscalData.valorTotal ? Number(notaFiscalData.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                  </p>
                </div>
              )}
              
              {notaFiscalData.numeroPedido && (
                <div>
                  <Label className="text-sm text-muted-foreground">Número do Pedido</Label>
                  <p className="text-sm font-medium">{notaFiscalData.numeroPedido}</p>
                </div>
              )}
              
              {notaFiscalData.tipoOperacao && (
                <div>
                  <Label className="text-sm text-muted-foreground">Tipo de Operação</Label>
                  <p className="text-sm font-medium">
                    {notaFiscalData.tipoOperacao === "0" ? "Entrada" : 
                     notaFiscalData.tipoOperacao === "1" ? "Saída" : notaFiscalData.tipoOperacao}
                  </p>
                </div>
              )}
            </div>
            
            {notaFiscalData.informacoesComplementares && (
              <div>
                <Label className="text-sm text-muted-foreground">Informações Complementares</Label>
                <p className="text-sm mt-1 text-muted-foreground">{notaFiscalData.informacoesComplementares}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="emitente" className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Razão Social</Label>
              <p className="text-sm font-medium">{notaFiscalData.emitenteRazaoSocial || 'N/D'}</p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">CNPJ</Label>
              <p className="text-sm font-medium">{notaFiscalData.emitenteCNPJ || 'N/D'}</p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Endereço</Label>
              <p className="text-sm font-medium">
                {[
                  notaFiscalData.emitenteEndereco,
                  notaFiscalData.emitenteNumero,
                  notaFiscalData.emitenteBairro,
                  notaFiscalData.emitenteCidade,
                  notaFiscalData.emitenteUF,
                  notaFiscalData.emitenteCEP
                ].filter(Boolean).join(', ')}
              </p>
            </div>

            {notaFiscalData.emitenteTelefone && (
              <div>
                <Label className="text-sm text-muted-foreground">Telefone</Label>
                <p className="text-sm font-medium">{notaFiscalData.emitenteTelefone}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="destinatario" className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Razão Social</Label>
              <p className="text-sm font-medium">{notaFiscalData.destinatarioRazaoSocial || 'N/D'}</p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">CNPJ</Label>
              <p className="text-sm font-medium">{notaFiscalData.destinatarioCNPJ || 'N/D'}</p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Endereço</Label>
              <p className="text-sm font-medium">
                {[
                  notaFiscalData.destinatarioEndereco,
                  notaFiscalData.destinatarioNumero,
                  notaFiscalData.destinatarioBairro,
                  notaFiscalData.destinatarioCidade,
                  notaFiscalData.destinatarioUF,
                  notaFiscalData.destinatarioCEP
                ].filter(Boolean).join(', ')}
              </p>
            </div>

            {notaFiscalData.destinatarioTelefone && (
              <div>
                <Label className="text-sm text-muted-foreground">Telefone</Label>
                <p className="text-sm font-medium">{notaFiscalData.destinatarioTelefone}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="transporte" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {notaFiscalData.pesoTotalBruto && (
                <div>
                  <Label className="text-sm text-muted-foreground">Peso Total Bruto</Label>
                  <p className="text-sm font-medium">
                    {Number(notaFiscalData.pesoTotalBruto).toLocaleString('pt-BR', { minimumFractionDigits: 3 })} kg
                  </p>
                </div>
              )}

              {notaFiscalData.volumesTotal && (
                <div>
                  <Label className="text-sm text-muted-foreground">Volumes</Label>
                  <p className="text-sm font-medium">{notaFiscalData.volumesTotal}</p>
                </div>
              )}
            </div>
            
            {/* Informações de transporte manualmente adicionadas */}
            {notaFiscalData.numeroColeta && (
              <div>
                <Label className="text-sm text-muted-foreground">Número da Coleta</Label>
                <p className="text-sm font-medium">{notaFiscalData.numeroColeta}</p>
              </div>
            )}
            
            {notaFiscalData.numeroCTeColeta && (
              <div>
                <Label className="text-sm text-muted-foreground">CT-e de Coleta</Label>
                <p className="text-sm font-medium">{notaFiscalData.numeroCTeColeta}</p>
              </div>
            )}
            
            {notaFiscalData.numeroCTeViagem && (
              <div>
                <Label className="text-sm text-muted-foreground">CT-e de Viagem</Label>
                <p className="text-sm font-medium">{notaFiscalData.numeroCTeViagem}</p>
              </div>
            )}
            
            {notaFiscalData.responsavelEntrega && (
              <div>
                <Label className="text-sm text-muted-foreground">Responsável pela Entrega</Label>
                <p className="text-sm font-medium">{notaFiscalData.responsavelEntrega}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {(onViewDanfe || onViewXml || onDownload) && (
        <CardFooter className="border-t pt-4 flex justify-end space-x-2">
          {onViewDanfe && (
            <Button variant="outline" size="sm" onClick={onViewDanfe}>
              <Eye className="h-4 w-4 mr-1" />
              Ver DANFE
            </Button>
          )}
          {onViewXml && xmlContent && (
            <Button variant="outline" size="sm" onClick={onViewXml}>
              <FileText className="h-4 w-4 mr-1" />
              Ver XML
            </Button>
          )}
          {onDownload && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <FileDown className="h-4 w-4 mr-1" />
              Download
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default NotaFiscalDetailCard;
