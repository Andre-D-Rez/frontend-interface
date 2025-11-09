# Frontend Interface - Series App

Aplicação frontend em React + Vite para cadastro, login e área protegida (CRUD de séries) usando JWT.

Pré-requisitos
- Node.js 18+ e npm
- Backend(s) já disponíveis (endpoints descritos abaixo)

Instalação e uso (local)

1. Copie `.env.example` para `.env` e configure `VITE_API_BASE` apontando para o backend desejado.

```bash
cp .env.example .env
# edite .env: VITE_API_BASE=http://localhost:3000
```

2. Instale dependências:

```bash
npm install
```

3. Rode em desenvolvimento (Vite):

```bash
npm run dev -- --host
```

Abra no navegador: http://localhost:5173/

API (endpoints esperados)
- POST /register  -> body: { nome, email, senha }
- POST /login     -> body: { email, senha }  => retorna { token }
- GET /me         -> headers Authorization: Bearer <token> => retorna { nome, email }
- Series (protegido por token):
  - GET /series
  - POST /series
  - PUT /series/:id
  - PATCH /series/:id
  - DELETE /series/:id

Persistência do token
- O token JWT é armazenado em localStorage sob a chave `token`.
- O `AuthContext` faz check em `/me` ao iniciar e ao alterar o token; se o backend retornar erro (token inválido/expirado) o usuário será deslogado automaticamente e redirecionado para `/login`.

Deploy no Vercel (resumo)
- Você deve criar duas implantações do mesmo repositório no Vercel (cada uma com um subdomínio diferente).
- Para cada implantação, defina a variável de ambiente `VITE_API_BASE` apontando para o backend correspondente (um para o backend com MongoDB, outro para o backend com PostgreSQL).

Testando expiração de token
- O jeito mais confiável é configurar o backend para emitir tokens com validade curta (por exemplo, 10s) e observar que o frontend remove o token e navega para `/login` quando uma chamada a `/me` falhar.
- Alternativa manual: remover `localStorage.token` no Console do navegador.

O que eu implementei aqui
- Cadastro (Register), Login e Dashboard (área protegida) com CRUD básico de séries.
- Contexto de autenticação (`src/context/AuthContext.tsx`) e serviços (`src/services/*`).
- Toaster (`react-toastify`) para feedbacks.

Próximos passos úteis
- Configurar deploy no Vercel (veja `DEPLOY_VERCEL.md` com passos detalhados).
- Melhorar validações, layout e testes (opcional — incluídos neste repositório como sugestões).
# frontend-interface