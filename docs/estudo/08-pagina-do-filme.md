# 08 — Página do filme

## O que fizemos

Clicar num cartão agora abre `/filme/603`, com pôster, título, ano, duração, gêneros, nota, sinopse, **onde assistir** (logotipos dos streamings), o **trailer** do YouTube e o **elenco** principal. Se o filme não estiver em nenhum dos principais streamings, aparece: "Este filme não está disponível em nenhum streaming no Brasil no momento." Endereços inválidos (`/filme/abc`) ou de filmes inexistentes mostram a página "não encontrado".

## Por que fizemos assim

- **Uma chamada só ao TMDB.** O parâmetro `append_to_response=credits,videos,watch/providers` faz o TMDB devolver detalhes, elenco, vídeos e "onde assistir" numa resposta só, em vez de quatro.
- **Validar o ID antes de chamar o TMDB.** `/filme/abc` nem chega a gastar uma requisição: o `lerIdFilme` recusa o valor e a página chama `notFound()`.
- **Só os principais streamings, só assinatura.** O TMDB lista dezenas de serviços, incluindo lojas de aluguel. Mostramos apenas os mesmos 12 dos filtros do catálogo, e apenas quando o filme está incluído na assinatura (`flatrate`).
- **Trailer em português, senão em inglês.** A função `escolherTrailer` decide; se não houver trailer, a seção some.

## Conceitos novos

### Rotas dinâmicas: `[id]`

```
app/filme/[id]/page.jsx   →   /filme/603, /filme/550, /filme/qualquer-coisa
```

Os colchetes dizem "esta parte do endereço varia". O valor chega em `params.id` (como texto!). No Flask seria:

```python
@app.route("/filme/<int:id>")
def filme(id): ...
```

O Flask converte e valida o `int` para você; aqui, fazemos isso com o `lerIdFilme`.

### Encadeamento opcional `?.`

```js
detalhes["watch/providers"]?.results?.BR
```

"Pegue `results`, e dele pegue `BR` — mas, se algo no caminho não existir, pare e devolva `undefined` em vez de dar erro." Em Python seria algo como `d.get("watch/providers", {}).get("results", {}).get("BR")`.

Junto com ele aparece o `??`: `detalhes.credits?.cast ?? []` significa "o elenco, ou uma lista vazia se não houver".

### `slice` × fatiamento do Python

```js
elenco.slice(0, 10)   // lista[:10]
```

### `filter(Boolean)`

```js
[extrairAno(...), formatarDuracao(...), generos].filter(Boolean)
```

Remove os itens "vazios" (`""`, `null`). Assim, um filme sem duração mostra "1999 · Drama" em vez de "1999 ·  · Drama". Em Python: `[x for x in lista if x]`.

### `notFound()`

```js
if (!detalhes) notFound();
```

Interrompe a página e mostra a página "não encontrado" do Next.js (no capítulo 09 vamos personalizá-la).

### `iframe` para incorporar vídeos

```jsx
<iframe src={"https://www.youtube.com/embed/" + trailer} title={"Trailer de " + detalhes.title} allowFullScreen />
```

Um `iframe` é uma "janela" para outra página dentro da sua. O YouTube oferece o endereço `/embed/<key>` justamente para isso.

### `generateMetadata`

```js
export async function generateMetadata({ params }) {
  ...
  return { title: `${detalhes.title} — Catálogo de Filmes` };
}
```

Como o título da aba depende do filme, usamos uma **função** em vez do objeto `metadata` fixo. Graças ao cache do `detalhesFilme`, essa chamada e a da página não pedem os dados duas vezes ao TMDB.

## O código comentado

### Escolher o trailer — `lib/formatar.js`

```js
export function escolherTrailer(videos = []) {
  const trailers = videos.filter((v) => v.site === "YouTube" && v.type === "Trailer");
  const escolhido =
    trailers.find((v) => v.iso_639_1 === "pt") ??     // primeiro, um em português…
    trailers.find((v) => v.iso_639_1 === "en");       // …senão, um em inglês
  return escolhido ? escolhido.key : null;
}
```

`find` devolve o **primeiro** item que satisfaz a condição, ou `undefined`. É como `next((v for v in trailers if ...), None)` em Python.

### Onde assistir — `lib/formatar.js`

```js
export function ondeAssistir(provedoresBR, idsPrincipais) {
  const lista = (provedoresBR?.flatrate ?? [])                       // só assinatura
    .filter((p) => idsPrincipais.includes(p.provider_id))            // só os 12 principais
    .map((p) => ({ id: p.provider_id, nome: p.provider_name, logo: p.logo_path }));
  return { lista, link: lista.length > 0 ? (provedoresBR.link ?? null) : null };
}
```

Os métodos encadeados (`.filter(...).map(...)`) funcionam como uma linha de montagem: cada um recebe o resultado do anterior.

### A página — `app/filme/[id]/page.jsx`

```jsx
async function Filme({ params }) {
  const id = lerIdFilme((await params).id);
  if (!id) notFound();                                   // "abc", "-5", "1.5" param aqui

  const [detalhes, streamings] = await Promise.all([detalhesFilme(id), listarStreamings()]);
  if (!detalhes) notFound();                             // o TMDB respondeu 404
  ...
}
```

E a parte de "onde assistir":

```jsx
{disponivel.lista.length > 0 ? (
  <ul>{disponivel.lista.map((s) => <li key={s.id}><Image src={urlImagem(s.logo, "w92")} alt={s.nome} ... /></li>)}</ul>
) : (
  <p>Este filme não está disponível em nenhum streaming no Brasil no momento.</p>
)}
```

`{trailer && <section>...</section>}`: se `trailer` for `null`, nada é desenhado. É o atalho de renderização condicional mais comum no React.

## Erros comuns

| Problema | Causa e solução |
|---|---|
| `Cannot read properties of undefined (reading 'BR')` | Um nível do caminho não existia. Use `?.` em cada passo. |
| A página mostra "[object Promise]" ou o `id` é `undefined` | Faltou `await params`. |
| O trailer não aparece em nenhum filme | Confira se `include_video_language=pt,en` está na chamada; sem ele, o TMDB só manda vídeos no idioma da requisição. |
| A página "não encontrado" responde com status 200 | Com o carregamento em partes (*streaming*) do Next.js, o status já foi enviado quando o `notFound()` acontece. A página certa aparece, e os buscadores a reconhecem pela marcação. |

## Para praticar

Mostre o **diretor** do filme abaixo do título. Os dados estão em `detalhes.credits.crew`: procure as pessoas com `job === "Director"`. Crie em `lib/formatar.js` uma função `diretores(credits)` que devolva os nomes separados por vírgula, teste-a (inclusive com `credits` sem `crew`) e depois use-a na página.
