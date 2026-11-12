# Nexus — contexto do projeto

Sistema pessoal de gestão de vida (orçamento, contracheque, escala de trabalho, games, listas, notas etc.), com **um único usuário** (o dono do projeto). Nasceu de várias planilhas migradas para um app online. Foi criado inteiramente no Google AI Studio e migrado para GitHub + Vercel; **toda a evolução daqui em diante é feita via Claude Code**. O dono é leigo em programação: explique o que mudou em linguagem simples e peça confirmação antes de mudanças grandes.

Idioma: interface e comunicação em **português do Brasil**.

## Stack

- React 19 + TypeScript + Vite 6 + Tailwind CSS 4 (`@tailwindcss/vite`)
- Bibliotecas: `@supabase/supabase-js`, `recharts` (gráficos), `motion` (animações, import `motion/react`), `lucide-react` (ícones)
- Sem roteador: a navegação entre telas é por estado interno no `App.tsx`
- PWA: `public/manifest.json` + `public/sw.js` (cache `nexus-v1.4`)
- Deploy: Vercel, automático a cada push na `main`; branches geram URL de prévia
- Não há backend próprio, nem API routes, nem uso de IA/Gemini

## Comandos

- `npm install` — instala dependências
- `npm run dev` — servidor local em http://localhost:3000
- `npm run build` — build de produção (é o que a Vercel roda)
- `npm run lint` — `tsc --noEmit` (pode apontar erros de tipos antigos; o build do Vite não depende disso)

## Variáveis de ambiente

Só duas, lidas em `src/supabase.ts` via `import.meta.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Regras:
- Se alguma faltar no build, o app mostra a tela "Configuração do Supabase Necessária".
- Mudar variáveis na Vercel só tem efeito após um novo deploy.
- **Nunca** usar prefixo `VITE_` em `service_role`, secret keys, JWT secret ou senha de banco: tudo com `VITE_` vai para o navegador. A anon key é pública por design; a proteção dos dados é o RLS.
- Há uma integração Supabase↔Vercel que criou variáveis extras (`POSTGRES_*`, `SUPABASE_*`, `NEXT_PUBLIC_*`). O app **não** usa nenhuma delas.

## Estrutura

```
index.html
vite.config.ts
public/            ícones, manifest.json, sw.js
src/
  main.tsx
  App.tsx          ~8.700 linhas: estado global, auth, sync, telas e modais
  supabase.ts      cliente Supabase
  types.ts         interfaces de todos os módulos
  data.ts, gamesSeed.ts, pokemonSeed.ts   dados iniciais
  index.css
  components/      uma tela por arquivo (Plan, Contracheque, Historico, ME4,
                   Escala, TheList, Games, Pokopia, Checklists, Notes,
                   TrophiesDashboard, SpotifyModal, TransactionForm, etc.)
```

`GamesScreen.tsx` também é grande (~3.900 linhas).

## Banco de dados (Supabase)

Uma única tabela, `nocturne_data`:

- **uma linha por usuário**, com o estado **inteiro** do app em uma coluna `data` do tipo `jsonb`
- RLS ativado, com políticas por `auth.uid()`
- Realtime ligado na tabela (o app escuta mudanças da própria linha)
- O SQL de criação está embutido em `App.tsx` (tela de configuração do Supabase)

Consequências que importam ao programar:
- Cada salvamento **sobrescreve a linha inteira** (último a salvar vence). Nunca deixar duas versões do app abertas na mesma conta durante testes.
- Para novos campos no estado, fazer mudanças **aditivas e retrocompatíveis**: dados antigos não terão o campo, então sempre tratar `undefined` e usar valor padrão ao carregar.
- Não renomear nem remover campos existentes do estado sem plano de migração dos dados, e sem avisar o dono antes.
- O app também espelha estado em `localStorage` (chaves `nocturne_*`) como cache/fallback. `localStorage` é por domínio.
- Existem funções de **exportar/importar backup** em `App.tsx` (`handleExportBackup`, `handleImportBackup`). A importação sobrescreve os dados da conta ativa. Qualquer mudança no formato de dados deve manter a importação de backups antigos funcionando.

## Autenticação

- Login por **e-mail e senha** (`signInWithPassword`, `signUp`)
- Há código de login com Google (`signInWithOAuth`) que **não é usado**; pode ser removido numa limpeza futura
- O Site URL e as Redirect URLs do Supabase apontam para o domínio da Vercel. Se o domínio mudar (ex.: domínio próprio), atualizar em Authentication → URL Configuration
- A variável `firebaseUser` em `App.tsx` é nome herdado de uma versão antiga; guarda o usuário do Supabase

## Dependências externas

- As imagens da Pokédex são carregadas de `https://raw.githubusercontent.com/armindoneto/pokedex/main/pokedex/...` (repositório separado do dono). Não renomear/mover esse repo sem atualizar `GamesScreen.tsx`.

## Como trabalhar neste projeto

1. **Mudanças pontuais.** `App.tsx` e `GamesScreen.tsx` são enormes: editar só o trecho necessário, sem reescrever, reformatar ou reordenar arquivos inteiros.
2. **Trabalhar em branch** para mudanças não triviais e usar a prévia da Vercel para o dono testar antes de ir para a `main`. A `main` é produção e é o app de uso diário.
3. **Rodar `npm run build`** antes de concluir qualquer mudança e relatar o resultado. Se não for possível rodar, dizer isso claramente.
4. **Não afirmar sem verificar.** Diagnosticar lendo o código, logs ou mensagens de erro reais; se algo não puder ser verificado, dizer.
5. **Dados reais do dono estão em produção.** Nunca executar nada que apague/sobrescreva dados, e lembrar o dono de exportar um backup antes de mudanças que afetem o formato dos dados.
6. **PWA/service worker:** `public/sw.js` usa `CACHE_NAME = 'nexus-v1.4'`. Se alterar a lista de arquivos em cache ou o comportamento do cache, considerar incrementar a versão; testar com recarga forçada/aba anônima.
7. **Segredos:** nunca commitar `.env*` (exceto `.env.example`) nem colar chaves em código.

## Melhorias futuras já mapeadas (só com autorização)

- Dividir `App.tsx` em módulos menores, aos poucos, sem mudar comportamento
- Remover o código morto do login com Google e renomear `firebaseUser`
- Gerar e versionar o `package-lock.json`
- Revisar o RLS e as políticas da tabela
- Domínio próprio na Vercel
