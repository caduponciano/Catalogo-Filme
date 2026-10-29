# 10 — Testes (Vitest e TDD)

## O que fizemos

Ao longo do projeto escrevemos **66 testes automáticos** em 10 arquivos. Eles conferem as funções do `lib/` (API, filtros, formatação), os componentes (cartão, grade, filtros, paginação) e as páginas de erro e de "não encontrado". Todos rodam em poucos segundos, sem internet, com `npm test`.

Este capítulo junta o que foi aparecendo aos poucos nos anteriores.

## Por que fizemos assim

- **Confiança para mudar.** Quando você for fazer os exercícios ou a versão 2 (login), os testes avisam na hora se algo que funcionava parou de funcionar.
- **Testes antes do código (TDD).** Em todas as etapas, o teste foi escrito primeiro e visto falhando. Isso prova que o teste realmente verifica alguma coisa.
- **Sem TMDB de verdade.** Testes que dependem da internet são lentos, falham quando a rede cai e gastam a cota da API. Trocamos o `fetch` por um falso.
- **Testar o que o usuário vê.** Nos componentes, procuramos textos, botões e links — não classes CSS. Se o visual mudar, os testes continuam valendo.

## Conceitos novos

### Vitest × pytest

| pytest | Vitest |
|---|---|
| `def test_algo():` | `test("algo", () => { ... })` |
| `assert x == 3` | `expect(x).toBe(3)` |
| `assert d == {"a": 1}` | `expect(d).toEqual({ a: 1 })` |
| `with pytest.raises(Erro):` | `await expect(promessa).rejects.toThrow("mensagem")` |
| agrupar em uma classe | `describe("grupo", () => { ... })` |
| `pytest -k nome` | `npm test -- tests/lib/filtros.test.js` |
| `pytest-watch` | `npm run test:watch` |

`toBe` compara se é **o mesmo valor** (números, textos). `toEqual` compara **o conteúdo** de objetos e listas.

### Anatomia de um teste

Todo teste tem três partes — **prepara, executa, confere**:

```js
test("ignora ordem desconhecida", () => {
  const listas = { streamings: [8, 119], generos: [28, 35] };   // prepara
  const filtros = lerFiltros({ ordem: "aleatoria" }, listas);    // executa
  expect(filtros.ordem).toBe("popularidade");                    // confere
});
```

### Substituir o `fetch`: `vi.stubGlobal` × `unittest.mock.patch`

```js
beforeEach(() => {
  vi.stubEnv("TMDB_TOKEN", "token-teste");   // finge que o .env.local existe
  fetchMock = vi.fn();                       // uma função falsa que registra as chamadas
  vi.stubGlobal("fetch", fetchMock);         // troca o fetch verdadeiro pelo falso
});

afterEach(() => {
  vi.unstubAllEnvs();                        // desfaz tudo depois de cada teste
  vi.unstubAllGlobals();
});
```

Em Python seria:

```python
@patch("requests.get")
def test_algo(mock_get): ...
```

Com o `fetch` falso, conferimos **o que a nossa função pediu** ao TMDB (a URL e os parâmetros) e controlamos **o que o TMDB "respondeu"** (inclusive erros 404 e 500).

### Substituir um módulo inteiro: `vi.mock`

```js
vi.mock("next/cache", () => ({ cacheLife: vi.fn() }));
```

O `cacheLife` só funciona dentro do Next.js. Nos testes, trocamos o módulo inteiro por uma versão falsa e só conferimos que ele foi chamado com o perfil certo (`"hours"` ou `"days"`).

### Controlar a data: `vi.setSystemTime`

```js
vi.useFakeTimers();
vi.setSystemTime(new Date("2026-10-28T12:00:00Z"));
```

A ordenação por lançamento usa "a data de hoje". Para o teste não mudar de resultado a cada dia, congelamos o relógio.

### Testar componentes com React Testing Library

```jsx
render(<Filtros streamings={streamings} generos={generos} filtros={padrao} />);
screen.getByLabelText("Streaming");                        // o <select> com rótulo "Streaming"
screen.getByRole("button", { name: "Filtrar" });           // um botão com o texto "Filtrar"
screen.getByRole("link", { name: "Próxima" });             // um link "Próxima"
screen.queryByRole("link", { name: "Anterior" });          // null se não existir
fireEvent.click(botao);                                    // simula um clique
```

- `getBy...` **falha** se não encontrar o elemento.
- `queryBy...` devolve `null` — use para conferir que algo **não** está na tela.

### O ciclo TDD, com um exemplo real

Na etapa 6 (busca), o teste veio primeiro:

```js
test("trata só espaços como busca vazia", () => {
  expect(lerBusca({ q: "   " }).termo).toBe("");
});
```

1. **Vermelho:** rodamos `npm test` e vimos `TypeError: lerBusca is not a function`. Falhou pelo motivo certo: a função ainda não existia.
2. **Verde:** escrevemos o mínimo para passar:
   ```js
   export function lerBusca(searchParams) {
     return { termo: (primeiro(searchParams.q) ?? "").trim(), pagina: lerPagina(searchParams.pagina) };
   }
   ```
3. **Rodamos tudo de novo** (`npm test`), não só o arquivo novo, para garantir que nada antigo quebrou.

Se um teste novo **passar logo de primeira**, desconfie: ele provavelmente não está testando o que você pensa.

### O que os testes não cobrem

Os componentes `async` (as páginas que buscam dados) não são testados pelo Vitest, que ainda não os suporta. Eles foram conferidos **à mão**, no navegador, ao fim de cada etapa. Um próximo passo possível seria usar testes de ponta a ponta (E2E) com uma ferramenta como o Playwright.

## O código comentado

Os arquivos de teste:

| Arquivo | O que testa |
|---|---|
| `tests/setup.test.jsx` | se o ambiente de testes funciona |
| `tests/lib/tmdb.test.js` | URLs, parâmetros, token, cache e erros das chamadas ao TMDB |
| `tests/lib/filtros.test.js` | leitura e validação da URL, busca e ID do filme |
| `tests/lib/formatar.test.js` | imagens, ano, nota, duração, trailer e onde assistir |
| `tests/components/*.test.jsx` | cartão, grade, filtros e paginação |
| `tests/app/*.test.jsx` | página de erro e "não encontrado" |

## Erros comuns

| Problema | Causa e solução |
|---|---|
| `Failed to resolve import "@/..."` | O arquivo ainda não existe (normal no "vermelho") ou o caminho está errado. |
| `document is not defined` | O teste não está rodando no jsdom. Confira `environment: "jsdom"` no `vitest.config.mjs`. |
| `toBeInTheDocument is not a function` | Falta importar `@testing-library/jest-dom/vitest` no `tests/setup.js`. |
| Um teste afeta o outro | Faltou desfazer as trocas no `afterEach` (`vi.unstubAllGlobals()`, `cleanup`). |
| `Found multiple elements` | O `getBy...` achou mais de um. Seja mais específico (use `name`, ou `within(...)`). |

## Para praticar

Volte ao exercício do capítulo 03 (filtro por ano) e faça-o com TDD completo:

1. Escreva o teste em `tests/lib/tmdb.test.js` e rode `npm test` — ele deve **falhar**.
2. Faça o mínimo em `lib/tmdb.js` para ele passar.
3. Rode a suíte inteira e confira que os 66 testes antigos continuam passando.

Depois, deixe o `npm run test:watch` aberto enquanto faz o exercício do capítulo 05 e veja os testes rodarem sozinhos a cada vez que você salva um arquivo.
