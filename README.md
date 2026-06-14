# Cardoso Store — Guia Completo de Instalação

Loja de roupas com painel administrativo conectado ao Supabase.  
Funciona 100% pelo celular: adicione produtos, edite preços e gerencie pedidos direto do smartphone.

---

## ✅ Checklist Rápido

- [ ] Criar projeto no Supabase
- [ ] Executar SQL (schema.sql)
- [ ] Configurar Storage
- [ ] Criar arquivo `.env`
- [ ] Rodar localmente
- [ ] Publicar no Netlify ou Vercel

---

## 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **New Project**
3. Escolha sua organização
4. Preencha:
   - **Name**: `cardoso-store`
   - **Database Password**: anote essa senha
   - **Region**: `South America (São Paulo)` — mais rápido para o Brasil
5. Clique em **Create new project** e aguarde ~2 minutos

---

## 2. Executar o SQL (cria tabelas + políticas + storage)

1. No painel do Supabase, clique em **SQL Editor** (menu lateral)
2. Clique em **New Query**
3. Abra o arquivo `supabase/schema.sql` deste projeto
4. Copie todo o conteúdo e cole no editor
5. Clique em **Run** (ou Ctrl+Enter)
6. Deve aparecer "Success" para cada comando

> ⚠️ Se aparecer erro na parte do Storage, execute separadamente o bloco  
> `INSERT INTO storage.buckets...` e as policies abaixo dele.

**Verificar se funcionou:**
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```
Deve listar: `products`, `orders`, `settings`

---

## 3. Configurar o Storage (bucket de imagens)

O script SQL já cria o bucket automaticamente. Para confirmar:

1. No Supabase, vá em **Storage** (menu lateral)
2. Deve aparecer o bucket `cardoso-images`
3. Clique nele e confirme que está marcado como **Public**

Se o bucket não foi criado pelo SQL:
1. Clique em **New Bucket**
2. Nome: `cardoso-images`
3. Marque **Public bucket** ✓
4. File size limit: `5MB`
5. Allowed MIME types: `image/jpeg, image/png, image/webp`
6. Clique em **Save**

Depois vá em **Policies** do bucket e adicione:
- SELECT: `true` (leitura pública)
- INSERT: `true` (upload permitido)
- UPDATE: `true`
- DELETE: `true`

---

## 4. Pegar as credenciais do Supabase

1. No Supabase, vá em **Settings → API** (menu lateral)
2. Copie os valores:
   - **Project URL** → é o `VITE_SUPABASE_URL`
   - **anon / public** key → é o `VITE_SUPABASE_ANON_KEY`

---

## 5. Configurar o arquivo .env

Na raiz do projeto, crie o arquivo `.env` (copie do `.env.example`):

```bash
cp .env.example .env
```

Abra `.env` e preencha:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

VITE_SUPABASE_STORAGE_BUCKET=cardoso-images
VITE_WHATSAPP_NUMBER=5585999999999
```

> O painel admin usa Supabase Auth. Crie o usuario em Authentication > Users e adicione o id dele em `admin_users`.
> Troque `5585999999999` pelo seu número real (55 + DDD + número, sem espaços).

---

## 6. Rodar localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000)

- Loja: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

---

## 7. Publicar no Netlify

### Opção A — Interface web (mais fácil)

1. Faça build do projeto:
   ```bash
   npm run build
   ```
2. Acesse [netlify.com](https://netlify.com) e faça login
3. Arraste a pasta `dist/` para a área de deploy
4. Após o deploy, vá em **Site settings → Environment variables**
5. Adicione as mesmas variáveis do seu `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_STORAGE_BUCKET`
   - `VITE_WHATSAPP_NUMBER`
6. Vá em **Deploys → Trigger deploy** para aplicar as variáveis

### Opção B — GitHub (deploy automático)

1. Suba o projeto para o GitHub
2. No Netlify: **Add new site → Import an existing project**
3. Conecte seu repositório
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Adicione as variáveis de ambiente
6. Clique em **Deploy site**

### Arquivo netlify.toml (já incluso)

O arquivo `netlify.toml` na raiz garante que as rotas do React funcionem corretamente.

---

## 8. Publicar no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **Add New → Project**
3. Importe seu repositório GitHub
4. Vercel detecta automaticamente que é Vite
5. Clique em **Environment Variables** e adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_STORAGE_BUCKET`
   - `VITE_WHATSAPP_NUMBER`
6. Clique em **Deploy**

---

## 9. Primeiros passos após publicar

1. Acesse `seusite.com/admin`
2. Entre com o e-mail e senha do usuario criado no Supabase Auth
3. Vá em **Configurações** e preencha:
   - Nome da loja
   - Logo (faça upload)
   - WhatsApp
   - Instagram
   - Texto do Hero
4. Vá em **Produtos** e adicione suas peças
5. Acesse a loja e confira tudo funcionando

---

## 10. Acessar pelo celular

Para gerenciar a loja pelo celular:

1. Acesse `seusite.com/admin` no navegador do celular
2. No iPhone: Safari → Compartilhar → "Adicionar à Tela de Início"
3. No Android: Chrome → Menu ⋮ → "Adicionar à tela inicial"

Todas as funções funcionam no celular:
- ✅ Adicionar/editar/excluir produtos
- ✅ Upload de foto direto da câmera ou galeria
- ✅ Alterar logo, WhatsApp, Instagram
- ✅ Visualizar e atualizar pedidos

---

## Estrutura do Projeto

```
cardoso-store/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminSidebar.jsx      # Menu lateral admin (responsivo)
│   │   │   ├── DashboardPage.jsx     # Visão geral com estatísticas
│   │   │   ├── ProductsPage.jsx      # CRUD de produtos
│   │   │   ├── OrdersPage.jsx        # Gerenciar pedidos
│   │   │   ├── SettingsPage.jsx      # Configurações da loja
│   │   │   └── ProtectedAdmin.jsx    # Proteção de rota
│   │   ├── client/
│   │   │   ├── Navbar.jsx            # Navegação com logo dinâmica
│   │   │   ├── Hero.jsx              # Seção principal dinâmica
│   │   │   ├── Marquee.jsx           # Faixa animada
│   │   │   ├── Catalog.jsx           # Grade de produtos do Supabase
│   │   │   ├── ProductCard.jsx       # Card de produto
│   │   │   ├── CartDrawer.jsx        # Carrinho lateral + checkout
│   │   │   ├── About.jsx             # Seção sobre
│   │   │   └── Footer.jsx            # Rodapé dinâmico
│   │   └── shared/
│   │       └── ImageUpload.jsx       # Upload mobile-friendly
│   ├── context/
│   │   ├── CartContext.jsx           # Estado do carrinho
│   │   ├── AdminContext.jsx          # Autenticação admin
│   │   └── SettingsContext.jsx       # Configurações da loja
│   ├── hooks/
│   │   └── useProducts.js            # Hook para carregar produtos
│   ├── lib/
│   │   ├── supabase.js               # Cliente Supabase
│   │   ├── storage.js                # Upload de imagens
│   │   ├── products.js               # API de produtos
│   │   ├── orders.js                 # API de pedidos
│   │   └── settings.js               # API de configurações
│   ├── pages/
│   │   ├── client/Home.jsx           # Página da loja
│   │   └── admin/
│   │       ├── AdminLogin.jsx        # Login admin
│   │       └── AdminDashboard.jsx    # Layout admin com rotas
│   └── styles/global.css             # Estilos globais Tailwind
├── supabase/schema.sql               # SQL completo para rodar no Supabase
├── .env.example                      # Modelo das variáveis de ambiente
├── netlify.toml                      # Config para Netlify
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Banco de dados — Tabelas

### `products`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| title | TEXT | Nome do produto |
| description | TEXT | Descrição |
| price | NUMERIC | Preço atual |
| price_original | NUMERIC | Preço original (opcional, mostra desconto) |
| category | TEXT | Categoria (ex: Oversized) |
| image_url | TEXT | URL da imagem no Storage |
| active | BOOLEAN | Visível na loja? |
| created_at | TIMESTAMPTZ | Data de criação |

### `orders`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| customer_name | TEXT | Nome do cliente |
| customer_phone | TEXT | Telefone |
| customer_address | TEXT | Endereço de entrega |
| products | JSONB | Array de itens do pedido |
| total | NUMERIC | Valor total |
| status | TEXT | pending/confirmed/shipped/delivered/cancelled |
| created_at | TIMESTAMPTZ | Data do pedido |

### `settings`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| key | TEXT | Chave da configuração |
| value | TEXT | Valor |

Chaves disponíveis: `store_name`, `logo_url`, `whatsapp`, `instagram`, `hero_title`, `hero_sub`, `hero_cta`, `banner_url`, `address`

---

## Problemas comuns

**"Erro ao carregar produtos"**
→ Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretos no `.env`  
→ Confirme que o SQL foi executado com sucesso  
→ Verifique as políticas RLS no Supabase (Authentication → Policies)

**Upload de imagem falha**
→ Confirme que o bucket `cardoso-images` existe e é público  
→ Verifique as políticas do Storage (INSERT deve ser permitido)

**Página em branco após deploy**
→ Adicione as variáveis de ambiente no Netlify/Vercel  
→ Confirme que o `netlify.toml` está na raiz do projeto

**Admin não salva alterações**
→ Verifique as políticas RLS (todas as tabelas devem ter INSERT/UPDATE permitido)

---

## Suporte

- Documentação Supabase: [supabase.com/docs](https://supabase.com/docs)
- Documentação Vite: [vitejs.dev](https://vitejs.dev)
- Documentação Netlify: [docs.netlify.com](https://docs.netlify.com)
