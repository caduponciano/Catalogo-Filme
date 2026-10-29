# Catálogo de Filmes em Streaming — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site em Next.js que lista os filmes disponíveis por assinatura nos principais streamings do Brasil (TMDB), com filtros, ordenação, busca e página de detalhes — acompanhado de um material de estudo em `docs/estudo/`.

**Architecture:** Páginas são Server Components do Next.js (App Router) que chamam `lib/tmdb.js` no servidor; a chave nunca chega ao navegador. Filtros, ordenação e paginação vivem nos parâmetros da URL e são lidos/validados por funções puras em `lib/filtros.js`. Formatação e extração de dados ficam em `lib/formatar.js`. Formulários HTML com método GET — sem JavaScript no navegador na versão 1 (exceto `app/error.jsx`, que o Next.js exige como Client Component).

**Tech Stack:** Next.js (versão estável atual do `create-next-app`, App Router), React, JavaScript, CSS Modules, Vitest, React Testing Library, jsdom.

**Spec:** `docs/superpowers/specs/2026-10-28-catalogo-filmes-design.md`

## Global Constraints

- Idioma de toda a interface e do material de estudo: português do Brasil. Nomes de funções, variáveis e componentes em português, como na spec.
- JavaScript, não TypeScript. Arquivos com JSX usam `.jsx`; módulos sem JSX usam `.js`.
- Toda chamada ao TMDB passa por `lib/tmdb.js`, sempre com `language=pt-BR`, e com `watch_region=BR` nos endpoints que o usam (`discover` e `watch/providers`). Os detalhes do filme trazem todos os países; o app lê só `results.BR`.
- Autenticação: cabeçalho `Authorization: Bearer <TMDB_TOKEN>`; `TMDB_TOKEN` vem de `.env.local`, que nunca é commitado.
- Nenhum teste chama o TMDB de verdade (`fetch` sempre substituído com `vi.stubGlobal`).
- TDD: teste escrito e visto falhando antes do código.
- No Next.js atual, `params` e `searchParams` das páginas são Promises: use `await`.
- Ambiente: Windows, Node 24, npm 11. Comandos rodam no PowerShell.
- Commits em português, terminando com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Cada capítulo do material de estudo segue o formato da spec §7: **O que fizemos / Por que fizemos assim / Conceitos novos (com comparações com Python) / O código comentado / Erros comuns / Para praticar**. Público: sabe o básico de Python, iniciante em web e JavaScript. Cada capítulo também acrescenta seus termos novos ao glossário do capítulo 00.

## Review Focus

1. **Busca com acentos ou símbolos** (`Amélie`, `Tom & Jerry`) — o termo deve chegar ao TMDB codificado corretamente. Teste na Task 2.
2. **Parâmetro repetido na URL** (`?genero=28&genero=12`) — o Next entrega um array; usar o primeiro valor, não quebrar. Teste na Task 4.
3. **ID de streaming ou gênero que não está na lista** (`?streaming=99999`) — ignorar e voltar ao padrão, em vez de mostrar uma lista vazia sem explicação. Teste na Task 4.
4. **ID de filme inválido** (`/filme/abc`, `/filme/-5`, `/filme/1.5`) — página "não encontrado" sem chamar o TMDB. Teste na Task 7.
5. **Busca só com espaços** (`?q=%20%20`) — tratar como busca vazia e mostrar "Digite o nome de um filme para buscar". Teste na Task 6.

---

### Task 1: Projeto Next.js + Vitest + capítulos 00–02

**Files:**
- Create (via `create-next-app`): `package.json`, `next.config.mjs`, `app/layout.jsx`, `app/page.jsx`, `app/globals.css`, `.gitignore`, etc.
- Create: `vitest.config.mjs`, `tests/setup.js`, `tests/setup.test.jsx`, `.env.example`
- Create: `docs/estudo/00-visao-geral.md`, `docs/estudo/01-ambiente.md`, `docs/estudo/02-projeto-nextjs.md`

**Interfaces:**
- Produces: `npm test` (roda `vitest run`), `npm run test:watch` (`vitest`), `npm run dev`, `npm run lint`, `npm run build`; alias de importação `@/` apontando para a raiz do projeto, válido no Next e no Vitest.

- [ ] **Step 1: Criar o projeto na pasta atual**

Run: `npx create-next-app@latest . --js --app --eslint --no-tailwind --no-src-dir --import-alias "@/*" --use-npm --yes`
Expected: termina com "Success!". Se recusar por a pasta não estar vazia, crie em `tmp-app`, mova o conteúdo (incluindo arquivos ocultos, exceto `.git`) para a raiz e apague `tmp-app`.

- [ ] **Step 2: Converter para `.jsx` e limpar o modelo**

Renomeie `app/page.js` → `app/page.jsx` e `app/layout.js` → `app/layout.jsx`. Substitua o conteúdo de `app/page.jsx` por um `<main><h1>Catálogo de Filmes</h1></main>`, apague `app/page.module.css` e os SVGs de exemplo em `public/`. Em `app/layout.jsx`: `<html lang="pt-BR">`, `metadata = { title: 'Catálogo de Filmes', description: 'Filmes disponíveis nos streamings do Brasil' }`.

- [ ] **Step 3: Instalar as ferramentas de teste**

Run: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom`
No `package.json`, adicione os scripts `"test": "vitest run"` e `"test:watch": "vitest"`.

- [ ] **Step 4: Configurar o Vitest**

`vitest.config.mjs`: `plugins: [react()]`, `resolve.alias['@']` = raiz do projeto (via `fileURLToPath(new URL('./', import.meta.url))`), `test.environment = 'jsdom'`, `test.setupFiles = ['./tests/setup.js']`.
`tests/setup.js`: importa `@testing-library/jest-dom/vitest` e registra `afterEach(cleanup)` do `@testing-library/react`.

- [ ] **Step 5: Escrever o teste de fumaça**

```jsx
// tests/setup.test.jsx
import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'

test('o ambiente de testes renderiza React', () => {
  render(<p>funcionando</p>)
  expect(screen.getByText('funcionando')).toBeInTheDocument()
})
```

- [ ] **Step 6: Rodar os testes**

Run: `npm test`
Expected: `1 passed`.

- [ ] **Step 7: Conferir o site**

Run: `npm run dev`, abrir `http://localhost:3000`.
Expected: página com o título "Catálogo de Filmes". Encerrar o servidor.

- [ ] **Step 8: Criar `.env.example`**

Conteúdo: `TMDB_TOKEN=cole_aqui_o_seu_read_access_token`. Confirmar que `.gitignore` contém `.env*.local` (o modelo do Next já inclui `.env*`; se incluir `.env*`, acrescente a exceção `!.env.example`).

- [ ] **Step 9: Escrever os capítulos 00, 01 e 02**

- `00-visao-geral.md`: o que é o projeto, o mapa da arquitetura (diagrama da spec §4.2), índice dos capítulos 00–11 com links, e o glossário inicial (API, servidor, navegador, requisição, JSON, Node.js, npm, Git, componente, rota).
- `01-ambiente.md`: instalar Node.js e Git (já instalados nesta máquina: Node 24, npm 11), criar conta no TMDB, gerar o **Read Access Token** em *Configurações → API*, criar `.env.local` a partir de `.env.example`. Comparar `npm`/`package.json` com `pip`/`requirements.txt`.
- `02-projeto-nextjs.md`: o comando do Step 1 explicado flag por flag, a estrutura de pastas e o papel de cada arquivo, `npm run dev`, a configuração do Vitest e o teste de fumaça.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: cria projeto Next.js com Vitest e capítulos 00-02"
```

---

### Task 2: Cliente do TMDB (`lib/tmdb.js`) + capítulo 03

**Files:**
- Create: `lib/tmdb.js`
- Test: `tests/lib/tmdb.test.js`
- Create: `docs/estudo/03-api-tmdb.md`

**Interfaces:**
- Produces (todas `async`):
  - `listarFilmes({ streamings: number[], genero: number|null, ordem: 'popularidade'|'nota'|'lancamento', pagina: number })` → `{ filmes: object[], pagina: number, totalPaginas: number }`. `filmes` são os objetos crus do TMDB (`id`, `title`, `poster_path`, `release_date`, `vote_average`); `totalPaginas = min(total_pages, 500)`.
  - `buscarFilmes(termo: string, pagina: number)` → mesmo formato de `listarFilmes`.
  - `detalhesFilme(id: number)` → objeto cru do TMDB (com `credits`, `videos` e `'watch/providers'`) ou `null` se o TMDB responder 404.
  - `listarStreamings()` → `Array<{ id: number, nome: string, logo: string }>` — os 12 primeiros por prioridade de exibição no Brasil.
  - `listarGeneros()` → `Array<{ id: number, nome: string }>`.

- [ ] **Step 1: Escrever os testes que falham**

Preparação comum no arquivo:

```js
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { listarFilmes, buscarFilmes, detalhesFilme, listarStreamings, listarGeneros } from '@/lib/tmdb'

let fetchMock
beforeEach(() => {
  vi.stubEnv('TMDB_TOKEN', 'token-teste')
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers() })

const responder = (corpo, status = 200) =>
  fetchMock.mockResolvedValue(new Response(JSON.stringify(corpo), { status }))
const urlChamada = () => new URL(fetchMock.mock.calls[0][0])
const opcoesChamada = () => fetchMock.mock.calls[0][1]
const listaVazia = { page: 1, results: [], total_pages: 1 }
```

Testes (nome → asserções):

- `envia o token no cabeçalho Authorization` — após `listarGeneros()` com `responder({ genres: [] })`: `opcoesChamada().headers.Authorization === 'Bearer token-teste'`.
- `listarFilmes consulta o discover com região, idioma, streamings e gênero` — `listarFilmes({ streamings: [8, 119], genero: 28, ordem: 'popularidade', pagina: 2 })`: `pathname === '/3/discover/movie'`; parâmetros `language='pt-BR'`, `watch_region='BR'`, `with_watch_providers='8|119'`, `with_watch_monetization_types='flatrate'`, `with_genres='28'`, `sort_by='popularity.desc'`, `page='2'`; `vote_count.gte` ausente (`null`).
- `listarFilmes sem gênero não envia with_genres` — `genero: null` → `searchParams.has('with_genres') === false`.
- `ordem nota exige no mínimo 200 votos` — `sort_by='vote_average.desc'`, `vote_count.gte='200'`.
- `ordem lancamento só traz filmes já lançados` — `vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-28T12:00:00Z'))` → `sort_by='primary_release_date.desc'`, `primary_release_date.lte='2026-10-28'`.
- `listarFilmes limita o total de páginas a 500` — resposta `{ page: 1, results: [{ id: 1 }], total_pages: 900 }` → resultado `toEqual({ filmes: [{ id: 1 }], pagina: 1, totalPaginas: 500 })`.
- `listarFilmes guarda o resultado em cache por 1 hora` — `opcoesChamada().next.revalidate === 3600`.
- `buscarFilmes codifica termos com símbolos` *(Review Focus 1)* — `buscarFilmes('Tom & Jerry', 3)`: `pathname === '/3/search/movie'`, `searchParams.get('query') === 'Tom & Jerry'`, `fetchMock.mock.calls[0][0]` contém `'query=Tom+%26+Jerry'`, `page='3'`, `include_adult='false'`, `language='pt-BR'`.
- `buscarFilmes preserva acentos` *(Review Focus 1)* — `buscarFilmes('Amélie', 1)` → `searchParams.get('query') === 'Amélie'`.
- `detalhesFilme pede créditos, vídeos e onde assistir em uma chamada` — `detalhesFilme(603)` com `responder({ id: 603 })`: `pathname === '/3/movie/603'`, `append_to_response='credits,videos,watch/providers'`, `include_video_language='pt,en'`, resultado `toEqual({ id: 603 })`, `fetchMock` chamado 1 vez.
- `detalhesFilme devolve null quando o filme não existe` — `responder({}, 404)` → `null`.
- `lança erro quando o TMDB falha` — `responder({}, 500)` → `listarFilmes(...)` rejeita com `'Erro ao consultar o TMDB (status 500)'`.
- `lança erro claro quando falta o token` — `vi.stubEnv('TMDB_TOKEN', '')` → `listarGeneros()` rejeita com `'Configure a variável TMDB_TOKEN no arquivo .env.local'`; `fetchMock` não chamado.
- `listarStreamings devolve os 12 principais do Brasil` — resposta com 15 provedores `{ provider_id: i, provider_name: 'S' + i, logo_path: '/l' + i + '.png', display_priorities: { BR: 15 - i } }` para `i = 1..15`: `pathname === '/3/watch/providers/movie'`, `watch_region='BR'`, resultado tem 12 itens, o primeiro `toEqual({ id: 15, nome: 'S15', logo: '/l15.png' })`, `next.revalidate === 86400`.
- `listarGeneros devolve id e nome` — resposta `{ genres: [{ id: 28, name: 'Ação' }] }` → `toEqual([{ id: 28, nome: 'Ação' }])`; `pathname === '/3/genre/movie/list'`; `next.revalidate === 86400`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/lib/tmdb.test.js`
Expected: FAIL — não é possível resolver `@/lib/tmdb`.

- [ ] **Step 3: Implementar `lib/tmdb.js`**

Uma função interna `requisitar(caminho, parametros, revalidate)`:
- lê `process.env.TMDB_TOKEN`; vazio → `throw new Error('Configure a variável TMDB_TOKEN no arquivo .env.local')`;
- monta `https://api.themoviedb.org/3${caminho}?${new URLSearchParams({ language: 'pt-BR', ...parametros })}`, omitindo parâmetros `null`/`undefined`;
- `fetch(url, { headers: { Authorization: 'Bearer ' + token }, next: { revalidate }, signal: AbortSignal.timeout(10000) })`;
- status 404 → `null`; outro status não-OK → `throw new Error(\`Erro ao consultar o TMDB (status ${status})\`)`; OK → `resposta.json()`.

Constantes: `CACHE_LISTAS = 3600`, `CACHE_FIXOS = 86400`, `LIMITE_PAGINAS = 500`, `MAX_STREAMINGS = 12`. `watch_region: 'BR'` vai em `listarFilmes` e `listarStreamings`. Mapa de ordenação conforme spec §4.4. A data de hoje é `new Date().toISOString().slice(0, 10)`. Em `listarStreamings`, a prioridade é `display_priorities?.BR ?? display_priority`.

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: todos passam.

- [ ] **Step 5: Escrever o capítulo 03**

`03-api-tmdb.md`: o que é uma API REST e um token; ler a documentação do TMDB; `fetch` + `async/await` comparados com `requests.get(...)` em Python; por que um único módulo fala com o TMDB; `URLSearchParams` e codificação de URL (exemplo do `Tom & Jerry`); como os testes substituem o `fetch` (comparar com `unittest.mock`); primeira explicação do ciclo TDD (vermelho → verde). Exercício: adicionar à função `listarFilmes` um parâmetro opcional `ano`.

- [ ] **Step 6: Commit**

```bash
git add lib/tmdb.js tests/lib/tmdb.test.js docs/estudo/03-api-tmdb.md
git commit -m "feat: cliente do TMDB com testes e capítulo 03"
```

---

### Task 3: Catálogo básico (cartões, grade, layout, rodapé) + capítulo 04

**Files:**
- Create: `lib/formatar.js`, `public/sem-imagem.svg`, `public/tmdb-logo.svg`
- Create: `components/CartaoFilme.jsx`, `components/CartaoFilme.module.css`, `components/GradeFilmes.jsx`, `components/GradeFilmes.module.css`
- Modify: `app/layout.jsx`, `app/globals.css`, `app/page.jsx`, `next.config.mjs`
- Create: `app/layout.module.css`, `app/page.module.css`
- Test: `tests/lib/formatar.test.js`, `tests/components/CartaoFilme.test.jsx`, `tests/components/GradeFilmes.test.jsx`
- Create: `docs/estudo/04-catalogo.md`

**Interfaces:**
- Consumes: `listarFilmes`, `listarStreamings` (Task 2).
- Produces:
  - `urlImagem(caminho: string|null, tamanho = 'w342')` → `string`
  - `extrairAno(data: string|null|undefined)` → `string`
  - `formatarNota(nota: number|null|undefined)` → `string`
  - `<CartaoFilme filme={{ id, title, poster_path, release_date, vote_average }} />`
  - `<GradeFilmes filmes={object[]} mensagemVazia="..." />` — `mensagemVazia` tem o padrão `'Nenhum filme encontrado com esses filtros.'`

- [ ] **Step 1: Escrever os testes que falham**

`tests/lib/formatar.test.js`:
- `urlImagem monta a URL do TMDB` — `urlImagem('/abc.jpg')` → `'https://image.tmdb.org/t/p/w342/abc.jpg'`; `urlImagem('/abc.jpg', 'w500')` → `'https://image.tmdb.org/t/p/w500/abc.jpg'`.
- `urlImagem usa a imagem genérica sem caminho` — `urlImagem(null)` e `urlImagem('')` → `'/sem-imagem.svg'`.
- `extrairAno` — `'1999-03-30'` → `'1999'`; `''`, `null`, `undefined` → `''`.
- `formatarNota usa vírgula e uma casa` — `7.834` → `'7,8'`; `8` → `'8,0'`; `null` e `0` → `'–'` (sem nota).

`tests/components/CartaoFilme.test.jsx`:
- `mostra título, ano, nota e link para a página do filme` — com `{ id: 603, title: 'Matrix', poster_path: '/m.jpg', release_date: '1999-03-30', vote_average: 8.2 }`: texto `'Matrix'`, `'1999'`, `'8,2'`; `getByRole('link')` tem `href` `'/filme/603'`; `getByRole('img', { name: 'Pôster de Matrix' })` tem `src` contendo `'m.jpg'`.
- `usa a imagem genérica quando não há pôster` — `poster_path: null` → `src` da imagem contém `'sem-imagem.svg'`.

`tests/components/GradeFilmes.test.jsx`:
- `renderiza um cartão por filme` — 2 filmes → `getAllByRole('listitem')` tem 2 itens.
- `mostra a mensagem padrão quando a lista está vazia` — `filmes={[]}` → texto `'Nenhum filme encontrado com esses filtros.'`.
- `aceita outra mensagem para lista vazia` — `mensagemVazia="Nada aqui."` → texto `'Nada aqui.'`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL nos três arquivos novos (módulos não encontrados).

- [ ] **Step 3: Implementar `lib/formatar.js`, `CartaoFilme` e `GradeFilmes`**

`CartaoFilme` usa `next/link` e `next/image` (`width={342} height={513}`, `alt={'Pôster de ' + title}`). `GradeFilmes` renderiza `<ul>` com um `<li>` por filme, chave `filme.id`. `public/sem-imagem.svg`: retângulo cinza 2:3 com um ícone simples de filme.

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: todos passam.

- [ ] **Step 5: Liberar as imagens do TMDB**

Em `next.config.mjs`: `images.remotePatterns = [{ protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' }]`.

- [ ] **Step 6: Layout e rodapé**

`app/layout.jsx`: cabeçalho com link "Catálogo de Filmes" para `/`; `<main>` com `children`; rodapé com o logotipo do TMDB (`public/tmdb-logo.svg`, baixado da página oficial de logos e atribuição do TMDB), o texto exato **"Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB."** e **"Dados de onde assistir fornecidos pelo JustWatch."**. `app/globals.css`: tema escuro simples, fonte do sistema, largura máxima do conteúdo. Grade responsiva em `GradeFilmes.module.css` (`grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))`).

- [ ] **Step 7: Página do catálogo**

`app/page.jsx` (async): `listarStreamings()`, depois `listarFilmes({ streamings: ids de todos os streamings, genero: null, ordem: 'popularidade', pagina: 1 })`, e renderiza `<h1>` + `<GradeFilmes filmes={filmes} />`. (Filtros e paginação entram nas Tasks 4 e 5.)

- [ ] **Step 8: Conferir no navegador**

Pré-requisito: `.env.local` com o `TMDB_TOKEN` real. **Se não existir, pare e peça ao usuário** (capítulo 01 explica como obter).
Run: `npm run dev`, abrir `http://localhost:3000`.
Expected: grade de 20 pôsteres com título, ano e nota; rodapé com os créditos; layout ok em largura de celular (DevTools, 375px).

- [ ] **Step 9: Escrever o capítulo 04**

`04-catalogo.md`: componentes React como funções (comparar com funções Python que devolvem HTML), props, JSX, `map` para listas (comparar com list comprehension), `key`, Server Components com `async`, `next/image` e por que liberar o domínio, CSS Modules e grid responsivo, a exigência dos créditos ao TMDB. Exercício: mostrar o título original abaixo do título quando forem diferentes.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: catálogo com grade de filmes, layout e capítulo 04"
```

---

### Task 4: Filtros e ordenação + capítulo 05

**Files:**
- Create: `lib/filtros.js`, `components/Filtros.jsx`, `components/Filtros.module.css`
- Modify: `app/page.jsx`
- Test: `tests/lib/filtros.test.js`, `tests/components/Filtros.test.jsx`
- Create: `docs/estudo/05-filtros.md`

**Interfaces:**
- Consumes: `listarFilmes`, `listarStreamings`, `listarGeneros` (Task 2); `GradeFilmes` (Task 3).
- Produces:
  - `lerFiltros(searchParams: object, { streamings: number[], generos: number[] })` → `{ streaming: number|null, genero: number|null, ordem: 'popularidade'|'nota'|'lancamento', pagina: number }`
  - `lerPagina(valor: string|string[]|undefined)` → `number` (1 a 500; padrão 1)
  - `paraQuery(parametros: object)` → `string` sem `?`, omitindo valores `null`, `undefined` e `''`
  - `<Filtros streamings={[{id, nome}]} generos={[{id, nome}]} filtros={resultado de lerFiltros} />`

- [ ] **Step 1: Escrever os testes que falham**

`tests/lib/filtros.test.js` (com `const listas = { streamings: [8, 119], generos: [28, 35] }`):
- `usa os valores padrão sem parâmetros` — `lerFiltros({}, listas)` → `{ streaming: null, genero: null, ordem: 'popularidade', pagina: 1 }`.
- `lê valores válidos` — `{ streaming: '8', genero: '35', ordem: 'nota', pagina: '3' }` → `{ streaming: 8, genero: 35, ordem: 'nota', pagina: 3 }`.
- `ignora streaming e gênero fora da lista` *(Review Focus 3)* — `{ streaming: '99999', genero: '1' }` → `streaming: null`, `genero: null`.
- `usa o primeiro valor de parâmetros repetidos` *(Review Focus 2)* — `{ genero: ['28', '35'] }` → `genero: 28`.
- `ignora ordem desconhecida` — `{ ordem: 'aleatoria' }` → `'popularidade'`.
- `lerPagina corrige valores inválidos` — `'abc'`, `'0'`, `'-2'`, `'1.5'`, `undefined` → `1`; `'9999'` → `500`; `['4', '7']` → `4`.
- `paraQuery omite valores vazios` — `paraQuery({ streaming: 8, genero: null, ordem: 'nota', q: '', pagina: 2 })` → `'streaming=8&ordem=nota&pagina=2'`.

`tests/components/Filtros.test.jsx`:
- `é um formulário GET para o catálogo` — `container.querySelector('form')` com `method` `'get'` e `action` terminando em `'/'`.
- `lista os streamings com a opção "Todos os streamings"` — `getByLabelText('Streaming')` contém as opções `'Todos os streamings'` (valor `''`) e os nomes recebidos.
- `lista os gêneros com a opção "Todos os gêneros"` — idem para `getByLabelText('Gênero')`.
- `oferece as três ordenações` — `getByLabelText('Ordenar por')` tem as opções `'Popularidade'`, `'Nota'`, `'Lançamento'` com valores `'popularidade'`, `'nota'`, `'lancamento'`.
- `marca os filtros atuais` — com `filtros={{ streaming: 8, genero: 35, ordem: 'nota', pagina: 1 }}`: os selects têm valor `'8'`, `'35'` e `'nota'`.
- `tem o botão Filtrar` — `getByRole('button', { name: 'Filtrar' })`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL nos dois arquivos novos.

- [ ] **Step 3: Implementar `lib/filtros.js` e `components/Filtros.jsx`**

Um valor numérico é válido só se casar com `/^\d+$/`. `Filtros` usa `<select name="streaming|genero|ordem" defaultValue=...>` com `<label>` associado e **não** inclui `pagina` — enviar o formulário volta à página 1.

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: todos passam.

- [ ] **Step 5: Ligar os filtros ao catálogo**

`app/page.jsx`: `Promise.all([listarStreamings(), listarGeneros()])`; `lerFiltros(await searchParams, { streamings: ids, generos: ids })`; `listarFilmes({ streamings: filtros.streaming ? [filtros.streaming] : todosOsIds, genero, ordem, pagina })`; renderiza `<Filtros>` acima da grade.

- [ ] **Step 6: Conferir no navegador**

Run: `npm run dev`.
Expected: escolher Netflix + Comédia + Nota muda a URL para `/?streaming=8&genero=35&ordem=nota` e a grade; `/?streaming=99999` mostra o catálogo padrão; o botão "voltar" do navegador restaura o filtro anterior.

- [ ] **Step 7: Escrever o capítulo 05**

`05-filtros.md`: formulários HTML com GET, parâmetros de URL (comparar com `request.args` do Flask), por que guardar o estado na URL, `searchParams` como Promise e `await`, validar entrada do usuário (nunca confiar na URL), funções puras e por que são fáceis de testar. Exercício: adicionar a ordenação "Mais votados" (`vote_count.desc`).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: filtros por streaming e gênero, ordenação e capítulo 05"
```

---

### Task 5: Paginação + capítulo 06

**Files:**
- Create: `components/Paginacao.jsx`, `components/Paginacao.module.css`
- Modify: `app/page.jsx`
- Test: `tests/components/Paginacao.test.jsx`
- Create: `docs/estudo/06-paginacao.md`

**Interfaces:**
- Consumes: `paraQuery` (Task 4); `totalPaginas` de `listarFilmes` (Task 2).
- Produces: `<Paginacao pagina={number} totalPaginas={number} caminho={string} parametros={object} />` — `parametros` são os demais filtros, sem `pagina`. Os links são `${caminho}?${paraQuery({ ...parametros, pagina: n })}`.

- [ ] **Step 1: Escrever os testes que falham**

- `não aparece quando há uma página só` — `totalPaginas={1}` e `totalPaginas={0}` → `container` vazio.
- `mostra "Página X de Y"` — `pagina={2} totalPaginas={5}` → texto `'Página 2 de 5'`.
- `preserva os filtros nos links` — `pagina={2} totalPaginas={5} caminho="/" parametros={{ streaming: 8, genero: 28, ordem: 'nota' }}` → link `'Próxima'` com `href` `'/?streaming=8&genero=28&ordem=nota&pagina=3'`; link `'Anterior'` com `href` `'/?streaming=8&genero=28&ordem=nota&pagina=1'`.
- `não tem link "Anterior" na primeira página` — `pagina={1} totalPaginas={5}` → `queryByRole('link', { name: 'Anterior' })` é `null`.
- `não tem link "Próxima" na última página` — `pagina={5} totalPaginas={5}` → `queryByRole('link', { name: 'Próxima' })` é `null`.
- `não tem link "Próxima" além do total` — `pagina={50} totalPaginas={3}` → `queryByRole('link', { name: 'Próxima' })` é `null`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/components/Paginacao.test.jsx`
Expected: FAIL (módulo não encontrado).

- [ ] **Step 3: Implementar `components/Paginacao.jsx`**

Links com `next/link` dentro de um `<nav aria-label="Paginação">`.

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: todos passam.

- [ ] **Step 5: Ligar a paginação ao catálogo**

Em `app/page.jsx`, abaixo da grade: `<Paginacao pagina={filtros.pagina} totalPaginas={totalPaginas} caminho="/" parametros={{ streaming, genero, ordem }} />`.

- [ ] **Step 6: Conferir no navegador**

Expected: "Próxima" avança com os filtros mantidos; `/?pagina=9999` mostra a página 500 (ou a grade vazia com a mensagem, se houver menos páginas).

- [ ] **Step 7: Escrever o capítulo 06**

`06-paginacao.md`: por que APIs paginam, `page`/`total_pages`, o limite de 500 do TMDB, operador spread `{ ...obj }` (comparar com `{**dic}`), renderização condicional (`cond && <X/>`, comparar com `if` em template). Exercício: mostrar links numerados para as páginas vizinhas (ex.: 1 … 4 5 6 … 20).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: paginação do catálogo e capítulo 06"
```

---

### Task 6: Busca + capítulo 07

**Files:**
- Modify: `lib/filtros.js`, `app/layout.jsx`, `app/layout.module.css`
- Create: `app/busca/page.jsx`
- Test: `tests/lib/filtros.test.js`
- Create: `docs/estudo/07-busca.md`

**Interfaces:**
- Consumes: `buscarFilmes` (Task 2), `lerPagina` (Task 4), `GradeFilmes` (Task 3), `Paginacao` (Task 5).
- Produces: `lerBusca(searchParams: object)` → `{ termo: string, pagina: number }`.

- [ ] **Step 1: Escrever os testes que falham** (em `tests/lib/filtros.test.js`)

- `lerBusca lê termo e página` — `{ q: 'matrix', pagina: '2' }` → `{ termo: 'matrix', pagina: 2 }`.
- `lerBusca remove espaços das pontas` — `{ q: '  matrix  ' }` → `termo: 'matrix'`.
- `lerBusca trata só espaços como busca vazia` *(Review Focus 5)* — `{ q: '   ' }` → `termo: ''`.
- `lerBusca sem q devolve termo vazio` — `{}` → `{ termo: '', pagina: 1 }`.
- `lerBusca usa o primeiro q repetido` — `{ q: ['a', 'b'] }` → `termo: 'a'`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/lib/filtros.test.js`
Expected: FAIL — `lerBusca` não é exportada.

- [ ] **Step 3: Implementar `lerBusca`**

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: todos passam.

- [ ] **Step 5: Página de busca e caixa no cabeçalho**

`app/busca/page.jsx` (async): `lerBusca(await searchParams)`. Termo vazio → `<p>Digite o nome de um filme para buscar</p>` sem chamar o TMDB. Caso contrário: título `Resultados para “{termo}”`, `<GradeFilmes filmes={filmes} mensagemVazia={'Nenhum filme encontrado para “' + termo + '”.'} />` e `<Paginacao caminho="/busca" parametros={{ q: termo }} .../>`.
Cabeçalho em `app/layout.jsx`: `<form method="get" action="/busca" role="search">` com `<input type="search" name="q" placeholder="Buscar filme…" aria-label="Buscar filme">` e botão "Buscar".

- [ ] **Step 6: Conferir no navegador**

Expected: buscar "Cidade de Deus" e "Tom & Jerry" mostra resultados; `/busca?q=%20%20` mostra "Digite o nome de um filme para buscar"; a busca aparece em todas as páginas.

- [ ] **Step 7: Escrever o capítulo 07**

`07-busca.md`: uma segunda rota (`app/busca/page.jsx`), o layout compartilhado, o formulário de busca e `role="search"`, `trim()` (comparar com `strip()`), por que a busca não filtra por streaming (decisão da spec §3.2). Exercício: manter o termo digitado dentro da caixa de busca depois de buscar.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: busca por nome e capítulo 07"
```

---

### Task 7: Página do filme + capítulo 08

**Files:**
- Modify: `lib/formatar.js`, `lib/filtros.js`
- Create: `app/filme/[id]/page.jsx`, `app/filme/[id]/page.module.css`
- Test: `tests/lib/formatar.test.js`, `tests/lib/filtros.test.js`
- Create: `docs/estudo/08-pagina-do-filme.md`

**Interfaces:**
- Consumes: `detalhesFilme`, `listarStreamings` (Task 2); `urlImagem`, `extrairAno`, `formatarNota` (Task 3).
- Produces:
  - `formatarDuracao(minutos: number|null|undefined)` → `string`
  - `escolherTrailer(videos: Array<{ site, type, key, iso_639_1 }>|undefined)` → `string|null` (a `key` do YouTube)
  - `ondeAssistir(provedoresBR: { link?, flatrate? }|undefined, idsPrincipais: number[])` → `{ lista: Array<{ id, nome, logo }>, link: string|null }`
  - `lerIdFilme(valor: string)` → `number|null`

- [ ] **Step 1: Escrever os testes que falham**

Em `tests/lib/formatar.test.js`:
- `formatarDuracao` — `136` → `'2h 16min'`; `120` → `'2h'`; `45` → `'45min'`; `0`, `null`, `undefined` → `''`.
- `escolherTrailer prefere português` — vídeos `[{ site: 'YouTube', type: 'Trailer', key: 'en1', iso_639_1: 'en' }, { site: 'YouTube', type: 'Trailer', key: 'pt1', iso_639_1: 'pt' }]` → `'pt1'`.
- `escolherTrailer usa inglês na falta de português` — só o `en1` → `'en1'`.
- `escolherTrailer ignora teasers e outros sites` — `[{ site: 'YouTube', type: 'Teaser', key: 't', iso_639_1: 'pt' }, { site: 'Vimeo', type: 'Trailer', key: 'v', iso_639_1: 'pt' }]` → `null`; `undefined` → `null`.
- `ondeAssistir lista só os principais streamings` — `ondeAssistir({ link: 'https://www.themoviedb.org/movie/603/watch', flatrate: [{ provider_id: 8, provider_name: 'Netflix', logo_path: '/n.png' }, { provider_id: 9999, provider_name: 'Outro', logo_path: '/o.png' }] }, [8, 119])` → `{ lista: [{ id: 8, nome: 'Netflix', logo: '/n.png' }], link: 'https://www.themoviedb.org/movie/603/watch' }`.
- `ondeAssistir sem dados do Brasil` — `ondeAssistir(undefined, [8])` → `{ lista: [], link: null }`.
- `ondeAssistir só com aluguel não conta como streaming` — `{ link: 'x', rent: [{ provider_id: 8 }] }` → `{ lista: [], link: null }`.

Em `tests/lib/filtros.test.js`:
- `lerIdFilme aceita inteiros positivos` — `'603'` → `603`.
- `lerIdFilme recusa valores inválidos` *(Review Focus 4)* — `'abc'`, `'-5'`, `'1.5'`, `'0'`, `''` → `null`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL — funções não exportadas.

- [ ] **Step 3: Implementar as quatro funções**

`ondeAssistir` devolve `link: null` sempre que `lista` estiver vazia (o link só aparece junto dos logotipos).

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: todos passam.

- [ ] **Step 5: Página do filme**

`app/filme/[id]/page.jsx` (async):
1. `lerIdFilme((await params).id)`; `null` → `notFound()` **antes** de qualquer chamada ao TMDB.
2. `Promise.all([detalhesFilme(id), listarStreamings()])`; `detalhes === null` → `notFound()`.
3. Renderiza: pôster (`urlImagem(poster_path, 'w500')`), título, ano, duração, nomes dos gêneros, nota, sinopse (vazia → `'Sinopse não disponível.'`).
4. Elenco: `credits.cast.slice(0, 10)` com foto (`urlImagem(profile_path, 'w185')`), nome e personagem.
5. Trailer: se `escolherTrailer(videos.results)` devolver uma `key`, `<iframe src={'https://www.youtube.com/embed/' + key} title={'Trailer de ' + title} allowFullScreen>`; senão, a seção não aparece.
6. Onde assistir: `ondeAssistir(detalhes['watch/providers']?.results?.BR, ids dos streamings)`. Com itens: logotipos (`urlImagem(logo, 'w92')`, `alt` = nome) e o link "Ver todas as opções" (`target="_blank" rel="noopener noreferrer"`). Sem itens: o texto exato **"Este filme não está disponível em nenhum streaming no Brasil no momento."**
7. `generateMetadata` define o título da aba como `'{title} — Catálogo de Filmes'`.

- [ ] **Step 6: Conferir no navegador**

Expected: `/filme/603` mostra os dados completos, elenco, trailer e streamings; um filme antigo sem streaming mostra a mensagem; `/filme/abc` e `/filme/999999999` mostram a página "não encontrado"; layout ok em 375px.

- [ ] **Step 7: Escrever o capítulo 08**

`08-pagina-do-filme.md`: rotas dinâmicas `[id]` (comparar com `/filme/<int:id>` no Flask), `params`, `append_to_response` (uma chamada em vez de quatro), encadeamento opcional `?.` (comparar com `dict.get`), `slice` (comparar com `lista[:10]`), `notFound()`, incorporar vídeo com `iframe`, `generateMetadata`. Exercício: mostrar o diretor do filme (`credits.crew` com `job === 'Director'`).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: página do filme com elenco, trailer e onde assistir; capítulo 08"
```

---

### Task 8: Páginas de erro e "não encontrado" + capítulo 09

**Files:**
- Create: `app/error.jsx`, `app/not-found.jsx`
- Test: `tests/app/error.test.jsx`, `tests/app/not-found.test.jsx`
- Create: `docs/estudo/09-erros-e-cache.md`

**Interfaces:**
- Produces: `app/error.jsx` — Client Component (`'use client'`) que recebe `{ error, reset }`; `app/not-found.jsx` — componente sem props.

- [ ] **Step 1: Escrever os testes que falham**

- `error: mostra a mensagem e tenta de novo` — `render(<PaginaErro error={new Error('x')} reset={reset} />)` com `reset = vi.fn()`: texto `'Não foi possível carregar os filmes'`; clicar em `getByRole('button', { name: 'Tentar novamente' })` chama `reset` 1 vez.
- `not-found: avisa e leva de volta ao catálogo` — texto `'Filme não encontrado'`; `getByRole('link', { name: 'Voltar ao catálogo' })` com `href` `'/'`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/app`
Expected: FAIL (módulos não encontrados).

- [ ] **Step 3: Implementar `app/error.jsx` e `app/not-found.jsx`**

Se a versão instalada do Next.js tiver mudado a prop `reset`, siga a documentação dessa versão e ajuste o teste com o mesmo comportamento.

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: todos passam.

- [ ] **Step 5: Conferir no navegador**

Expected: com o `TMDB_TOKEN` temporariamente apagado do `.env.local`, o terminal do `npm run dev` mostra "Configure a variável TMDB_TOKEN no arquivo .env.local"; em produção (`npm run build` + `npm start`) a página mostra "Não foi possível carregar os filmes" e o botão. Restaurar o token. `/filme/abc` mostra "Filme não encontrado".

- [ ] **Step 6: Escrever o capítulo 09**

`09-erros-e-cache.md`: `throw`/`try` (comparar com `raise`/`try` em Python), como o Next.js direciona erros para `error.jsx`, por que essa página é um Client Component, `notFound()`, a tabela de situações de erro da spec §5, cache com `revalidate` (o que é, por que 1 hora e 1 dia, como desligar em testes). Exercício: personalizar a mensagem de erro quando o problema for o token ausente (só no modo de desenvolvimento).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: páginas de erro e não encontrado; capítulo 09"
```

---

### Task 9: Verificação final, publicação e capítulos 10–11

**Files:**
- Create: `README.md`, `docs/estudo/10-testes.md`, `docs/estudo/11-publicacao.md`
- Modify: `docs/estudo/00-visao-geral.md` (glossário completo e links conferidos)

- [ ] **Step 1: Rodar todas as verificações**

Run: `npm test; npm run lint; npm run build`
Expected: testes todos passando, lint sem erros, build concluído. Corrigir o que falhar antes de seguir.

- [ ] **Step 2: Escrever o README**

O que é o projeto, captura das funcionalidades, como rodar (`npm install`, `.env.local`, `npm run dev`, `npm test`), créditos ao TMDB e ao JustWatch, link para `docs/estudo/00-visao-geral.md`.

- [ ] **Step 3: Escrever o capítulo 10**

`10-testes.md`: por que testar, Vitest comparado com `pytest`, anatomia de um teste (`test`/`expect`), substituir o `fetch` com `vi.stubGlobal` (comparar com `unittest.mock.patch`), testar componentes com React Testing Library (buscar pelo que o usuário vê: texto, rótulo, papel), o ciclo TDD usado em todas as tasks com um exemplo real do projeto, `npm run test:watch`. Exercício: escrever o teste do filtro por ano do exercício do capítulo 03.

- [ ] **Step 4: Publicar — feito junto com o usuário**

Esta etapa usa contas do usuário e publica o código; **cada passo externo precisa da confirmação dele**:
1. Usuário cria o repositório no GitHub; fazer `git remote add origin ...` e `git push -u origin main`. Antes do push, conferir com `git ls-files` que `.env.local` não está no repositório.
2. Usuário importa o repositório na Vercel e cadastra a variável de ambiente `TMDB_TOKEN`.
3. Abrir a URL pública e repetir as conferências das Tasks 3–8 (catálogo, filtros, paginação, busca, página do filme, `/filme/abc`).

- [ ] **Step 5: Escrever o capítulo 11 e revisar o 00**

`11-publicacao.md`: o que é deploy, GitHub (repositório remoto, `push`), Vercel (build na nuvem, variáveis de ambiente, novo deploy a cada `push`), por que o `.env.local` não sobe e como a Vercel recebe o token. Exercício: fazer uma mudança pequena, dar `push` e ver o novo deploy.
Revisar `00-visao-geral.md`: glossário completo, todos os links funcionando, e a seção "Próximos passos" apontando para a versão 2 (login).

- [ ] **Step 6: Commit e push**

```bash
git add -A
git commit -m "docs: README e capítulos 10-11"
git push
```
