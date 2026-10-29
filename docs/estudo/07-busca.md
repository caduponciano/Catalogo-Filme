# 07 — Busca

## O que fizemos

O cabeçalho ganhou uma caixa **Buscar filme…** que aparece em todas as páginas. Ao buscar, você vai para `/busca?q=matrix`, que mostra os resultados na mesma grade do catálogo, com paginação. Criamos a página `app/busca/page.jsx` e a função `lerBusca`.

## Por que fizemos assim

- **Uma rota nova, as mesmas peças.** A busca reaproveita `GradeFilmes`, `Paginacao` e `lerPagina`. Só o que é realmente novo foi escrito: a leitura do termo e a página em si.
- **A busca fica no `layout.jsx`.** Assim ela aparece em todas as páginas sem repetir código.
- **A busca não filtra por streaming.** A busca do TMDB não aceita esse filtro. Filtrar por conta própria exigiria uma chamada extra para cada resultado (cerca de 20 por busca). Decidimos mostrar todos os resultados; a página de cada filme (capítulo 08) diz onde ele está disponível.
- **Termo vazio não chama o TMDB.** Se a busca estiver vazia (ou só com espaços), mostramos "Digite o nome de um filme para buscar" sem gastar uma requisição.

## Conceitos novos

### Uma segunda rota

Basta criar a pasta e o arquivo:

```
app/
  page.jsx          → /
  busca/
    page.jsx        → /busca
```

### Layout compartilhado

Tudo o que está no `app/layout.jsx` envolve **todas** as páginas. O conteúdo de cada página entra no lugar do `{children}`:

```jsx
<header>... caixa de busca ...</header>
<main>{children}</main>        {/* aqui entra o catálogo, a busca ou o filme */}
<footer>... créditos ...</footer>
```

### O formulário de busca

```jsx
<form method="get" action="/busca" role="search">
  <input type="search" name="q" placeholder="Buscar filme…" aria-label="Buscar filme" />
  <button type="submit">Buscar</button>
</form>
```

- `action="/busca"`: ao enviar, o navegador vai para `/busca?q=<o que foi digitado>`.
- `role="search"`: avisa aos leitores de tela que este formulário é a busca do site.
- `aria-label`: o campo não tem um `<label>` visível, então o `aria-label` dá a ele um nome para leitores de tela (e para os testes).

### `trim()` × `strip()`

```js
"  matrix  ".trim()   // "matrix"
```

É o `strip()` do Python. Por isso, buscar só espaços vira busca vazia.

### `metadata` de uma página

```jsx
export const metadata = { title: "Busca — Catálogo de Filmes" };
```

Define o título que aparece na aba do navegador nesta página.

## O código comentado

### `lerBusca` — `lib/filtros.js`

```js
export function lerBusca(searchParams) {
  return {
    termo: (primeiro(searchParams.q) ?? "").trim(),   // sem q → "", e tira os espaços
    pagina: lerPagina(searchParams.pagina),           // a mesma validação do catálogo
  };
}
```

### A página — `app/busca/page.jsx`

```jsx
async function Resultados({ searchParams }) {
  const { termo, pagina } = lerBusca(await searchParams);

  if (!termo) {                                   // "" conta como falso
    return <p>Digite o nome de um filme para buscar</p>;
  }

  const { filmes, totalPaginas } = await buscarFilmes(termo, pagina);

  return (
    <>
      <h1>Resultados para “{termo}”</h1>
      <GradeFilmes filmes={filmes} mensagemVazia={"Nenhum filme encontrado para “" + termo + "”."} />
      <Paginacao pagina={pagina} totalPaginas={totalPaginas} caminho="/busca" parametros={{ q: termo }} />
    </>
  );
}
```

Repare que o termo aparece na tela com `{termo}`. O React **escapa** automaticamente o texto: se alguém buscar `<script>`, isso aparece como texto, e não é executado.

O `<>...</>` é um **Fragment**: agrupa vários elementos sem criar uma `<div>` extra no HTML.

## Erros comuns

| Problema | Causa e solução |
|---|---|
| A busca vai para `/?q=...` em vez de `/busca?q=...` | Falta `action="/busca"` no formulário. |
| A página de busca dá erro com `q` vazio | O código chamou o TMDB sem termo. Teste o `if (!termo)` antes. |
| "Próxima" na busca volta para o catálogo | A `Paginacao` recebeu `caminho="/"`. Use `caminho="/busca"`. |

## Para praticar

Depois de buscar, a caixa de busca fica vazia. Faça o termo continuar escrito lá dentro. Dica: o cabeçalho está no `layout.jsx`, que não recebe `searchParams`. Uma solução é criar um componente cliente (`"use client"`) para a caixa de busca e usar o hook `useSearchParams()` do `next/navigation` para ler o `q` e preenchê-lo como `defaultValue`. Pesquise na documentação do Next.js (`node_modules/next/dist/docs/`) por `use-search-params`.
