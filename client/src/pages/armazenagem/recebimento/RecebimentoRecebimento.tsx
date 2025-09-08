import MainLayout from '@/components/layout/MainLayout';
import VisualizacaoOrdensRecebimento from '@/components/armazenagem/VisualizacaoOrdensRecebimento';

const RecebimentoRecebimento = () => {
  return (
    <MainLayout title="Recebimento - Ordens de Carga">
      <VisualizacaoOrdensRecebimento />
    </MainLayout>
  );
};

export default RecebimentoRecebimento;