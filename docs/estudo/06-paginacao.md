# 06 — Paginação

## O que fizemos

Abaixo da grade apareceram os botões **Anterior** e **Próxima** e o texto "Página 2 de 79". Os links mantêm os filtros escolhidos: na página 2 das comédias da Netflix, "Próxima" leva à página 3 **das comédias da Netflix**. Criamos o componente `Paginacao`.

## Por que fizemos assim

- **APIs paginam.** O TMDB tem centenas de milhares de filmes; mandar todos de uma vez seria lento e pesado. Ele devolve 20 por vez e diz quantas páginas existem (`total_pages`).
- **Links de verdade, não botões com JavaScript.** Cada página tem um endereço próprio (`?pagina=3`). Dá para abrir em outra aba, compartilhar e voltar.
- **Sem link quando não faz sentido.** Na primeira página não há "Anterior"; na última, não há "Próxima". No lugar, aparece o texto apagado, para os botões não "pularem" de posição.
- **Limite de 500.** O TMDB não aceita `page` acima de 500. O `lib/tmdb.js` limita o `totalPaginas` e o `lerPagina` limita o que vem na URL.

## Conceitos novos

### `page` e `total_pages`

A resposta do TMDB traz, além dos filmes:

```json
{ "page": 2, "results": [ ... 20 filmes ... ], "total_pages": 79 }
```

O `lib/tmdb.js` transforma isso em `{ filmes, pagina, totalPaginas }`, com nomes em português e o limite de 500 aplicado.

### Spread de objeto `{ ...obj }`

```js
const linkPara = (numero) => `${caminho}?${paraQuery({ ...parametros, pagina: numero })}`;
```

`{ ...parametros, pagina: numero }` cria um objeto novo com tudo o que está em `parametros` e acrescenta (ou substitui) `pagina`. Em Python: `{**parametros, "pagina": numero}`.

### Arrow function

`(numero) => ...` é uma função curta, sem nome — o `lambda numero: ...` do Python. Diferente do `lambda`, ela pode ter várias linhas usando `{ }`.

### Renderização condicional

```jsx
{pagina > 1 ? <Link ...>Anterior</Link> : <span>Anterior</span>}
```

Dentro do JSX, usamos o ternário (`condicao ? a : b`) para escolher o que desenhar. Em um template Jinja seria `{% if pagina > 1 %} ... {% else %} ... {% endif %}`.

E para "não desenhar nada", o componente devolve `null`:

```jsx
if (totalPaginas <= 1) return null;
```

## O código comentado

```jsx
export default function Paginacao({ pagina, totalPaginas, caminho, parametros }) {
  if (totalPaginas <= 1) return null;                // uma página só: nada a paginar

  const linkPara = (numero) => `${caminho}?${paraQuery({ ...parametros, pagina: numero })}`;

  return (
    <nav aria-label="Paginação">                      {/* leitores de tela anunciam "Paginação" */}
      {pagina > 1 ? <Link href={linkPara(pagina - 1)}>Anterior</Link> : <span>Anterior</span>}
      <span>Página {pagina} de {totalPaginas}</span>
      {pagina < totalPaginas ? <Link href={linkPara(pagina + 1)}>Próxima</Link> : <span>Próxima</span>}
    </nav>
  );
}
```

O `caminho` é um parâmetro porque a busca (capítulo 07) vai reaproveitar o mesmo componente com `caminho="/busca"`.

Na página do catálogo:

```jsx
<Paginacao
  pagina={filtros.pagina}
  totalPaginas={totalPaginas}
  caminho="/"
  parametros={{ streaming: filtros.streaming, genero: filtros.genero, ordem: filtros.ordem }}
/>
```

As chaves duplas `{{ ... }}` não são uma sintaxe especial: as externas dizem "aqui vem JavaScript" e as internas são o objeto.

O `paraQuery` (do `lib/filtros.js`) pula os valores vazios. Por isso, sem gênero escolhido, o link fica `/?streaming=8&ordem=nota&pagina=3`, sem `genero=` sobrando.

## Erros comuns

| Problema | Causa e solução |
|---|---|
| A "Próxima" perde o filtro | Os filtros não foram passados em `parametros`. |
| Erro do TMDB ao ir além da página 500 | Falta limitar a página (`lerPagina` e `LIMITE_PAGINAS`). |
| Os botões mudam de lugar entre a primeira e a segunda página | Mostre um `<span>` apagado no lugar do link ausente, como fizemos. |

## Para praticar

Mostre links numerados para as páginas vizinhas, no formato `1 … 4 5 6 … 79`. Sugestão: crie em `lib/` uma função pura `paginasVizinhas(pagina, totalPaginas)` que devolva, por exemplo, `[1, "…", 4, 5, 6, "…", 79]`, e teste-a antes de usá-la no componente. Os casos difíceis são a primeira página, a última e um total menor que 7.
