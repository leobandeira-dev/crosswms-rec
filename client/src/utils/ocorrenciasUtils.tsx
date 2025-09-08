
import React from 'react';
import { Ocorrencia } from "../types/ocorrencias.types";
import StatusBadge from "../components/common/StatusBadge";

export const getTipoOcorrenciaText = (tipo: string): string => {
  const tipoMap: Record<string, string> = {
    'extravio': 'Extravio',
    'avaria': 'Avaria',
    'atraso': 'Atraso',
    'divergencia': 'Divergência',
  };
  return tipoMap[tipo] || tipo;
};

export const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { type: 'success' | 'warning' | 'error' | 'info' | 'pending'; text: string }> = {
    'open': { type: 'error', text: 'Aberto' },
    'in_progress': { type: 'warning', text: 'Em Andamento' },
    'resolved': { type: 'info', text: 'Resolvido' },
    'closed': { type: 'success', text: 'Fechado' },
  };
  const statusData = statusMap[status] || { type: 'pending', text: status };
  return <StatusBadge status={statusData.type} text={statusData.text} />;
};

export const getPrioridadeBadge = (prioridade: string) => {
  const prioridadeMap: Record<string, { type: 'success' | 'warning' | 'error' | 'info' | 'pending'; text: string }> = {
    'high': { type: 'error', text: 'Alta' },
    'medium': { type: 'warning', text: 'Média' },
    'low': { type: 'info', text: 'Baixa' },
  };
  // Add a fallback in case prioridade is not one of the keys in prioridadeMap
  const prioridadeData = prioridadeMap[prioridade] || { type: 'pending', text: prioridade };
  return <StatusBadge status={prioridadeData.type} text={prioridadeData.text} />;
};

export const getDocumentTypeText = (tipo: string): string => {
  const tipoMap: Record<string, string> = {
    'nota': 'Nota Fiscal',
    'coleta': 'Coleta',
    'oc': 'Ordem de Carregamento',
  };
  return tipoMap[tipo] || tipo;
};

// Novas funções para cálculos de performance

export const calcularTempoProcessamento = (
  dataInicio?: string, 
  dataFim?: string
): number | null => {
  if (!dataInicio || !dataFim) return null;
  
  const inicio = new Date(dataInicio).getTime();
  const fim = new Date(dataFim).getTime();
  
  if (isNaN(inicio) || isNaN(fim) || fim < inicio) return null;
  
  // Retorna o tempo em minutos
  return Math.round((fim - inicio) / (1000 * 60));
};

export const formatarTempo = (minutos?: number): string => {
  if (!minutos || isNaN(minutos)) return 'N/A';
  
  const dias = Math.floor(minutos / (60 * 24));
  const horas = Math.floor((minutos % (60 * 24)) / 60);
  const mins = Math.floor(minutos % 60);
  
  if (dias > 0) {
    return `${dias}d ${horas}h ${mins}m`;
  } else if (horas > 0) {
    return `${horas}h ${mins}m`;
  } else {
    return `${mins}m`;
  }
};

export const getTempoProcessamentoStatusColor = (minutos?: number): string => {
  if (!minutos || isNaN(minutos)) return 'text-gray-500';
  
  // Limites em minutos (ajuste conforme necessário)
  const limiteRapido = 60 * 4; // 4 horas
  const limiteBom = 60 * 12; // 12 horas
  const limiteRegular = 60 * 24; // 24 horas
  
  if (minutos <= limiteRapido) {
    return 'text-green-600';
  } else if (minutos <= limiteBom) {
    return 'text-blue-600';
  } else if (minutos <= limiteRegular) {
    return 'text-amber-600';
  } else {
    return 'text-red-600';
  }
};
