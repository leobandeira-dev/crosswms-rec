
import { CelulaLayout } from '@/types/enderecamento.types';

export const initializeLayout = (): CelulaLayout[] => {
  const novoLayout: CelulaLayout[] = [];
  const colunas: Array<'esquerda' | 'centro' | 'direita'> = ['esquerda', 'centro', 'direita'];
  
  for (let linha = 1; linha <= 20; linha++) {
    for (const coluna of colunas) {
      novoLayout.push({
        id: `${coluna}-${linha}`,
        coluna,
        linha,
        volumes: []
      });
    }
  }
  
  return novoLayout;
};
