
import { VolumeData } from './types';

export const getClassificacaoText = (classificacao?: string): string => {
  switch (classificacao) {
    case 'nao_perigosa':
      return 'Cargas Não Perigosas';
    case 'perigosa':
      return 'Cargas Perigosas';
    case 'nao_classificada':
    default:
      return 'Cargas Não Classificadas';
  }
};

export const getDisplayCidade = (volumeData: VolumeData): string => {
  return volumeData.cidadeCompleta || volumeData.cidade || 'N/A';
};
