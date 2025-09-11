-- Setup Supabase as official database
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create basic tables to test functionality
CREATE TABLE IF NOT EXISTS ordens_carga (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_ordem VARCHAR NOT NULL UNIQUE,
  tipo_carregamento VARCHAR NOT NULL DEFAULT 'Normal',
  empresa_cliente_id VARCHAR,
  motorista_id VARCHAR,
  veiculo_id VARCHAR,
  data_prevista TIMESTAMP NOT NULL DEFAULT NOW(),
  status VARCHAR DEFAULT 'planejada',
  observacoes TEXT,
  usuario_responsavel_id VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample ordem de carga
INSERT INTO ordens_carga (numero_ordem, tipo_carregamento, data_prevista, status, usuario_responsavel_id) 
VALUES 
  ('ORD-2025-001', 'Normal', NOW() + INTERVAL '1 day', 'ativa', gen_random_uuid()),
  ('ORD-2025-002', 'Urgente', NOW() + INTERVAL '2 days', 'pendente', gen_random_uuid()),
  ('ORD-2025-003', 'Normal', NOW() + INTERVAL '3 days', 'planejada', gen_random_uuid())
ON CONFLICT (numero_ordem) DO NOTHING;

-- Create notas_fiscais table  
CREATE TABLE IF NOT EXISTS notas_fiscais (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_nf VARCHAR NOT NULL,
  data_emissao TIMESTAMP DEFAULT NOW(),
  valor DECIMAL(12,2),
  empresa_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample notas fiscais
INSERT INTO notas_fiscais (numero_nf, valor, empresa_id)
VALUES 
  ('12345', 1250.00, gen_random_uuid()),
  ('12346', 890.50, gen_random_uuid()),
  ('12347', 1850.75, gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Create volumes_etiqueta table
CREATE TABLE IF NOT EXISTS volumes_etiqueta (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_etiqueta VARCHAR NOT NULL,
  nota_fiscal_id VARCHAR,
  peso_kg DECIMAL(8,3),
  descricao TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create itens_carga table
CREATE TABLE IF NOT EXISTS itens_carga (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_carga_id VARCHAR,
  nota_fiscal_id VARCHAR,
  quantidade INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Test the setup
SELECT 'Ordens de Carga' as tabela, COUNT(*) as registros FROM ordens_carga
UNION ALL
SELECT 'Notas Fiscais' as tabela, COUNT(*) as registros FROM notas_fiscais
UNION ALL  
SELECT 'Volumes Etiqueta' as tabela, COUNT(*) as registros FROM volumes_etiqueta
UNION ALL
SELECT 'Itens Carga' as tabela, COUNT(*) as registros FROM itens_carga;