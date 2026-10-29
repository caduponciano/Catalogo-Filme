# Catálogo de Filmes em Streaming — Design

**Data:** 2026-10-28
**Status:** aguardando revisão

## 1. Objetivo

Construir um site que mostra os filmes disponíveis **agora** nos serviços de streaming do Brasil, usando a API do TMDB.

O projeto tem dois propósitos:

1. **Aprendizado e portfólio.** É o primeiro aplicativo completo do autor, que conhece o básico de Python e está aprendendo desenvolvimento web.
2. **Material de estudo.** Cada etapa do desenvolvimento gera um capítulo explicando, em linguagem simples, o que foi feito e por quê.

### Critérios de sucesso

- O site roda localmente com `npm run dev` e oferece as cinco funcionalidades da seção 3.
- `npm test` passa, sem chamar o TMDB de verdade.
- O site está publicado na Vercel, com um link público.
- Os capítulos 00 a 11 do material de estudo existem em `docs/estudo/` e correspondem ao código final.

## 2. Escopo

### Versão 1 (este documento)

- Catálogo de filmes disponíveis por assinatura no Brasil.
- Filtro por streaming.
- Filtro por gênero.
- Ordenação (popularidade, nota, lançamento).
- Busca por nome.
- Página de detalhes do filme.
- Material de estudo.

### Versão 2 (fora deste documento — terá sua própria especificação)

- Login de usuários (Auth.js) e banco de dados.
- Recursos dependentes de login: favoritos, listas pessoais.

### Fora do escopo

- Séries de TV.
- TypeScript (o projeto usa JavaScript).
- Outros idiomas e regiões além de português/Brasil.
- Opções de aluguel e compra (somente assinatura; ver seção 4.3).

## 3. Funcionalidades

### 3.1 Catálogo — `/`

- Grade de cartões (pôster, título, ano, nota), 20 filmes por página.
- Sem filtros, mostra os filmes disponíveis por assinatura em **qualquer** um dos streamings da lista de filtros (combinação "OU").
- Filtros no topo, enviados por um formulário HTML com método GET:

| Parâmetro na URL | Valores | Padrão |
|---|---|---|
| `streaming` | ID de provedor do TMDB | todos os da lista |
| `genero` | ID de gênero do TMDB | nenhum |
| `ordem` | `popularidade`, `nota`, `lancamento` | `popularidade` |
| `pagina` | inteiro de 1 a 500 | 1 |

- Paginação com botões "anterior" e "próxima", preservando os demais filtros.
- Clicar em um cartão abre `/filme/[id]`.

### 3.2 Busca — `/busca?q=...&pagina=...`

- Caixa de busca no cabeçalho, presente em todas as páginas.
- Resultados na mesma grade de cartões, com paginação.
- A busca mostra **todos** os resultados do TMDB, estejam ou não em streaming. A disponibilidade é informada na página do filme. (Decisão tomada porque a busca do TMDB não aceita filtro por provedor.)
- `q` vazio ou ausente: mostra a mensagem "Digite o nome de um filme para buscar".

### 3.3 Página do filme — `/filme/[id]`

- Pôster, título, ano, duração (formato `2h 16min`), gêneros, nota e sinopse.
- Elenco principal: até 10 pessoas, com foto, nome e personagem.
- Trailer do YouTube incorporado: prioriza vídeo do tipo `Trailer` em português; se não houver, em inglês; se não houver nenhum, a seção não aparece.
- **Onde assistir no Brasil:** logotipos dos **principais streamings** (os mesmos 12 da lista de filtros, ver seção 4.4) em que o filme está disponível por assinatura, mais um link para a página completa de opções (link fornecido pelo TMDB/JustWatch).
- Se o filme não estiver em nenhum desses streamings: "Este filme não está disponível em nenhum streaming no Brasil no momento."
- Todos os dados vêm de **uma única chamada** ao TMDB (`append_to_response`).

## 4. Arquitetura

### 4.1 Tecnologias

- **Next.js** (App Router), na versão estável atual instalada pelo `create-next-app`.
- **JavaScript** e **CSS Modules**.
- **Vitest** + **React Testing Library** para testes.
- **Vercel** para publicação.
- Node.js 24 e npm 11 (já instalados na máquina).

### 4.2 Fluxo de uma requisição

```
Navegador ──pede /?streaming=8&genero=28──▶ Next.js (servidor)
                                               │
                                               ▼
                                   lib/tmdb.js ──▶ API do TMDB
                                               │
                                               ▼
Navegador ◀──── página pronta ──────── componentes React
```

As páginas são **Server Components**: os dados são buscados no servidor, e a chave da API nunca chega ao navegador.

### 4.3 Estrutura de arquivos

Arquivos que contêm JSX (páginas, layout e componentes) usam a extensão `.jsx` — por exemplo, `app/page.jsx`. Assim o Vitest os entende sem configuração extra. A tabela abaixo cita `.js` por brevidade.

| Arquivo | Responsabilidade |
|---|---|
| `lib/tmdb.js` | Único módulo que conversa com o TMDB. Exporta `listarFilmes(filtros)`, `buscarFilmes(termo, pagina)`, `detalhesFilme(id)`, `listarStreamings()`, `listarGeneros()`. |
| `lib/filtros.js` | Funções puras: converte os parâmetros da URL em filtros válidos (com valores padrão e limites) e vice-versa. |
| `lib/formatar.js` | Funções puras: formatar duração, extrair ano, escolher trailer, montar URL de imagem. |
| `app/layout.js` | Cabeçalho (com busca), rodapé (com créditos ao TMDB e ao JustWatch). |
| `app/page.js` | Catálogo. |
| `app/busca/page.js` | Busca. |
| `app/filme/[id]/page.js` | Página do filme. |
| `app/error.js` | Página de erro com botão "Tentar novamente". |
| `app/not-found.js` | Página "não encontrado". |
| `components/CartaoFilme.js` | Cartão de filme. |
| `components/GradeFilmes.js` | Grade de cartões + mensagem de lista vazia. |
| `components/Filtros.js` | Formulário de filtros. |
| `components/Paginacao.js` | Botões de paginação. |
| `*.module.css` | Estilos de cada componente/página; layout responsivo. |
| `.env.local` | `TMDB_TOKEN` (fora do Git). |
| `.env.example` | Modelo do `.env.local`, sem o valor real (vai para o Git). |
| `tests/` | Testes automatizados. |
| `docs/estudo/` | Material de estudo. |

### 4.4 Integração com o TMDB

- **Autenticação:** cabeçalho `Authorization: Bearer <TMDB_TOKEN>` (Read Access Token da conta TMDB).
- **Parâmetros fixos:** `language=pt-BR`, `watch_region=BR`.
- **Endpoints:**

| Função | Endpoint | Parâmetros principais |
|---|---|---|
| `listarFilmes` | `GET /3/discover/movie` | `with_watch_providers` (IDs separados por `\|`), `with_watch_monetization_types=flatrate`, `with_genres`, `sort_by`, `page` |
| `buscarFilmes` | `GET /3/search/movie` | `query`, `page`, `include_adult=false` |
| `detalhesFilme` | `GET /3/movie/{id}` | `append_to_response=credits,videos,watch/providers`, `include_video_language=pt,en` |
| `listarStreamings` | `GET /3/watch/providers/movie` | — (sem as lojas de aluguel/compra: IDs 2, 3, 10, 68, 192; resultado ordenado por `display_priority`, mantidos os 12 primeiros) |
| `listarGeneros` | `GET /3/genre/movie/list` | — |

- **Ordenação:**

| `ordem` | `sort_by` | Parâmetros extras |
|---|---|---|
| `popularidade` | `popularity.desc` | — |
| `nota` | `vote_average.desc` | `vote_count.gte=200` |
| `lancamento` | `primary_release_date.desc` | `primary_release_date.lte=<data de hoje>` |

- **Imagens:** `https://image.tmdb.org/t/p/<tamanho><caminho>`; domínio liberado em `next.config` para o componente `next/image`.
- **Cache (`fetch` com `revalidate`):** 1 hora para listas, busca e detalhes; 24 horas para gêneros e streamings.
- **Créditos obrigatórios** no rodapé: logotipo do TMDB com o aviso "Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB", e menção ao JustWatch como fonte dos dados de "onde assistir".

## 5. Tratamento de erros

| Situação | Comportamento |
|---|---|
| `TMDB_TOKEN` ausente | `lib/tmdb.js` lança erro com a mensagem "Configure a variável TMDB_TOKEN no arquivo .env.local". |
| TMDB fora do ar, tempo esgotado ou resposta 5xx | `lib/tmdb.js` lança erro; `app/error.js` mostra "Não foi possível carregar os filmes" e o botão "Tentar novamente". |
| Filme inexistente (TMDB responde 404) | `detalhesFilme` retorna `null`; a página chama `notFound()`; `app/not-found.js` mostra "Filme não encontrado" e link para o catálogo. |
| Parâmetros inválidos na URL | `lib/filtros.js` descarta o valor inválido e usa o padrão; `pagina` é limitada ao intervalo 1–500. |
| Pôster ou foto ausente | Imagem genérica local (`public/sem-imagem.svg`). |
| Lista vazia | "Nenhum filme encontrado com esses filtros." |

## 6. Testes

- **Ferramentas:** Vitest e React Testing Library.
- **Regra:** nenhum teste chama o TMDB de verdade; `fetch` é substituído por respostas falsas fixas.
- **Prática:** TDD — cada teste é escrito antes do código que ele verifica.
- **Cobertura:**
  - `lib/tmdb.js`: monta a URL e os parâmetros corretos para cada função e cada ordenação; envia o token no cabeçalho; lança erro sem token; lança erro em 5xx; retorna `null` em 404.
  - `lib/filtros.js`: valores padrão, valores inválidos, limites de página, conversão de volta para URL.
  - `lib/formatar.js`: duração, ano, escolha do trailer (português → inglês → nenhum), URL de imagem com e sem caminho.
  - Componentes: `CartaoFilme` (com e sem pôster), `GradeFilmes` (lista vazia), `Paginacao` (primeira e última página, preservação dos filtros).
- **Verificação manual** no navegador ao final de cada etapa.

## 7. Material de estudo

- **Local:** `docs/estudo/`, um arquivo Markdown por capítulo (`00-visao-geral.md`, `01-ambiente.md`, …).
- **Momento:** cada capítulo é escrito logo após a conclusão da etapa correspondente, refletindo o código real.
- **Público:** o próprio autor; sabe o básico de Python, é iniciante em desenvolvimento web e em JavaScript.
- **Capítulos:**

| # | Capítulo |
|---|---|
| 00 | Visão geral e glossário |
| 01 | Preparando o ambiente (Node, Git, conta e token do TMDB) |
| 02 | Criando o projeto Next.js |
| 03 | Conversando com a API (`fetch`, `async/await`, `lib/tmdb.js`) |
| 04 | A primeira página: o catálogo |
| 05 | Filtros e ordenação |
| 06 | Paginação |
| 07 | Busca |
| 08 | Página do filme |
| 09 | Quando algo dá errado (erros e cache) |
| 10 | Testes (Vitest e TDD) |
| 11 | Publicando na Vercel |

- **Formato de cada capítulo:**
  1. O que fizemos (2–3 frases).
  2. Por que fizemos assim (decisões e alternativas descartadas).
  3. Conceitos novos, com comparações com Python quando ajudarem.
  4. O código comentado.
  5. Erros comuns e como resolver.
  6. Para praticar (um exercício curto).

## 8. Pré-requisitos do autor

- Conta gratuita no TMDB e o **Read Access Token** (necessário a partir da etapa 03).
- Conta no GitHub e na Vercel (necessárias apenas na etapa 11).
