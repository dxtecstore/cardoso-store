-- ============================================================
-- DANTAS MULTIMARCAS — Schema completo do Supabase
-- Execute TUDO no SQL Editor do seu projeto Supabase
-- Dashboard → SQL Editor → New Query → Cole e Execute
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. TABELAS
-- ────────────────────────────────────────────────────────────

-- Produtos
CREATE TABLE IF NOT EXISTS products (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title          TEXT        NOT NULL,
  description    TEXT,
  price          NUMERIC(10,2) NOT NULL,
  price_original NUMERIC(10,2),
  category       TEXT,
  image_url      TEXT,
  active         BOOLEAN     DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name    TEXT        NOT NULL,
  customer_phone   TEXT        NOT NULL,
  customer_address TEXT        NOT NULL,
  products         JSONB       NOT NULL DEFAULT '[]',
  total            NUMERIC(10,2) NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Configurações da loja (key/value)
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 2. ÍNDICES (performance)
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS products_active_idx    ON products (active, created_at DESC);
CREATE INDEX IF NOT EXISTS products_category_idx  ON products (category);
CREATE INDEX IF NOT EXISTS orders_status_idx      ON orders   (status, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_created_idx     ON orders   (created_at DESC);

-- ────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- Habilitar RLS em todas as tabelas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders   ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ── products ──
-- Leitura pública (clientes veem produtos ativos)
CREATE POLICY "products_select_public"
  ON products FOR SELECT
  USING (true);

-- Escrita irrestrita via anon key
-- (Autenticação real do admin é feita por senha no frontend)
CREATE POLICY "products_insert_all"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "products_update_all"
  ON products FOR UPDATE
  USING (true);

CREATE POLICY "products_delete_all"
  ON products FOR DELETE
  USING (true);

-- ── orders ──
CREATE POLICY "orders_insert_public"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "orders_select_all"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "orders_update_all"
  ON orders FOR UPDATE
  USING (true);

CREATE POLICY "orders_delete_all"
  ON orders FOR DELETE
  USING (true);

-- ── settings ──
CREATE POLICY "settings_select_public"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "settings_upsert_all"
  ON settings FOR ALL
  USING (true)
  WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 4. STORAGE BUCKET
-- Execute esta parte separadamente se a primeira der erro
-- ────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dantas-images',
  'dantas-images',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public              = true,
  file_size_limit     = 5242880,
  allowed_mime_types  = ARRAY['image/jpeg','image/png','image/webp','image/gif'];

-- Políticas do Storage
CREATE POLICY "storage_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dantas-images');

CREATE POLICY "storage_insert_all"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'dantas-images');

CREATE POLICY "storage_update_all"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'dantas-images');

CREATE POLICY "storage_delete_all"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'dantas-images');

-- ────────────────────────────────────────────────────────────
-- 5. CONFIGURAÇÕES PADRÃO
-- ────────────────────────────────────────────────────────────

INSERT INTO settings (key, value) VALUES
  ('store_name',   'Dantas Multimarcas'),
  ('logo_url',     ''),
  ('whatsapp',     '5585999999999'),
  ('instagram',    'dantas.multimarcas'),
  ('hero_title',   'Vista Presença.'),
  ('hero_sub',     'Moda premium multimarcas. Elegância em cada detalhe.'),
  ('hero_cta',     'Ver Catálogo'),
  ('banner_url',   ''),
  ('address',      '')
ON CONFLICT (key) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 6. PRODUTO DE EXEMPLO (remova quando tiver seus produtos)
-- ────────────────────────────────────────────────────────────

INSERT INTO products (title, description, price, category, active) VALUES
  ('Camisa Oversized Premium', 'Camisa oversized de alta qualidade, 340g', 129.90, 'Oversized', true),
  ('Polo Signature',           'Polo exclusiva com bordado premium',         149.90, 'Polos Premium', true),
  ('Camiseta Essential',       'Camiseta minimalista para o dia a dia',      99.90,  'Camisetas', true)
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- VERIFICAÇÃO — rode após executar o script acima
-- ────────────────────────────────────────────────────────────
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- SELECT * FROM products;
-- SELECT * FROM settings;
-- SELECT name, public FROM storage.buckets WHERE id = 'dantas-images';
