# 04 — A primeira página: o catálogo

## O que fizemos

A página inicial agora mostra uma grade com 20 filmes disponíveis nos principais streamings do Brasil, cada um com pôster, título, ano e nota. Criamos dois componentes (`CartaoFilme` e `GradeFilmes`), algumas funções de formatação, o cabeçalho e o rodapé com os créditos obrigatórios ao TMDB e ao JustWatch.

## Por que fizemos assim

- **Componentes pequenos.** O `CartaoFilme` só sabe desenhar um filme; a `GradeFilmes` só sabe organizar vários cartões. Cada um é fácil de entender, testar e reaproveitar — a busca (capítulo 07) vai usar a mesma grade.
- **Formatação separada (`lib/formatar.js`).** Transformar `7.834` em `"7,8"` ou `"1999-03-30"` em `"1999"` não tem nada a ver com React. Funções puras assim são as mais fáceis de testar.
- **Imagem genérica.** Alguns filmes não têm pôster no TMDB; em vez de um buraco na grade, mostramos `public/sem-imagem.svg`.
- **Créditos no rodapé.** Os termos de uso do TMDB exigem o logotipo e o aviso de que o site não é endossado por eles.

## Conceitos novos

### Componente = função que devolve interface

```jsx
export default function CartaoFilme({ filme }) {
  return <Link href={`/filme/${filme.id}`}>...</Link>;
}
```

Pense numa função Python que recebe um `dict` e devolve um pedaço de HTML. É isso — com a vantagem de que o "HTML" (o JSX) é checado pelo JavaScript.

### Props

O que vai entre `{ }` nos parâmetros são as **props** (propriedades). Quem usa o componente as passa como atributos:

```jsx
<CartaoFilme filme={matrix} />
<GradeFilmes filmes={lista} mensagemVazia="Nada aqui." />
```

É como chamar `cartao_filme(filme=matrix)` com argumentos nomeados.

### JSX

JSX parece HTML, mas está dentro do JavaScript. Diferenças que aparecem no projeto:

| HTML | JSX |
|---|---|
| `class="..."` | `className="..."` |
| texto fixo | `{expressao}` insere qualquer valor JavaScript |

### Listas com `map` e a `key`

```jsx
{filmes.map((filme) => (
  <li key={filme.id}>
    <CartaoFilme filme={filme} />
  </li>
))}
```

O `map` transforma cada item de uma lista em outra coisa — aqui, cada filme vira um `<li>`. Em Python: `[f"<li>{f['title']}</li>" for f in filmes]`.

A `key` identifica cada item. O React a usa para saber o que mudou quando a lista é redesenhada. Use sempre algo único e estável, como o `id`.

### Server Component com `async`

Nesta etapa, a página ficou assim (no capítulo 05 ela muda um pouco, para ler os filtros da URL):

```jsx
export default async function Catalogo() {
  const streamings = await listarStreamings();
  const { filmes } = await listarFilmes({
    streamings: streamings.map((s) => s.id),
    genero: null,
    ordem: "popularidade",
    pagina: 1,
  });
  return <GradeFilmes filmes={filmes} />;
}
```

Esta página roda **no servidor**. Por isso ela pode ser `async` e esperar os dados do TMDB antes de devolver o HTML. O navegador recebe a página já pronta.

### `next/image`

O componente `<Image>` do Next.js otimiza as imagens (tamanho certo, carregamento sob demanda). Por segurança, ele só aceita imagens de outros sites se você liberar o endereço no `next.config.mjs`:

```js
images: {
  remotePatterns: [{ protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" }],
},
```

### CSS Modules

Cada componente tem seu `.module.css`. As classes são importadas como um objeto:

```jsx
import estilos from "./CartaoFilme.module.css";
<div className={estilos.info}>
```

O Next.js renomeia as classes por baixo (`CartaoFilme-module__WeSNCa__info`), então uma classe `.info` de um componente nunca conflita com a `.info` de outro.

### Grade responsiva

```css
.grade {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}
```

"Crie quantas colunas couberem, cada uma com no mínimo 150px." No celular cabem duas; num monitor largo, sete ou oito. Nenhuma regra extra para celular é necessária.

## O código comentado

### `lib/formatar.js`

```js
export function urlImagem(caminho, tamanho = "w342") {     // valor padrão, como em Python
  return caminho ? URL_IMAGENS + tamanho + caminho : SEM_IMAGEM;
}
```

`condicao ? a : b` é o operador ternário: o `a if condicao else b` do Python. Um texto vazio (`""`) e `null` contam como "falso", então os dois caem na imagem genérica.

```js
export function formatarNota(nota) {
  return nota ? nota.toFixed(1).replace(".", ",") : "–";   // 7.834 → "7.8" → "7,8"
}
```

### `components/GradeFilmes.jsx`

```jsx
export default function GradeFilmes({
  filmes,
  mensagemVazia = "Nenhum filme encontrado com esses filtros.",   // prop com valor padrão
}) {
  if (filmes.length === 0) {                                   // len(filmes) == 0
    return <p className={estilos.vazia}>{mensagemVazia}</p>;
  }
  return <ul className={estilos.grade}>...</ul>;
}
```

### Testando um componente

```jsx
test("usa a imagem genérica quando não há pôster", () => {
  render(<CartaoFilme filme={{ ...matrix, poster_path: null }} />);
  expect(screen.getByRole("img").getAttribute("src")).toContain("sem-imagem.svg");
});
```

Procuramos os elementos **como um usuário os veria**: pelo papel (`img`, `link`), pelo texto ou pelo nome acessível (`"Pôster de Matrix"`). Assim o teste não quebra se trocarmos uma classe CSS.

## Erros comuns

| Problema | Causa e solução |
|---|---|
| `Invalid src prop ... hostname "image.tmdb.org" is not configured` | Falta liberar o domínio em `images.remotePatterns` no `next.config.mjs`. Reinicie o `npm run dev` depois de mudar o arquivo. |
| Aviso `Each child in a list should have a unique "key" prop` | Faltou a `key` no elemento devolvido pelo `map`. |
| `class` não funciona no JSX | Use `className`. |
| A página fica em branco e o terminal mostra um erro do TMDB | O `.env.local` não está na raiz ou o servidor não foi reiniciado depois de criá-lo. |

## Para praticar

Quando o título original de um filme for diferente do título em português (campo `original_title`), mostre o original em letras menores abaixo do título. Comece por um teste em `tests/components/CartaoFilme.test.jsx`: um filme com `title: "Matrix"` e `original_title: "The Matrix"` deve mostrar os dois textos; um filme com os dois iguais deve mostrar o título uma vez só.
