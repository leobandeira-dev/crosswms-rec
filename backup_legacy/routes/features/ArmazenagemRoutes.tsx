import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

// Pages Import
import Armazenagem from '../../pages/armazenagem/Armazenagem';
import RecebimentoOverview from '../../pages/armazenagem/RecebimentoOverview';
import MovimentacoesInternas from '../../pages/armazenagem/MovimentacoesInternas';
import Carregamento from '../../pages/armazenagem/Carregamento';
import CarregamentoIndex from '../../pages/armazenagem/CarregamentoIndex';
import ChecklistCarregamento from '../../pages/armazenagem/ChecklistCarregamento';
import OrdemCarregamento from '../../pages/armazenagem/carregamento/OrdemCarregamento';
import ConferenciaCarga from '../../pages/armazenagem/carregamento/ConferenciaCarga';
import EnderecamentoCaminhao from '../../pages/armazenagem/carregamento/EnderecamentoCaminhao';
import ChecklistCarga from '../../pages/armazenagem/carregamento/ChecklistCarga';
import UnitizacaoPaletes from '../../pages/armazenagem/movimentacoes/UnitizacaoPaletes';
import CancelarUnitizacao from '../../pages/armazenagem/movimentacoes/CancelarUnitizacao';
import Enderecamento from '../../pages/armazenagem/movimentacoes/Enderecamento';
import EntradaNotas from '../../pages/armazenagem/recebimento/EntradaNotas';
import GeracaoEtiquetas from '../../pages/armazenagem/recebimento/GeracaoEtiquetas';
import RecebimentoFornecedor from '../../pages/armazenagem/recebimento/RecebimentoFornecedor';
import RecebimentoColeta from '../../pages/armazenagem/recebimento/RecebimentoColeta';
import RecebimentoFiliais from '../../pages/armazenagem/recebimento/RecebimentoFiliais';
import RastreamentoNotasFiscais from '../../pages/armazenagem/recebimento/RastreamentoNotasFiscais';

const ArmazenagemRoutes = () => {
  return [
    <Route key="armazenagem" path="/armazenagem" element={
      <ProtectedRoute>
        <Armazenagem />
      </ProtectedRoute>
    } />,

    <Route key="armazenagem-recebimento" path="/armazenagem/recebimento" element={
      <ProtectedRoute>
        <RecebimentoOverview />
      </ProtectedRoute>
    } />,

    <Route key="armazenagem-recebimento-notas" path="/armazenagem/recebimento/notas" element={
      <ProtectedRoute>
        <EntradaNotas />
      </ProtectedRoute>
    } />,
    
    <Route key="armazenagem-recebimento-etiquetas" path="/armazenagem/recebimento/etiquetas" element={
      <ProtectedRoute>
        <GeracaoEtiquetas />
      </ProtectedRoute>
    } />,
    
    <Route key="armazenagem-recebimento-fornecedor" path="/armazenagem/recebimento/fornecedor" element={
      <ProtectedRoute>
        <RecebimentoFornecedor />
      </ProtectedRoute>
    } />,
    
    <Route key="armazenagem-recebimento-coleta" path="/armazenagem/recebimento/coleta" element={
      <ProtectedRoute>
        <RecebimentoColeta />
      </ProtectedRoute>
    } />,
    
    <Route key="armazenagem-recebimento-filiais" path="/armazenagem/recebimento/filiais" element={
      <ProtectedRoute>
        <RecebimentoFiliais />
      </ProtectedRoute>
    } />,
    
    <Route key="armazenagem-recebimento-rastreamento" path="/armazenagem/recebimento/rastreamento" element={
      <ProtectedRoute>
        <RastreamentoNotasFiscais />
      </ProtectedRoute>
    } />,
    
    <Route key="armazenagem-movimentacoes" path="/armazenagem/movimentacoes" element={
      <ProtectedRoute>
        <MovimentacoesInternas />
      </ProtectedRoute>
    } />,
    
    <Route key="armazenagem-movimentacoes-unitizacao" path="/armazenagem/movimentacoes/unitizacao" element={
      <ProtectedRoute>
        <UnitizacaoPaletes />
      </ProtectedRoute>
    } />,
    
    <Route key="armazenagem-movimentacoes-cancelar-unitizacao" path="/armazenagem/movimentacoes/cancelar-unitizacao" element={
      <ProtectedRoute>
        <CancelarUnitizacao />
      </ProtectedRoute>
    } />,
    
    <Route key="armazenagem-movimentacoes-enderecamento" path="/armazenagem/movimentacoes/enderecamento" element={
      <ProtectedRoute>
        <Enderecamento />
      </ProtectedRoute>
    } />,
    
    <Route key="armazenagem-carregamento" path="/armazenagem/carregamento" element={
      <ProtectedRoute>
        <Carregamento />
      </ProtectedRoute>
    } />,
    
    <Route key="armazenagem-carregamento-ordem" path="/armazenagem/carregamento/ordem" element={
      <ProtectedRoute>
        <OrdemCarregamento />
      </ProtectedRoute>
    } />,
    
    <Route key="armazenagem-carregamento-conferencia" path="/armazenagem/carregamento/conferencia" element={
      <ProtectedRoute>
        <ConferenciaCarga />
      </ProtectedRoute>
    } />,
    
    <Route key="armazenagem-carregamento-enderecamento" path="/armazenagem/carregamento/enderecamento" element={
      <ProtectedRoute>
        <EnderecamentoCaminhao />
      </ProtectedRoute>
    } />,
    
    <Route key="armazenagem-carregamento-checklist" path="/armazenagem/carregamento/checklist" element={
      <ProtectedRoute>
        <ChecklistCarga />
      </ProtectedRoute>
    } />,
    
    <Route key="armazenagem-rastreamento" path="/armazenagem/rastreamento" element={
      <ProtectedRoute>
        <RastreamentoNotasFiscais />
      </ProtectedRoute>
    } />,
    
    <Route key="armazenagem-ordem-carregamento" path="/armazenagem/ordem-carregamento" element={
      <ProtectedRoute>
        <OrdemCarregamento />
      </ProtectedRoute>
    } />,
    
    // Carregamento Index
    <Route key="carregamento-index" path="/carregamento" element={
      <ProtectedRoute>
        <CarregamentoIndex />
      </ProtectedRoute>
    } />,
    
    // Checklist Carregamento
    <Route key="checklist-carregamento" path="/armazenagem/checklist" element={
      <ProtectedRoute>
        <ChecklistCarregamento />
      </ProtectedRoute>
    } />,
  ];
};

export default ArmazenagemRoutes;
