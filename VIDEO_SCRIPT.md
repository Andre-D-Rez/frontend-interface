# Roteiro de vídeo (até 3 minutos) — evidência do projeto

Duração sugerida: 2:00 — 3:00 minutos. Mostre a sua tela e seu rosto simultaneamente durante toda a gravação.

Sequência (cronológica):

0:00–0:10 — Introdução rápida
- Apresente-se rapidamente (nome) e diga que irá demonstrar: cadastro, login, área logada com CRUD e logout.

0:10–0:45 — Cadastro
- Mostre o formulário de cadastro.
- Preencha nome, email, senha e clique em "Criar conta".
- Mostre o toast de sucesso (ou erro, se houver).

0:45–1:10 — Login
- Vá para a tela de login, preencha email e senha, clique em entrar.
- Mostre o toast de sucesso e o redirecionamento para `/dashboard`.

1:10–1:50 — Área logada (CRUD de séries)
- No dashboard, crie uma nova série (preencha título, nota, temporadas, episódios).
- Mostre a lista atualizada com a nova série.
- Edite / marque como concluído (p.ex. botão "Marcar concluído").
- Delete uma série e mostre o toast de sucesso.

1:50–2:10 — Teste de expiração de token / logout
- Mostre o processo de expiração do token (se possível):
  - Se o backend tiver token curto, mostre a remoção automática e o redirecionamento para login.
  - Alternativamente, abra DevTools e remova o item `localStorage.token` para simular expiração. Mostre que o app pede login.

2:10–2:30 — Encerramento
- Mostre os dois domínios do Vercel (se já configurados) e diga onde o avaliador pode acessar.
- Finalize agradecendo.

Dicas de gravação
- Use modo "mostrar câmera" + tela (Climpchamp, OBS, ou app de gravação que preferir).
- Fale enquanto executa as ações (sem necessidade de edição posterior).
- Mantenha um ritmo constante e foque no fluxo: registro -> login -> CRUD -> logout.
