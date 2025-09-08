import { Request, Response, Router } from "express";
import { storage } from "./storage";
import { 
  insertClienteTransportadorSchema,
  type InsertClienteTransportador 
} from "@shared/schema";
import { z } from "zod";

const router = Router();

// GET /api/clientes-transportador - Listar todos os clientes transportador
router.get("/clientes-transportador", async (req: Request, res: Response) => {
  try {
    const clientesTransportador = await storage.getAllClientesTransportador();
    res.json(clientesTransportador);
  } catch (error) {
    console.error('Erro ao buscar clientes transportador:', error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET /api/clientes-transportador/:id - Buscar cliente transportador por ID
router.get("/clientes-transportador/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clienteTransportador = await storage.getClienteTransportadorById(id);
    
    if (!clienteTransportador) {
      return res.status(404).json({ error: "Cliente transportador não encontrado" });
    }
    
    res.json(clienteTransportador);
  } catch (error) {
    console.error('Erro ao buscar cliente transportador:', error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET /api/clientes-transportador/cnpj/:cnpj - Buscar cliente transportador por CNPJ
router.get("/clientes-transportador/cnpj/:cnpj", async (req: Request, res: Response) => {
  try {
    const { cnpj } = req.params;
    const clienteTransportador = await storage.getClienteTransportadorByCnpj(cnpj);
    
    if (!clienteTransportador) {
      return res.status(404).json({ error: "Cliente transportador não encontrado" });
    }
    
    res.json(clienteTransportador);
  } catch (error) {
    console.error('Erro ao buscar cliente transportador por CNPJ:', error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST /api/clientes-transportador - Criar novo cliente transportador
router.post("/clientes-transportador", async (req: Request, res: Response) => {
  try {
    const validatedData = insertClienteTransportadorSchema.parse(req.body);
    const clienteTransportador = await storage.createClienteTransportador(validatedData);
    res.status(201).json(clienteTransportador);
  } catch (error) {
    console.error('Erro ao criar cliente transportador:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// PUT /api/clientes-transportador/:id - Atualizar cliente transportador
router.put("/clientes-transportador/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = insertClienteTransportadorSchema.partial().parse(req.body);
    
    const clienteTransportador = await storage.updateClienteTransportador(id, validatedData);
    res.json(clienteTransportador);
  } catch (error) {
    console.error('Erro ao atualizar cliente transportador:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// DELETE /api/clientes-transportador/:id - Deletar cliente transportador
router.delete("/clientes-transportador/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteClienteTransportador(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Cliente transportador não encontrado" });
    }
    
    res.json({ message: "Cliente transportador deletado com sucesso" });
  } catch (error) {
    console.error('Erro ao deletar cliente transportador:', error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET /api/clientes-transportador/:id/empresas - Buscar empresas vinculadas ao cliente transportador
router.get("/clientes-transportador/:id/empresas", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const empresas = await storage.getEmpresasByClienteTransportador(id);
    res.json(empresas);
  } catch (error) {
    console.error('Erro ao buscar empresas do cliente transportador:', error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Controle de Acesso - Rotas para dados específicos por cliente transportador

// GET /api/clientes-transportador/:id/users - Buscar usuários do cliente transportador
router.get("/clientes-transportador/:id/users", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const users = await storage.getUsersByClienteTransportador(id);
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários do cliente transportador:', error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET /api/clientes-transportador/:id/notas-fiscais - Buscar notas fiscais do cliente transportador
router.get("/clientes-transportador/:id/notas-fiscais", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notasFiscais = await storage.getNotasFiscaisByClienteTransportador(id);
    res.json(notasFiscais);
  } catch (error) {
    console.error('Erro ao buscar notas fiscais do cliente transportador:', error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET /api/clientes-transportador/:id/carregamentos - Buscar carregamentos do cliente transportador
router.get("/clientes-transportador/:id/carregamentos", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const carregamentos = await storage.getCarregamentosByClienteTransportador(id);
    res.json(carregamentos);
  } catch (error) {
    console.error('Erro ao buscar carregamentos do cliente transportador:', error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;