import type { Express, Request, Response } from 'express';
import { createRateLimit } from './middleware/rateLimit';

// Helpers
const cleanCNPJ = (cnpj: string) => (cnpj || '').replace(/\D/g, '');
const isValidCNPJ = (cnpj: string) => /^\d{14}$/.test(cnpj);
const formatCNPJ = (cnpj: string) => cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
const formatCEP = (cep: string) => (cep || '').replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2');

type CNPJData = {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
  situacao: string;
};

const mapBrasilApiToData = (data: any): CNPJData => ({
  cnpj: data?.cnpj ? formatCNPJ(data.cnpj) : '',
  razaoSocial: data?.razao_social || '',
  nomeFantasia: data?.nome_fantasia || '',
  endereco: data?.logradouro || '',
  numero: data?.numero || '',
  complemento: data?.complemento || '',
  bairro: data?.bairro || '',
  cidade: data?.municipio || '',
  uf: data?.uf || '',
  cep: formatCEP(data?.cep || ''),
  telefone: data?.ddd_telefone_1 || '',
  email: data?.email || '',
  situacao: data?.descricao_situacao_cadastral || ''
});

const mapCnpjWsToData = (data: any): CNPJData => ({
  cnpj: data?.cnpj_numero ? formatCNPJ(data.cnpj_numero) : '',
  razaoSocial: data?.razao_social || data?.estabelecimento?.razao_social || '',
  nomeFantasia: data?.estabelecimento?.nome_fantasia || data?.razao_social || '',
  endereco: data?.estabelecimento?.logradouro || '',
  numero: data?.estabelecimento?.numero || '',
  complemento: data?.estabelecimento?.complemento || '',
  bairro: data?.estabelecimento?.bairro || '',
  cidade: data?.estabelecimento?.cidade?.nome || data?.estabelecimento?.municipio || '',
  uf: data?.estabelecimento?.estado?.sigla || data?.estabelecimento?.uf || '',
  cep: formatCEP(data?.estabelecimento?.cep || ''),
  telefone: data?.estabelecimento?.telefone1 || data?.estabelecimento?.telefone || '',
  email: data?.estabelecimento?.email || '',
  situacao: data?.situacao?.descricao || data?.estabelecimento?.situacao_cadastral || ''
});

export function registerCnpjRoutes(app: Express) {
  const rateLimit = createRateLimit({ windowMs: 60_000, max: 12, message: 'Muitas consultas de CNPJ. Tente novamente em 1 minuto.' });

  app.get('/api/lookup-cnpj/:cnpj', rateLimit, async (req: Request, res: Response) => {
    try {
      const raw = req.params.cnpj || '';
      const cnpj = cleanCNPJ(raw);

      if (!isValidCNPJ(cnpj)) {
        return res.status(400).json({ success: false, message: 'CNPJ inválido. Use 14 dígitos numéricos.' });
      }

      // Primary: BrasilAPI
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(10_000)
        });

        if (response.ok) {
          const data = await response.json();
          return res.json({ success: true, source: 'BrasilAPI', data: mapBrasilApiToData(data) });
        }
      } catch (err) {
        // fall through to fallback
      }

      // Fallback: publica.cnpj.ws
      try {
        const response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(10_000)
        });

        if (response.ok) {
          const data = await response.json();
          const mapped = mapCnpjWsToData(data);
          // Garantir que o CNPJ venha preenchido
          const ensured = { ...mapped, cnpj: mapped.cnpj || formatCNPJ(cnpj) };
          return res.json({ success: true, source: 'CNPJ.ws', data: ensured });
        }
      } catch (err) {
        // no-op
      }

      return res.status(404).json({ success: false, message: 'CNPJ não encontrado nos serviços disponíveis.' });
    } catch (error: any) {
      console.error('[CNPJ Lookup] Erro:', error?.message || error);
      return res.status(500).json({ success: false, message: 'Erro interno ao consultar CNPJ.' });
    }
  });
}