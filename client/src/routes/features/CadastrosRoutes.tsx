
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { EmpresaTab } from '../../pages/empresas/hooks/useEmpresasTabs';

// Pages Import
import CadastroUsuarios from '../../pages/usuarios/CadastroUsuarios';
import CadastroEmpresas from '../../pages/empresas/CadastroEmpresas';
import CadastroMotoristas from '../../pages/motoristas/CadastroMotoristas';
import CargasMotoristas from '../../pages/motoristas/CargasMotoristas';
import CadastroEnderecamento from '../../pages/cadastros/enderecamento/CadastroEnderecamento';
import ConfiguracoesPage from '../../pages/configuracoes/ConfiguracoesPage';
import PermissoesUsuario from '../../pages/usuarios/components/PermissoesUsuario';

const CadastrosRoutes = () => {
  return [
    // Original paths
    <Route key="cadastros-usuarios" path="/cadastros/usuarios" element={
      <ProtectedRoute>
        <CadastroUsuarios />
      </ProtectedRoute>
    } />,
    
    <Route key="cadastros-empresas" path="/cadastros/empresas" element={
      <ProtectedRoute>
        <CadastroEmpresas />
      </ProtectedRoute>
    } />,
    
    <Route key="cadastros-motoristas" path="/cadastros/motoristas" element={
      <ProtectedRoute>
        <CadastroMotoristas />
      </ProtectedRoute>
    } />,
    
    <Route key="cadastros-motoristas-cargas" path="/cadastros/motoristas/cargas" element={
      <ProtectedRoute>
        <CargasMotoristas />
      </ProtectedRoute>
    } />,
    
    <Route key="cadastros-enderecamento" path="/cadastros/enderecamento" element={
      <ProtectedRoute>
        <CadastroEnderecamento />
      </ProtectedRoute>
    } />,
    
    // Routes matching sidebar links for motoristas section
    <Route key="motoristas-cadastro" path="/motoristas/cadastro" element={
      <ProtectedRoute>
        <CadastroMotoristas />
      </ProtectedRoute>
    } />,
    
    <Route key="motoristas-cargas" path="/motoristas/cargas" element={
      <ProtectedRoute>
        <CargasMotoristas />
      </ProtectedRoute>
    } />,
    
    // Routes matching sidebar links for usuarios section
    <Route key="usuarios-cadastro" path="/usuarios/cadastro" element={
      <ProtectedRoute>
        <CadastroUsuarios initialTab="cadastro" />
      </ProtectedRoute>
    } />,
    
    <Route key="usuarios-permissoes" path="/usuarios/permissoes" element={
      <ProtectedRoute>
        <CadastroUsuarios initialTab="permissoes" />
      </ProtectedRoute>
    } />,
    
    // Standalone permissions route for direct access
    <Route key="permissoes-usuario" path="/permissoes-usuario" element={
      <ProtectedRoute>
        <PermissoesUsuario />
      </ProtectedRoute>
    } />,
    
    // Routes matching sidebar links for empresas section
    <Route key="empresas-cadastro" path="/empresas/cadastro" element={
      <ProtectedRoute>
        <CadastroEmpresas initialTab="cadastro" />
      </ProtectedRoute>
    } />,
    
    <Route key="empresas-permissoes" path="/empresas/permissoes" element={
      <ProtectedRoute>
        <CadastroEmpresas initialTab="permissoes" />
      </ProtectedRoute>
    } />,
    
    <Route key="empresas-listagem" path="/empresas/listagem" element={
      <ProtectedRoute>
        <CadastroEmpresas initialTab="listagem" />
      </ProtectedRoute>
    } />,
    
    <Route key="configuracoes" path="/configuracoes" element={
      <ProtectedRoute>
        <ConfiguracoesPage />
      </ProtectedRoute>
    } />
  ];
};

export default CadastrosRoutes;
