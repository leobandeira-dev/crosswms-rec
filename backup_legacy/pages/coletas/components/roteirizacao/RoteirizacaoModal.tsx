
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Carga } from '../../types/coleta.types';
import ModalHeader from './ModalHeader';
import ModalFooter from './ModalFooter';
import RotaTable from './RotaTable';
import { calcularRotaAvancada } from './utils/rotaOptimization';

interface RoteirizacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargas: Carga[];
}

const RoteirizacaoModal: React.FC<RoteirizacaoModalProps> = ({
  isOpen,
  onClose,
  cargas
}) => {
  const [rotaOtimizada, setRotaOtimizada] = useState<Carga[]>([]);
  const [isRotaCalculada, setIsRotaCalculada] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calcular rota otimizada quando o modal é aberto
  useEffect(() => {
    if (isOpen && cargas.length > 0) {
      setRotaOtimizada([...cargas]); // Inicialmente, mantenha a ordem original
      setIsRotaCalculada(false);
    } else {
      setIsRotaCalculada(false);
    }
  }, [isOpen, cargas]);

  // Calcular a ordem otimizada usando as APIs avançadas do Google Maps
  const calcularRota = async () => {
    setIsLoading(true);

    try {
      const optimizedCargas = await calcularRotaAvancada(cargas);
      setRotaOtimizada(optimizedCargas);
      setIsRotaCalculada(true);
    } catch (error) {
      console.error("Erro ao calcular rota:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Movimentar um item para cima na lista
  const moverParaCima = (index: number) => {
    if (index <= 0) return;
    
    const novaRota = [...rotaOtimizada];
    const temp = novaRota[index];
    novaRota[index] = novaRota[index - 1];
    novaRota[index - 1] = temp;
    setRotaOtimizada(novaRota);
  };
  
  // Movimentar um item para baixo na lista
  const moverParaBaixo = (index: number) => {
    if (index >= rotaOtimizada.length - 1) return;
    
    const novaRota = [...rotaOtimizada];
    const temp = novaRota[index];
    novaRota[index] = novaRota[index + 1];
    novaRota[index + 1] = temp;
    setRotaOtimizada(novaRota);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <ModalHeader 
          cargas={cargas} 
          isLoading={isLoading} 
          calcularRota={calcularRota} 
        />
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Ordem</TableHead>
                <TableHead className="w-[120px]">Número</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>CEP</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <RotaTable
                rotaOtimizada={rotaOtimizada}
                moverParaCima={moverParaCima}
                moverParaBaixo={moverParaBaixo}
                isLoading={isLoading}
              />
            </TableBody>
          </Table>
        </div>
        
        <ModalFooter rotaOtimizada={rotaOtimizada} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default RoteirizacaoModal;
