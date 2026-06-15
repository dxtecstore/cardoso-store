-- Cardoso Store - novos módulos administrativos
-- Execute este arquivo no SQL Editor do Supabase.
-- Ele cria apenas as novas tabelas de Financeiro/Estoque e corrige a política
-- necessária para clientes conseguirem registrar pedidos no checkout.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS despesas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS estoque (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  available_qty INTEGER DEFAULT 0,
  unit_cost NUMERIC(12,2) DEFAULT 0,
  alert_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (product_id)
);

CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
  qty INTEGER NOT NULL CHECK (qty > 0),
  cost NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS despesas_date_idx ON despesas (date DESC);
CREATE INDEX IF NOT EXISTS investimentos_date_idx ON investimentos (date DESC);
CREATE INDEX IF NOT EXISTS estoque_product_idx ON estoque (product_id);
CREATE INDEX IF NOT EXISTS movimentacoes_estoque_created_idx ON movimentacoes_estoque (created_at DESC);

ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE investimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "despesas_admin_select" ON despesas;
DROP POLICY IF EXISTS "despesas_admin_all" ON despesas;
CREATE POLICY "despesas_admin_select" ON despesas FOR SELECT TO authenticated USING (true);
CREATE POLICY "despesas_admin_all" ON despesas FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "investimentos_admin_select" ON investimentos;
DROP POLICY IF EXISTS "investimentos_admin_all" ON investimentos;
CREATE POLICY "investimentos_admin_select" ON investimentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "investimentos_admin_all" ON investimentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "estoque_admin_select" ON estoque;
DROP POLICY IF EXISTS "estoque_admin_all" ON estoque;
CREATE POLICY "estoque_admin_select" ON estoque FOR SELECT TO authenticated USING (true);
CREATE POLICY "estoque_admin_all" ON estoque FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "movimentacoes_estoque_admin_select" ON movimentacoes_estoque;
DROP POLICY IF EXISTS "movimentacoes_estoque_admin_all" ON movimentacoes_estoque;
CREATE POLICY "movimentacoes_estoque_admin_select" ON movimentacoes_estoque FOR SELECT TO authenticated USING (true);
CREATE POLICY "movimentacoes_estoque_admin_all" ON movimentacoes_estoque FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Correção necessária para o checkout: permite que visitantes registrem pedidos.
DROP POLICY IF EXISTS "orders_insert_public" ON orders;
CREATE POLICY "orders_insert_public"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
