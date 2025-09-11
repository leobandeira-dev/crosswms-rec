-- Create Supabase schema matching Drizzle schema exactly
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop tables if they exist (for clean start)
DROP TABLE IF EXISTS enderecamento_caminhao CASCADE;
DROP TABLE IF EXISTS volumes_etiqueta CASCADE;
DROP TABLE IF EXISTS itens_carga CASCADE;
DROP TABLE IF EXISTS notas_fiscais CASCADE;
DROP TABLE IF EXISTS ordens_carga CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;

-- Create empresas table first (referenced by other tables)
CREATE TABLE empresas (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj VARCHAR UNIQUE NOT NULL,
  razao_social VARCHAR NOT NULL,
  nome_fantasia VARCHAR,
  endereco TEXT,
  telefone VARCHAR,
  email VARCHAR,
  tipo VARCHAR,
  status VARCHAR DEFAULT 'ativo',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create ordens_carga table
CREATE TABLE ordens_carga (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_ordem VARCHAR NOT NULL,
  tipo_carregamento VARCHAR NOT NULL,
  empresa_cliente_id VARCHAR NOT NULL,
  motorista_id VARCHAR,
  veiculo_id VARCHAR,
  data_prevista TIMESTAMP NOT NULL,
  status VARCHAR DEFAULT 'planejada',
  observacoes TEXT,
  usuario_responsavel_id VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create notas_fiscais table (note: column is 'numero' not 'numero_nf')
CREATE TABLE notas_fiscais (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR NOT NULL,
  serie VARCHAR,
  chave_acesso VARCHAR,
  data_emissao TIMESTAMP,
  valor_total DECIMAL,
  peso_total DECIMAL,
  volume_total DECIMAL,
  remetente_id VARCHAR,
  destinatario_id VARCHAR,
  transportador_id VARCHAR,
  empresa_id VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pendente',
  xml_content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create volumes_etiqueta table (note: column is 'peso' not 'peso_kg')
CREATE TABLE volumes_etiqueta (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_etiqueta VARCHAR UNIQUE NOT NULL,
  nota_fiscal_id VARCHAR NOT NULL,
  peso DECIMAL,
  dimensoes VARCHAR,
  status VARCHAR DEFAULT 'ativo',
  posicao_armazenagem VARCHAR,
  empresa_id VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create itens_carga table
CREATE TABLE itens_carga (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_carga_id VARCHAR NOT NULL,
  nota_fiscal_id VARCHAR,
  descricao TEXT,
  quantidade INTEGER,
  peso DECIMAL,
  volume DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create enderecamento_caminhao table
CREATE TABLE enderecamento_caminhao (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_carga_id VARCHAR NOT NULL,
  etiqueta_id VARCHAR NOT NULL,
  posicao VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE ordens_carga ADD CONSTRAINT fk_ordens_empresa_cliente 
  FOREIGN KEY (empresa_cliente_id) REFERENCES empresas(id);

ALTER TABLE notas_fiscais ADD CONSTRAINT fk_notas_empresa 
  FOREIGN KEY (empresa_id) REFERENCES empresas(id);

ALTER TABLE volumes_etiqueta ADD CONSTRAINT fk_volumes_nota_fiscal 
  FOREIGN KEY (nota_fiscal_id) REFERENCES notas_fiscais(id);
  
ALTER TABLE volumes_etiqueta ADD CONSTRAINT fk_volumes_empresa 
  FOREIGN KEY (empresa_id) REFERENCES empresas(id);

ALTER TABLE itens_carga ADD CONSTRAINT fk_itens_ordem_carga 
  FOREIGN KEY (ordem_carga_id) REFERENCES ordens_carga(id);
  
ALTER TABLE itens_carga ADD CONSTRAINT fk_itens_nota_fiscal 
  FOREIGN KEY (nota_fiscal_id) REFERENCES notas_fiscais(id);

ALTER TABLE enderecamento_caminhao ADD CONSTRAINT fk_enderecamento_ordem_carga 
  FOREIGN KEY (ordem_carga_id) REFERENCES ordens_carga(id);
  
ALTER TABLE enderecamento_caminhao ADD CONSTRAINT fk_enderecamento_etiqueta 
  FOREIGN KEY (etiqueta_id) REFERENCES volumes_etiqueta(id);

-- Insert sample data with proper relationships
INSERT INTO empresas (id, cnpj, razao_social, nome_fantasia, tipo) VALUES 
  ('empresa-1', '12345678901234', 'TechCorp Transportes LTDA', 'TechCorp', 'cliente'),
  ('empresa-2', '56789012345678', 'LogiSupply S.A.', 'LogiSupply', 'cliente');

INSERT INTO ordens_carga (numero_ordem, tipo_carregamento, empresa_cliente_id, data_prevista, status, usuario_responsavel_id) VALUES 
  ('ORD-2025-001', 'Normal', 'empresa-1', NOW() + INTERVAL '1 day', 'ativa', gen_random_uuid()),
  ('ORD-2025-002', 'Urgente', 'empresa-2', NOW() + INTERVAL '2 days', 'pendente', gen_random_uuid());

INSERT INTO notas_fiscais (numero, empresa_id, valor_total) VALUES 
  ('12345', 'empresa-1', 1250.00),
  ('12346', 'empresa-1', 890.50),
  ('12347', 'empresa-2', 1850.75);

-- Get the nota fiscal IDs for foreign keys
INSERT INTO volumes_etiqueta (codigo_etiqueta, nota_fiscal_id, peso, empresa_id) 
SELECT 'VOL-001-2025', nf.id, 5.2, 'empresa-1' FROM notas_fiscais nf WHERE nf.numero = '12345'
UNION ALL
SELECT 'VOL-002-2025', nf.id, 2.8, 'empresa-1' FROM notas_fiscais nf WHERE nf.numero = '12346'
UNION ALL
SELECT 'VOL-003-2025', nf.id, 1.5, 'empresa-2' FROM notas_fiscais nf WHERE nf.numero = '12347';

-- Link orders to notas fiscais via itens_carga
INSERT INTO itens_carga (ordem_carga_id, nota_fiscal_id, quantidade) 
SELECT oc.id, nf.id, 1 
FROM ordens_carga oc, notas_fiscais nf 
WHERE oc.numero_ordem = 'ORD-2025-001' AND nf.numero IN ('12345', '12346')
UNION ALL
SELECT oc.id, nf.id, 1 
FROM ordens_carga oc, notas_fiscais nf 
WHERE oc.numero_ordem = 'ORD-2025-002' AND nf.numero = '12347';

-- Verify the setup
SELECT 'ordens_carga' as tabela, COUNT(*) as registros FROM ordens_carga
UNION ALL
SELECT 'notas_fiscais' as tabela, COUNT(*) as registros FROM notas_fiscais
UNION ALL
SELECT 'volumes_etiqueta' as tabela, COUNT(*) as registros FROM volumes_etiqueta
UNION ALL
SELECT 'itens_carga' as tabela, COUNT(*) as registros FROM itens_carga
UNION ALL
SELECT 'enderecamento_caminhao' as tabela, COUNT(*) as registros FROM enderecamento_caminhao;