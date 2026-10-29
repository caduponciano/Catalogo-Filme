# 09 — Quando algo dá errado (erros e cache)

## O que fizemos

Criamos duas páginas especiais:

- **`app/error.jsx`**: aparece quando algo falha ao carregar (TMDB fora do ar, token inválido). Mostra "Não foi possível carregar os filmes" e um botão **Tentar novamente**.
- **`app/not-found.jsx`**: aparece quando um filme não existe ou o endereço é inválido. Mostra "Filme não encontrado" e um link **Voltar ao catálogo**.

Também revisamos todas as situações de erro do projeto e como o cache entra nessa história.

## Por que fizemos assim

- **Um erro não deve virar uma tela branca.** Sem o `error.jsx`, o usuário veria uma página genérica do Next.js. Com ele, vê uma mensagem em português e uma saída.
- **"Não encontrado" não é o mesmo que "deu erro".** Um filme inexistente é uma situação normal: o `lib/tmdb.js` devolve `null`, a página chama `notFound()` e o usuário recebe um caminho de volta.
- **A mensagem técnica fica para quem desenvolve.** "Configure a variável TMDB_TOKEN…" aparece no terminal e na sobreposição de erro do modo de desenvolvimento. O visitante do site vê só a mensagem amigável.

## Conceitos novos

### `throw` e `try` × `raise` e `try`

| Python | JavaScript |
|---|---|
| `raise Exception("mensagem")` | `throw new Error("mensagem")` |
| `try: ... except Exception as e: ...` | `try { ... } catch (e) { ... }` |

Não escrevemos nenhum `try/catch` nas páginas: quando o `lib/tmdb.js` lança um erro, o Next.js o "pega" e mostra o `error.jsx` mais próximo. É como um `except` global para cada parte do site.

### Por que o `error.jsx` é um Client Component

```jsx
"use client";
```

Essa linha diz: "este componente também roda no **navegador**". É necessário porque o botão **Tentar novamente** responde a um clique, e cliques acontecem no navegador. Os outros componentes do projeto rodam só no servidor.

O Next.js entrega ao `error.jsx` duas props:

- `error`: o erro que aconteceu;
- `retry`: uma função que tenta carregar aquela parte da página de novo.

> Em versões anteriores do Next.js essa função se chamava `reset`. Na 16.4 o nome é `retry`. Na dúvida, consulte `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`.

### `useEffect`

```jsx
useEffect(() => {
  console.error(error);
}, [error]);
```

Roda um código **depois** que o componente aparece na tela — aqui, registra o erro no console do navegador. O `[error]` diz: "rode de novo só se o `error` mudar".

### Todas as situações de erro do projeto

| Situação | O que acontece |
|---|---|
| `TMDB_TOKEN` ausente | `lib/tmdb.js` lança "Configure a variável TMDB_TOKEN no arquivo .env.local"; o usuário vê o `error.jsx`. |
| TMDB fora do ar, lento demais (mais de 10 s) ou respondendo com erro | `lib/tmdb.js` lança "Erro ao consultar o TMDB (status …)"; o usuário vê o `error.jsx`. |
| Filme inexistente (o TMDB responde 404) | `detalhesFilme` devolve `null`; a página chama `notFound()`. |
| Endereço inválido (`/filme/abc`) | `lerIdFilme` devolve `null`; a página chama `notFound()` sem chamar o TMDB. |
| Parâmetros inválidos (`?pagina=abc`, `?streaming=99999`) | `lib/filtros.js` usa o valor padrão. |
| Filme ou ator sem foto | aparece `public/sem-imagem.svg`. |
| Filtros sem resultado | "Nenhum filme encontrado com esses filtros." |

### Cache, de novo

No capítulo 03 colocamos `"use cache"` + `cacheLife` nas funções do `lib/tmdb.js`. Na prática:

- A **lista de gêneros** é pedida ao TMDB no máximo uma vez por dia. Todos os visitantes usam a mesma resposta guardada.
- Uma página de filmes (ex.: comédias da Netflix, página 2) é pedida no máximo uma vez por hora.
- **Erros não são guardados.** Se o TMDB falhar, a próxima tentativa pede de novo. É isso que faz o botão **Tentar novamente** funcionar.

Durante o `npm run build`, o Next.js já busca e guarda os gêneros e os streamings para montar a "casca" das páginas. Por isso **o build precisa do token**, tanto no seu computador quanto na Vercel (capítulo 11).

Nos testes, o `cacheLife` é substituído por uma função falsa (`vi.mock("next/cache", ...)`), porque fora do Next.js ele não funciona. Os testes só conferem que ele foi chamado com `"hours"` ou `"days"`.

## O código comentado

### `app/error.jsx`

```jsx
"use client"; // páginas de erro precisam rodar no navegador para o botão funcionar

export default function PaginaErro({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h1>Não foi possível carregar os filmes</h1>
      <p>Pode ser uma instabilidade passageira no TMDB.</p>
      <button type="button" onClick={() => retry()}>Tentar novamente</button>
    </div>
  );
}
```

O `onClick={() => retry()}` passa para o botão uma função que será chamada **no clique**. Escrever `onClick={retry()}` (sem a arrow function) chamaria `retry` na hora em que a página é desenhada.

### Testando o botão

```jsx
const retry = vi.fn();                                                     // função "espiã"
render(<PaginaErro error={new Error("x")} retry={retry} />);
fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" })); // simula o clique
expect(retry).toHaveBeenCalledTimes(1);                                    // foi chamada uma vez?
```

### Como testamos de verdade

1. **Sem token, em desenvolvimento:** renomeamos o `.env.local`, rodamos `npm run dev` e vimos a mensagem "Configure a variável TMDB_TOKEN…" no terminal.
2. **Com token inválido, em produção:** `npm run build` e depois o servidor com `TMDB_TOKEN=token-invalido`. O TMDB respondeu 401, e o navegador mostrou "Não foi possível carregar os filmes" com o botão.

## Erros comuns

| Problema | Causa e solução |
|---|---|
| `error.jsx` não funciona e o terminal fala em "Client Component" | Falta a linha `"use client";` no topo do arquivo. |
| O botão dá erro "retry is not a function" | A prop tem outro nome na sua versão do Next.js (`reset` em versões antigas). |
| `npm run build` falha com "Configure a variável TMDB_TOKEN" | O build precisa do token. Crie o `.env.local` (ou cadastre a variável na Vercel). |
| A página de erro não aparece ao testar com `curl` | Ela é desenhada pelo JavaScript do navegador. Teste num navegador de verdade. |

## Para praticar

Em modo de desenvolvimento, quando o problema for o token ausente, mostre na página de erro uma dica extra: "Confira o arquivo .env.local (capítulo 01)". Dicas: `process.env.NODE_ENV === "development"` diz se você está em desenvolvimento, e `error.message` traz o texto do erro. Escreva primeiro o teste em `tests/app/error.test.jsx`, passando um `new Error("Configure a variável TMDB_TOKEN no arquivo .env.local")`.
