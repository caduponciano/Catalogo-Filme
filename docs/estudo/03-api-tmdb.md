# 03 — Conversando com a API

## O que fizemos

Criamos o `lib/tmdb.js`, o único arquivo do projeto que fala com o TMDB. Ele tem cinco funções: listar filmes (com filtros), buscar por nome, pegar os detalhes de um filme, listar os streamings e listar os gêneros. Escrevemos os testes **antes** do código, e eles não usam a internet.

## Por que fizemos assim

- **Um único arquivo fala com o TMDB.** Se a API mudar, só esse arquivo muda. As páginas chamam `listarFilmes(...)` sem saber que existe um TMDB por trás.
- **A chave fica no servidor.** Este código roda só no servidor do Next.js; o navegador nunca vê o token.
- **Cache.** Os mesmos dados são pedidos muitas vezes (a lista de gêneros, por exemplo, quase nunca muda). Guardar a resposta por um tempo deixa o site mais rápido e economiza chamadas à API.
- **Testes sem internet.** Trocamos o `fetch` por uma versão falsa que devolve respostas prontas. Os testes ficam rápidos, previsíveis e não gastam a cota da API.

## Conceitos novos

### API REST e token

A API do TMDB funciona com **endereços** (URLs). Cada endereço devolve um tipo de dado em JSON:

| Endereço | O que devolve |
|---|---|
| `/3/discover/movie` | uma lista de filmes, com filtros |
| `/3/search/movie?query=matrix` | filmes cujo nome combina com a busca |
| `/3/movie/603` | os detalhes do filme 603 (Matrix) |
| `/3/genre/movie/list` | os gêneros |
| `/3/watch/providers/movie` | os streamings |

O **token** prova ao TMDB quem está pedindo. Ele vai num **cabeçalho** da requisição: `Authorization: Bearer <token>`.

### `fetch` e `async/await` × `requests`

Em Python, com a biblioteca `requests`:

```python
resposta = requests.get(url, headers={"Authorization": "Bearer " + token})
dados = resposta.json()
```

Em JavaScript:

```js
const resposta = await fetch(url, { headers: { Authorization: "Bearer " + token } });
const dados = await resposta.json();
```

A diferença é o `await`. Em JavaScript, operações demoradas (como esperar a internet) devolvem uma **Promise**, uma "promessa" de resultado futuro. O `await` diz: "espere a promessa se cumprir e me dê o resultado". Só dá para usar `await` dentro de uma função marcada com `async`. Python também tem isso (`async def` / `await`), mas o `requests` não usa.

### Parâmetros na URL e `URLSearchParams`

Os filtros vão no fim da URL, depois do `?`: `...?language=pt-BR&page=2`. O `URLSearchParams` monta esse texto e **codifica** caracteres especiais. Sem isso, buscar `Tom & Jerry` quebraria a URL, porque o `&` separa parâmetros. Codificado, vira `query=Tom+%26+Jerry`.

Em Python, o `requests` faz o mesmo quando você passa `params={"query": "Tom & Jerry"}`.

### Cache no Next.js 16: `"use cache"` e `cacheLife`

```js
export async function listarGeneros() {
  "use cache";        // guarda o resultado desta função
  cacheLife("days");  // por quanto tempo: perfil "days" = renova uma vez por dia
  ...
}
```

Cada combinação de argumentos tem o seu próprio resultado guardado: `listarFilmes({ pagina: 1 })` e `listarFilmes({ pagina: 2 })` são entradas diferentes no cache. Usamos dois perfis:

| Perfil | Renova a cada | Usado em |
|---|---|---|
| `"hours"` | 1 hora | listas de filmes, busca, detalhes |
| `"days"` | 1 dia | gêneros e streamings |

> A versão 16 do Next.js mudou o jeito de fazer cache. Em tutoriais antigos você verá `fetch(url, { next: { revalidate: 3600 } })`. Com os *Cache Components* ligados (o padrão de projetos novos), o jeito atual é `"use cache"` + `cacheLife`.

### TDD: vermelho → verde

Seguimos o **TDD** (*Test-Driven Development*, desenvolvimento guiado por testes):

1. **Vermelho:** escrevemos os testes primeiro e os rodamos. Eles falharam, porque o `lib/tmdb.js` ainda não existia.
2. **Verde:** escrevemos o código até todos passarem (17 testes).

Ver o teste falhar antes é o que prova que ele testa alguma coisa de verdade. O capítulo 10 aprofunda isso.

## O código comentado

### A função que faz todas as requisições

```js
async function requisitar(caminho, parametros = {}) {
  const token = process.env.TMDB_TOKEN;                // lê o .env.local
  if (!token) {
    throw new Error("Configure a variável TMDB_TOKEN no arquivo .env.local");
  }

  const busca = new URLSearchParams({ language: "pt-BR" });   // sempre em português
  for (const [chave, valor] of Object.entries(parametros)) {  // como "for chave, valor in d.items()"
    if (valor !== null && valor !== undefined) busca.set(chave, valor);  // pula valores vazios
  }

  const resposta = await fetch(`${URL_BASE}${caminho}?${busca}`, {
    headers: { Authorization: "Bearer " + token },
    signal: AbortSignal.timeout(TEMPO_LIMITE_MS),   // desiste depois de 10 segundos
  });

  if (resposta.status === 404) return null;         // "não encontrado" não é um erro grave
  if (!resposta.ok) {
    throw new Error(`Erro ao consultar o TMDB (status ${resposta.status})`);
  }
  return resposta.json();
}
```

- `` `...${variavel}...` `` é uma *template string*, igual à f-string do Python (`f"...{variavel}..."`).
- `throw new Error(...)` é o `raise Exception(...)` do JavaScript.

### Listar filmes com filtros

```js
const ORDENACOES = {
  popularidade: { sort_by: "popularity.desc" },
  nota: { sort_by: "vote_average.desc", "vote_count.gte": 200 },  // exige 200 votos
  lancamento: { sort_by: "primary_release_date.desc" },
};

export async function listarFilmes({ streamings, genero, ordem, pagina }) {
  ...
  const dados = await requisitar("/discover/movie", {
    watch_region: "BR",
    with_watch_providers: streamings.join("|"),       // [8, 119] vira "8|119" ("OU")
    with_watch_monetization_types: "flatrate",        // só assinatura
    with_genres: genero,                              // se for null, é ignorado
    ...ORDENACOES[ordem],                             // espalha sort_by (e vote_count.gte)
    ...extras,                                        // data limite para "lançamento"
    page: pagina,
  });
  return paraLista(dados);
}
```

- `{ streamings, genero, ordem, pagina }` nos parâmetros é uma **desestruturação**: a função recebe um objeto e já separa os campos. É como receber um `dict` e fazer `streamings = filtros["streamings"]` para cada chave.
- `...objeto` (*spread*) copia as chaves de um objeto para dentro de outro, como o `{**dic}` do Python.

### Um teste, por dentro

```js
test("ordem nota exige no mínimo 200 votos", async () => {
  responder(listaVazia);                                   // o fetch falso vai devolver isto
  await listarFilmes({ ...filtrosBase, ordem: "nota" });   // chama a função de verdade
  const params = urlChamada().searchParams;                // pega a URL que ela montou
  expect(params.get("sort_by")).toBe("vote_average.desc");
  expect(params.get("vote_count.gte")).toBe("200");
});
```

O `vi.stubGlobal("fetch", fetchMock)` troca o `fetch` verdadeiro pelo falso durante o teste. Em Python, seria o `unittest.mock.patch("requests.get")`.

## Erros comuns

| Problema | Causa e solução |
|---|---|
| `await is only valid in async functions` | Você usou `await` numa função sem `async`. Coloque `async` antes de `function`. |
| A resposta vem como `Promise { <pending> }` | Faltou o `await` antes do `fetch` ou do `.json()`. |
| Erro 401 do TMDB | Token errado. Veja o capítulo 01. |
| Busca com `&` traz resultados estranhos | A URL foi montada "na mão" com `+`. Use `URLSearchParams`. |

## Para praticar

Adicione à função `listarFilmes` um parâmetro opcional `ano`, que filtre pelo ano de lançamento (o TMDB usa o parâmetro `primary_release_year`). Comece pelo teste: escreva um teste em `tests/lib/tmdb.test.js` que chame `listarFilmes({ ...filtrosBase, ano: 1999 })` e confira `primary_release_year === "1999"`. Veja-o falhar, depois faça-o passar.
