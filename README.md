# File Uploader

Monorepo fullstack com:

- `apps/backend`: API NestJS + Prisma + PostgreSQL + upload para MinIO/S3
- `apps/frontend`: React + Vite + Tailwind + Vitest
- `docker-compose.yml`: frontend, backend, PostgreSQL e MinIO

## Requisitos

- Docker e Docker Compose
- Node.js 22+
- npm 10+

## Subindo com Docker

```bash
docker compose up --build
```

Serviços:

- Frontend: `http://localhost:4173`
- Backend: `http://localhost:3000/api`
- MinIO Console: `http://localhost:9001`

### Login padrão

- Email: `admin@example.com`
- Senha: `supersecret`

## Desenvolvimento local

Instale as dependências:

```bash
npm install
```

Copie as variáveis:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Rode as migrations do Prisma:

```bash
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
```

Inicie os apps:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

## Testes

```bash
npm run test --workspace frontend
npm run test --workspace backend
```

## Fluxo autenticado

- `POST /api/auth/login`: autentica com email e senha e retorna o token
- `GET /api/files`: rota protegida por bearer token
- `POST /api/files`: rota protegida por bearer token
