-- Cardoso Store - preço de atacado por produto
-- Execute no SQL Editor do Supabase antes de salvar produtos com preço de atacado.

ALTER TABLE products
ADD COLUMN IF NOT EXISTS price_wholesale NUMERIC(10,2);
