# 05 — Filtros e ordenação

## O que fizemos

Acima da grade, agora há três campos — **Streaming**, **Gênero** e **Ordenar por** — e o botão **Filtrar**. Ao filtrar, o endereço muda para algo como `/?streaming=8&genero=35&ordem=nota`, e a grade mostra o resultado. Criamos o `lib/filtros.js`, que lê e valida esses parâmetros, e o componente `Filtros`.

## Por que fizemos assim

- **O estado mora na URL.** O filtro escolhido fica no endereço. Isso dá de graça: link compartilhável ("olha as comédias da Netflix"), botão "voltar" funcionando e página que sobrevive a um F5.
- **Formulário HTML simples, sem JavaScript no navegador.** O próprio navegador transforma os campos em parâmetros da URL. Menos código, menos coisa para dar errado.
- **Validação rigorosa.** Qualquer pessoa pode digitar qualquer coisa na URL (`?pagina=abc`, `?streaming=99999`). O `lerFiltros` descarta o que não é válido e usa o padrão, em vez de quebrar ou mostrar uma lista vazia sem explicação.
- **A página volta para a 1 ao filtrar.** O formulário não envia o campo `pagina`, então um filtro novo sempre começa do início.

## Conceitos novos

### Formulário GET

```html
<form method="get" action="/">
  <select name="genero">...</select>
  <button type="submit">Filtrar</button>
</form>
```

Ao clicar em **Filtrar**, o navegador pega o `name` e o valor escolhido de cada campo e vai para `/?genero=35`. Nenhuma linha de JavaScript é necessária.

### Parâmetros da URL × `request.args` do Flask

| Flask | Next.js |
|---|---|
| `request.args.get("genero")` | `(await searchParams).genero` |
| `request.args.getlist("genero")` | se o parâmetro se repetir, `searchParams.genero` já é uma lista |

O `searchParams` é uma **Promise** (capítulo 03), então precisa de `await`.

### `<Suspense>`: o que mostrar enquanto espera

No Next.js 16, uma página que lê a URL (`searchParams`) precisa dizer o que mostrar enquanto os dados não chegam. Fazemos isso com o `<Suspense>`:

```jsx
export default function PaginaCatalogo({ searchParams }) {
  return (
    <>
      <h1>Filmes nos streamings</h1>                       {/* aparece na hora */}
      <Suspense fallback={<p>Carregando filmes…</p>}>       {/* "reserva" enquanto espera */}
        <Catalogo searchParams={searchParams} />           {/* chega quando os dados chegarem */}
      </Suspense>
    </>
  );
}
```

O título aparece imediatamente; a mensagem "Carregando filmes…" ocupa o lugar da grade até o TMDB responder.

### Validar entrada: nunca confie na URL

```js
function lerInteiro(valor) {
  const texto = primeiro(valor);                               // se vier uma lista, pega o 1º
  return /^\d+$/.test(texto ?? "") ? Number(texto) : null;     // só dígitos, nada de "1.5" ou "-2"
}
```

- `/^\d+$/` é uma **expressão regular**: "do começo (`^`) ao fim (`$`), um ou mais dígitos (`\d+`)". Igual ao `re.fullmatch(r"\d+", texto)` do Python.
- `texto ?? ""` significa "use `texto`, mas se ele for `null`/`undefined`, use `""`".

### Funções puras

Uma função **pura** só depende do que recebe e só devolve um valor, sem mexer em nada fora dela. `lerFiltros(searchParams, listas)` é pura: mesma entrada, mesma saída, sempre. Por isso os testes dela são simples — nada de `fetch` falso, nada de servidor:

```js
test("ignora streaming e gênero fora da lista", () => {
  const filtros = lerFiltros({ streaming: "99999", genero: "1" }, listas);
  expect(filtros.streaming).toBeNull();
  expect(filtros.genero).toBeNull();
});
```

## O código comentado

### `lib/filtros.js`

```js
export function lerFiltros(searchParams, { streamings, generos }) {
  const ordem = primeiro(searchParams.ordem);
  return {
    streaming: lerIdDaLista(searchParams.streaming, streamings),   // só aceita IDs conhecidos
    genero: lerIdDaLista(searchParams.genero, generos),
    ordem: ORDENS.includes(ordem) ? ordem : "popularidade",        // "x in lista" do Python
    pagina: lerPagina(searchParams.pagina),                        // de 1 a 500
  };
}
```

### A página — `app/page.jsx`

```jsx
async function Catalogo({ searchParams }) {
  const [streamings, generos] = await Promise.all([listarStreamings(), listarGeneros()]);
  ...
  const filtros = lerFiltros(await searchParams, { ... });

  const { filmes } = await listarFilmes({
    streamings: filtros.streaming ? [filtros.streaming] : todosOsStreamings,  // um ou todos
    ...
  });
```

- `Promise.all([...])` dispara as duas requisições **ao mesmo tempo** e espera as duas terminarem. Mais rápido que esperar uma e depois a outra.
- `const [a, b] = ...` é desestruturação de lista, como `a, b = ...` em Python.

### `components/Filtros.jsx`

```jsx
<select name="streaming" defaultValue={filtros.streaming ?? ""}>
  <option value="">Todos os streamings</option>
  {streamings.map((s) => (
    <option key={s.id} value={s.id}>{s.nome}</option>
  ))}
</select>
```

O `defaultValue` deixa marcada a opção atual, para o usuário ver qual filtro está ativo.

## Erros comuns

| Problema | Causa e solução |
|---|---|
| Aviso "Uncached data was accessed outside of `<Suspense>`" | A página lê `searchParams` fora de um `<Suspense>`. Mova a leitura para um componente filho envolto em `<Suspense>`, como fizemos. |
| O filtro não é aplicado | O `name` do `<select>` não bate com o que o `lerFiltros` lê (`streaming`, `genero`, `ordem`). |
| `?genero=28&genero=12` quebra a página | O parâmetro veio como lista. Use uma função como `primeiro(valor)`. |

## Para praticar

Adicione a ordenação **"Mais votados"** (o TMDB chama de `vote_count.desc`). Você vai mexer em três lugares: na lista `ORDENS` de `lib/filtros.js`, no `ORDENACOES` de `lib/tmdb.js` e no `ORDENACOES` de `components/Filtros.jsx`. Comece pelos testes: um em `tests/lib/filtros.test.js` (aceitar `ordem: "votos"`), outro em `tests/lib/tmdb.test.js` (o `sort_by` certo) e outro em `tests/components/Filtros.test.jsx` (a opção aparecer).
