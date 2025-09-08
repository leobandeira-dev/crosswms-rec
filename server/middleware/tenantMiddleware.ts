import { storage } from '../storage';

// Middleware para isolamento multi-tenant baseado em hierarquia de empresas (3 níveis)
export const tenantMiddleware = async (req: any, res: any, next: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario não autenticado' });
    }

    const user = req.user;
    
    // Buscar empresa do usuário com relacionamentos
    const userWithCompany = await storage.getUserWithCompanyById(user.id);
    if (!userWithCompany || !userWithCompany.empresa) {
      return res.status(403).json({ error: 'Empresa do usuário não encontrada' });
    }

    const empresa = userWithCompany.empresa;
    
    // Determinar a raiz do grupo empresarial (tenant root)
    let grupoEmpresarial;
    
    if (empresa.tipo_empresa === 'sistema') {
      // Super Admin vê tudo
      req.tenant = {
        isSuperAdmin: true,
        empresaAtual: empresa,
        tipoUsuario: 'sistema'
      };
      return next();
    }
    
    if (empresa.tipo_empresa === 'transportador') {
      // Transportador matriz é a raiz do grupo
      grupoEmpresarial = empresa;
    } else {
      // Para filiais, clientes e fornecedores, buscar o grupo empresarial
      const grupoId = empresa.grupo_empresarial_id || empresa.empresa_matriz_id;
      if (!grupoId) {
        return res.status(403).json({ error: 'Empresa sem grupo empresarial definido' });
      }
      grupoEmpresarial = await storage.getEmpresaById(grupoId);
      if (!grupoEmpresarial) {
        return res.status(403).json({ error: 'Grupo empresarial não encontrado' });
      }
    }

    // Buscar todas as empresas do tenant baseado no tipo de usuário
    let empresasPermitidas = [];
    
    switch (empresa.tipo_empresa) {
      case 'transportador':
        // Transportador vê: próprias filiais + todos clientes + todos fornecedores
        empresasPermitidas = await storage.getEmpresasByGrupo(grupoEmpresarial.id);
        break;
        
      case 'filial_transportador':
        // Filial do transportador vê: própria empresa + todos clientes + todos fornecedores do grupo
        empresasPermitidas = await storage.getEmpresasByGrupo(empresa.grupo_empresarial_id!);
        break;
        
      case 'cliente':
        // Cliente vê: própria empresa + fornecedores onde aparecem como destinatário/remetente
        empresasPermitidas = await storage.getEmpresasRelacionadasCliente(empresa.id);
        break;
        
      case 'fornecedor':
        // Fornecedor vê: própria empresa + documentos onde aparecem como destinatário/remetente
        empresasPermitidas = [empresa];
        break;
    }

    const idsEmpresasPermitidas = empresasPermitidas.map(emp => emp.id);

    // Adicionar informações do tenant ao request
    req.tenant = {
      grupoEmpresarial: grupoEmpresarial,
      empresaAtual: empresa,
      empresasPermitidas: empresasPermitidas,
      idsEmpresas: idsEmpresasPermitidas,
      tipoUsuario: empresa.tipo_empresa,
      isMatriz: empresa.tipo_empresa === 'transportador',
      isFilial: empresa.tipo_empresa === 'filial_transportador',
      isCliente: empresa.tipo_empresa === 'cliente',
      isFornecedor: empresa.tipo_empresa === 'fornecedor',
      isSuperAdmin: false
    };

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    return res.status(500).json({ error: 'Erro no isolamento multi-tenant' });
  }
};

// Middleware específico para operações que requerem ser da empresa matriz
export const requireMatrizAccess = (req: any, res: any, next: any) => {
  if (!req.tenant || !req.tenant.isMatriz) {
    return res.status(403).json({ 
      error: 'Acesso restrito à empresa matriz/transportador' 
    });
  }
  next();
};

// Middleware para verificar acesso a uma empresa específica
export const verifyEmpresaAccess = (empresaIdParam: string = 'empresaId') => {
  return (req: any, res: any, next: any) => {
    const empresaId = req.params[empresaIdParam] || req.query[empresaIdParam] || req.body[empresaIdParam];
    
    if (!empresaId) {
      return res.status(400).json({ error: 'ID da empresa não fornecido' });
    }

    if (!req.tenant || !req.tenant.idsEmpresas.includes(empresaId)) {
      return res.status(403).json({ 
        error: 'Acesso negado à empresa solicitada' 
      });
    }

    next();
  };
};