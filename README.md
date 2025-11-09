# Frontend Interface - Series App

## Links utilizados
MongoDB
- Frontend: https://myserieslist-mongo.andredrez.tech
- Backend: https://backend-express.andredrez.tech/

PostgreSQL
- Frontend: https://myserieslist-postgre.andredrez.tech
- Backend: https://backend-express-postgre.andredrez.tech/
 
## Como utilizar

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

Testando expiração de token
- O jeito mais confiável é configurar o backend para emitir tokens com validade curta (por exemplo, 10s) e observar que o frontend remove o token e navega para `/login` quando uma chamada a `/me` falhar.
- Alternativa manual: remover `localStorage.token` no Console do navegador.

O que eu implementei aqui
- Cadastro (Register), Login e Dashboard (área protegida) com CRUD básico de séries.
- Contexto de autenticação (`src/context/AuthContext.tsx`) e serviços (`src/services/*`).
- Toaster (`react-toastify`) para feedbacks.

