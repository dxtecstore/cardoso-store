-- Cardoso Store - Supabase schema
-- Run this in the Supabase SQL Editor after creating the admin user in Auth.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  price_original NUMERIC(10,2),
  category TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  products JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

CREATE INDEX IF NOT EXISTS products_active_idx ON products (active, created_at DESC);
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_public" ON products;
DROP POLICY IF EXISTS "products_insert_all" ON products;
DROP POLICY IF EXISTS "products_update_all" ON products;
DROP POLICY IF EXISTS "products_delete_all" ON products;
DROP POLICY IF EXISTS "products_insert_admin" ON products;
DROP POLICY IF EXISTS "products_update_admin" ON products;
DROP POLICY IF EXISTS "products_delete_admin" ON products;

CREATE POLICY "products_select_public"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "products_insert_admin"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "products_update_admin"
  ON products FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "products_delete_admin"
  ON products FOR DELETE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "orders_insert_public" ON orders;
DROP POLICY IF EXISTS "orders_select_all" ON orders;
DROP POLICY IF EXISTS "orders_update_all" ON orders;
DROP POLICY IF EXISTS "orders_delete_all" ON orders;
DROP POLICY IF EXISTS "orders_select_admin" ON orders;
DROP POLICY IF EXISTS "orders_update_admin" ON orders;
DROP POLICY IF EXISTS "orders_delete_admin" ON orders;

CREATE POLICY "orders_insert_public"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "orders_select_admin"
  ON orders FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "orders_update_admin"
  ON orders FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "orders_delete_admin"
  ON orders FOR DELETE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "settings_select_public" ON settings;
DROP POLICY IF EXISTS "settings_upsert_all" ON settings;
DROP POLICY IF EXISTS "settings_write_admin" ON settings;

CREATE POLICY "settings_select_public"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "settings_write_admin"
  ON settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_users_select_self" ON admin_users;

CREATE POLICY "admin_users_select_self"
  ON admin_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cardoso-images',
  'cardoso-images',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif'];

DROP POLICY IF EXISTS "storage_select_public" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_all" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_all" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_all" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_admin" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_admin" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_admin" ON storage.objects;

CREATE POLICY "storage_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cardoso-images');

CREATE POLICY "storage_insert_admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cardoso-images' AND public.is_admin());

CREATE POLICY "storage_update_admin"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'cardoso-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'cardoso-images' AND public.is_admin());

CREATE POLICY "storage_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'cardoso-images' AND public.is_admin());

INSERT INTO settings (key, value) VALUES
  ('store_name', 'Cardoso Store'),
  ('logo_url', ''),
  ('whatsapp', '5585999999999'),
  ('instagram', 'cardoso.store'),
  ('hero_title', 'Vista Presenca.'),
  ('hero_sub', 'Moda premium multimarcas. Elegancia em cada detalhe.'),
  ('hero_cta', 'Ver Catalogo'),
  ('banner_url', ''),
  ('address', ''),
  ('accent_color', '#c9a84c')
ON CONFLICT (key) DO NOTHING;

-- After creating an admin in Supabase Auth, run:
-- INSERT INTO public.admin_users (user_id)
-- VALUES ('AUTH_USER_UUID_AQUI')
-- ON CONFLICT DO NOTHING;
