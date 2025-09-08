
export interface OrdemCarregamento {
  id: string;
  cliente: string;
  tipoCarregamento: string;
  dataCarregamento: string;
  transportadora: string;
  placaVeiculo: string;
  motorista: string;
  status: 'pending' | 'processing' | 'completed';
  notasFiscais?: NotaFiscal[];
  observacoes?: string;
  destinatario?: string;
  volumesTotal?: number;
  volumesVerificados?: number;
  conferenteResponsavel?: string;
  inicioConferencia?: string;
  fimConferencia?: string;
}

export interface NotaFiscal {
  id: string;
  numero: string;
  remetente: string;
  cliente: string;
  pedido?: string;
  dataEmissao: string;
  valor: number;
  pesoBruto: number;
}
