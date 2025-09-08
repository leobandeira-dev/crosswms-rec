
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Etiqueta } from '@/types/supabase/armazem.types';
import { Biohazard, Package, Calendar, MapPin } from 'lucide-react';

interface EtiquetaDetalhesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  etiqueta: Etiqueta | null;
}

const EtiquetaDetalhesDialog: React.FC<EtiquetaDetalhesDialogProps> = ({
  open,
  onOpenChange,
  etiqueta
}) => {
  if (!etiqueta) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'etiquetada':
        return <Badge variant="default" className="bg-green-500">Etiquetada</Badge>;
      case 'gerada':
        return <Badge variant="secondary">Gerada</Badge>;
      case 'inutilizada':
        return <Badge variant="destructive">Inutilizada</Badge>;
      case 'unitizada':
        return <Badge variant="outline">Unitizada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detalhes da Etiqueta: {etiqueta.codigo}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-semibold">Código:</span> {etiqueta.codigo}
              </div>
              <div>
                <span className="font-semibold">Tipo:</span> {etiqueta.tipo}
              </div>
              <div>
                <span className="font-semibold">Status:</span> {getStatusBadge(etiqueta.status)}
              </div>
              <div>
                <span className="font-semibold">Descrição:</span> {etiqueta.descricao || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Quantidade:</span> 
                <span className="ml-2 text-xl font-bold text-blue-600">{etiqueta.quantidade || 1}</span>
              </div>
              {etiqueta.area && (
                <div className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-500">
                  <span className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Área:
                  </span>
                  <span className="ml-2 text-2xl font-bold text-indigo-600">{etiqueta.area}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações de Volume */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Volume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                <span className="font-semibold">Volume:</span>
                <span className="ml-2 text-xl font-bold text-blue-600">
                  {etiqueta.volume_numero || 1}/{etiqueta.total_volumes || 1}
                </span>
              </div>
              <div>
                <span className="font-semibold">Peso Total:</span> {etiqueta.peso_total_bruto || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Chave NF:</span> {etiqueta.chave_nf || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Número Pedido:</span> {etiqueta.numero_pedido || 'N/A'}
              </div>
            </CardContent>
          </Card>

          {/* Remetente e Destinatário */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Remetente e Destinatário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-semibold">Remetente:</span> {etiqueta.remetente || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Destinatário:</span> {etiqueta.destinatario || 'N/A'}
              </div>
              <Separator />
              <div>
                <span className="font-semibold">Endereço:</span> {etiqueta.endereco || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Cidade:</span> {etiqueta.cidade || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">UF:</span> {etiqueta.uf || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">CEP:</span> {etiqueta.cep || 'N/A'}
              </div>
            </CardContent>
          </Card>

          {/* Informações Químicas */}
          {(etiqueta.codigo_onu || etiqueta.codigo_risco) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Biohazard className="h-5 w-5 text-red-500" />
                  Produto Químico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                  <div>
                    <span className="font-semibold">Código ONU:</span> {etiqueta.codigo_onu || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Código de Risco:</span> {etiqueta.codigo_risco || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Classificação:</span> {etiqueta.classificacao_quimica || 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Datas e Histórico */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-semibold">Data Geração:</span>
                  <br />
                  {formatDate(etiqueta.data_geracao)}
                </div>
                {etiqueta.data_impressao && (
                  <div>
                    <span className="font-semibold">Data Impressão:</span>
                    <br />
                    {formatDate(etiqueta.data_impressao)}
                  </div>
                )}
                {etiqueta.data_inutilizacao && (
                  <div>
                    <span className="font-semibold">Data Inutilização:</span>
                    <br />
                    {formatDate(etiqueta.data_inutilizacao)}
                  </div>
                )}
              </div>
              {etiqueta.motivo_inutilizacao && (
                <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                  <span className="font-semibold">Motivo Inutilização:</span>
                  <br />
                  {etiqueta.motivo_inutilizacao}
                </div>
              )}
              {etiqueta.etiqueta_mae_id && (
                <div>
                  <span className="font-semibold">Etiqueta Mãe:</span> {etiqueta.etiqueta_mae_id}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EtiquetaDetalhesDialog;
