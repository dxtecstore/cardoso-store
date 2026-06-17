-- Cardoso Store - tamanhos disponíveis por produto
-- Execute no SQL Editor do Supabase antes de salvar produtos com tamanhos personalizados.

ALTER TABLE products
ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '[]'::jsonb;
