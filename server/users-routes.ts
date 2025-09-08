import express from 'express';
import { storage } from './storage';
import { z } from 'zod';

const router = express.Router();

// Middleware de autenticação
interface AuthenticatedRequest extends express.Request {
  user?: any;
}

const authenticateToken = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const sessionData = await storage.getSessionByToken(token);
    if (!sessionData) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    req.user = sessionData.user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Schema para validação de parâmetros
const empresaIdSchema = z.object({
  empresaId: z.string().uuid('ID da empresa deve ser um UUID válido')
});

/**
 * GET /api/users/empresa/:empresaId
 * Lista todos os usuários cadastrados para uma empresa específica
 */
router.get('/empresa/:empresaId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('users-routes: GET /api/users/empresa/:empresaId called', req.params);
    
    // Validar parâmetros
    const { empresaId } = empresaIdSchema.parse(req.params);
    
    // Verificar se o usuário tem permissão para acessar dados desta empresa
    const currentUser = req.user;
    
    // Super admin pode acessar qualquer empresa
    // Usuários da empresa podem acessar apenas sua própria empresa
    if (currentUser.tipo_usuario !== 'super_admin' && currentUser.empresa_id !== empresaId) {
      return res.status(403).json({ 
        error: 'Acesso negado: você não tem permissão para visualizar usuários desta empresa' 
      });
    }
    
    // Buscar usuários da empresa
    const usuarios = await storage.getUsersByEmpresa(empresaId);
    
    console.log(`users-routes: Found ${usuarios.length} usuários para empresa ${empresaId}`);
    
    // Remover informações sensíveis como senha
    const usuariosSemSenha = usuarios.map(usuario => {
      const { password, ...usuarioSeguro } = usuario;
      return usuarioSeguro;
    });
    
    res.json(usuariosSemSenha);
    
  } catch (error) {
    console.error('Error fetching users by empresa:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

/**
 * GET /api/users/empresa/:empresaId/resumo
 * Retorna resumo estatístico dos usuários da empresa
 */
router.get('/empresa/:empresaId/resumo', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('users-routes: GET /api/users/empresa/:empresaId/resumo called', req.params);
    
    const { empresaId } = empresaIdSchema.parse(req.params);
    
    // Verificar permissões
    const currentUser = req.user;
    if (currentUser.tipo_usuario !== 'super_admin' && currentUser.empresa_id !== empresaId) {
      return res.status(403).json({ 
        error: 'Acesso negado' 
      });
    }
    
    const usuarios = await storage.getUsersByEmpresa(empresaId);
    
    // Calcular estatísticas
    const resumo = {
      total_usuarios: usuarios.length,
      usuarios_ativos: usuarios.filter(u => u.status === 'ativo').length,
      usuarios_pendentes: usuarios.filter(u => u.status === 'pendente_aprovacao').length,
      usuarios_inativos: usuarios.filter(u => u.status === 'inativo').length,
      por_tipo: usuarios.reduce((acc, usuario) => {
        acc[usuario.tipo_usuario] = (acc[usuario.tipo_usuario] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      por_perfil: usuarios.reduce((acc, usuario) => {
        if (usuario.perfil?.nome) {
          acc[usuario.perfil.nome] = (acc[usuario.perfil.nome] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      usuarios_recentes: usuarios
        .filter(u => u.created_at && new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .length
    };
    
    console.log('users-routes: Resumo calculado:', resumo);
    
    res.json(resumo);
    
  } catch (error) {
    console.error('Error fetching users summary:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

export default router;