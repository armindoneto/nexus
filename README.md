# Nexus

Sistema pessoal de gestão (orçamento, contracheque, escala, games e outros módulos).

**Stack:** React 19, TypeScript, Vite, Tailwind 4, Supabase (auth + banco).

## Rodar localmente

1. `npm install`
2. Copie `.env.example` para `.env.local` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. `npm run dev` (abre em http://localhost:3000)

## Deploy

Publicado na Vercel a partir da branch `main`. Variáveis de ambiente necessárias na Vercel:
`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

## Banco de dados

Uma tabela, `nocturne_data` (uma linha por usuário, estado inteiro em `data jsonb`), com RLS por `auth.uid()`.
O SQL de criação aparece na tela de configuração do app quando o Supabase não está configurado.
