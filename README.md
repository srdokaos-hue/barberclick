# BarberClick SaaS

Plataforma completa de gestão para barbearias — Next.js 14, PostgreSQL, Redis, BullMQ.

## Início rápido

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Edite .env com suas credenciais
```

### 3. Banco de dados
```bash
# Subir PostgreSQL e Redis com Docker
docker run -d --name pg  -e POSTGRES_PASSWORD=senha123 -e POSTGRES_DB=barberclick -p 5432:5432 postgres:16
docker run -d --name red -p 6379:6379 redis:7

# Aplicar schema e popular dados demo
npm run db:migrate
npm run db:seed
```

### 4. Iniciar aplicação
```bash
# Terminal 1: Next.js
npm run dev

# Terminal 2: Worker de lembretes (opcional)
npm run worker
```

Abra http://localhost:3000

---

## Credenciais demo

| Papel        | Email                 | Senha    |
|--------------|-----------------------|----------|
| Admin (dono) | erickson@demo.com     | senha123 |
| Barbeiro 1   | henrique@demo.com     | senha123 |
| Barbeiro 2   | igor@demo.com         | senha123 |

**Página pública:** http://localhost:3000/barbearia-demo

---

## Estrutura do projeto

```
barberclick/
├── prisma/
│   ├── schema.prisma      # Schema multi-tenant completo
│   └── seed.ts            # Dados de demonstração
├── src/
│   ├── app/
│   │   ├── (auth)/        # Login e cadastro SaaS
│   │   ├── (admin)/       # Painel do barbeiro (8 módulos)
│   │   ├── [slug]/        # Página pública de agendamento
│   │   └── api/           # 12 rotas de API REST
│   ├── components/
│   │   ├── admin/         # Dashboard, Equipe, Estoque, etc.
│   │   └── booking/       # Fluxo de agendamento do cliente
│   ├── lib/
│   │   ├── prisma.ts      # Cliente Prisma singleton
│   │   ├── auth.ts        # NextAuth com credentials
│   │   └── utils.ts       # BRL, slugify, generateSlots…
│   ├── workers/
│   │   └── reminders.worker.ts  # BullMQ — WhatsApp
│   └── middleware.ts      # Proteção de rotas
├── .env.example
└── package.json
```

---

## Módulos implementados

| Módulo             | Rota admin           | API                         |
|--------------------|----------------------|-----------------------------|
| Dashboard financeiro | `/dashboard`        | `GET /api/financial`        |
| Agendamentos       | `/agendamentos`      | `GET/POST /api/appointments`|
| Controle de estoque| `/produtos`          | `GET/POST /api/products`    |
| CRM de clientes    | `/clientes`          | `GET /api/clients`          |
| Gestão da equipe   | `/equipe`            | `GET/POST /api/barbers`     |
| Relatórios         | `/relatorios`        | `GET /api/financial`        |
| Configurações      | `/configuracoes`     | `GET/PATCH /api/settings`   |
| Assinatura         | `/assinatura`        | — (Stripe webhooks)         |
| **Agendamento público** | `/{slug}`       | `GET /api/slots` + `POST /api/appointments` |

---

## Variáveis de ambiente obrigatórias

| Variável           | Descrição                          |
|--------------------|------------------------------------|
| `DATABASE_URL`     | Connection string PostgreSQL       |
| `REDIS_HOST`       | Host do Redis                      |
| `NEXTAUTH_SECRET`  | Gere com `openssl rand -base64 32` |
| `ZAPI_INSTANCE`    | Instância Z-API (WhatsApp)         |
| `ZAPI_TOKEN`       | Token da instância Z-API           |

---

## Deploy recomendado

- **App Next.js**: [Vercel](https://vercel.com) ou [Railway](https://railway.app)
- **PostgreSQL**: [Neon](https://neon.tech) (serverless, free tier) ou Railway
- **Redis**: [Upstash](https://upstash.com) (serverless, free tier)
- **Worker BullMQ**: Railway como processo separado

```bash
# Build de produção
npm run build
npm start
```

---

## Integrações externas

- **Z-API / Evolution API**: WhatsApp para lembretes automáticos
- **Stripe**: Pagamentos com cartão e assinaturas SaaS
- **PIX (InfinitePay)**: QR Code de pagamento no checkout
- **AWS S3 / Cloudflare R2**: Upload de fotos da barbearia

---

## Tecnologias

Next.js 14 · TypeScript · Prisma ORM · PostgreSQL 16 · Redis · BullMQ · NextAuth.js · Zod · Recharts · Tailwind CSS · Lucide · React Query
