# Deploy no Vercel — passo a passo (duas implantações)

Este documento explica como criar duas implantações do mesmo repositório no Vercel, cada uma apontando para um backend diferente (um usa MongoDB, outro usa PostgreSQL). Cada implantação terá seu próprio subdomínio.

1) Pré-requisitos
- Conta Vercel (https://vercel.com)
- Acesso ao repositório GitHub (ou GitLab)
- URLs dos backends já implantados (ex.: https://api-mongo.example.com e https://api-postgres.example.com)

2) Importar repositório para o Vercel
- No Vercel, clique em "New Project" → "Import Git Repository" → escolha o repositório `frontend-interface`.

3) Criar primeira implantação (backend MongoDB)
- Nome de projeto sugerido: `frontend-series-mongo`.
- Nas configurações do projeto (Environment Variables), adicione:
  - Key: `VITE_API_BASE`
  - Value: `https://api-mongo.example.com` (substitua pela URL real do backend MongoDB)
- Deploy.

4) Criar segunda implantação (backend PostgreSQL)
- Repita a importação (pode usar "New Project" e apontar para o mesmo repositório).
- Nome de projeto sugerido: `frontend-series-postgres`.
- Nas variáveis de ambiente, adicione `VITE_API_BASE` apontando para `https://api-postgres.example.com`.
- Deploy.

5) Configurar domínios/subdomínios (opcional)
- Você pode usar domínios personalizados em cada projeto Vercel. Ex:
  - `series-mongo.seudominio.com` -> apontar para `frontend-series-mongo`
  - `series-postgres.seudominio.com` -> apontar para `frontend-series-postgres`

6) Notas importantes
- As variáveis de ambiente configuradas no Vercel substituem o `import.meta.env.VITE_API_BASE` em tempo de build.
- Se seu backend exigir outras variáveis (ex.: URL do banco para server-side), configure-as no painel do Vercel também.

7) Testes pós-deploy
- Acesse cada subdomínio e verifique o fluxo: registro, login, CRUD de séries. Use o DevTools -> Network para checar requests e headers (Authorization: Bearer ...).
