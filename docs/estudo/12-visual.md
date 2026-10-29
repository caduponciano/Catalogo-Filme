# 12 — Deixando o site bonito

## O que fizemos

O site ganhou nome, **CINEMINHA**, e um visual novo, inspirado na página inicial do Prime Video:

- fundo vinho com "brilhos" de laranja e rosa, como luz de projetor;
- um **filme em destaque** no topo do catálogo, com a imagem de fundo do filme, degradê, nota, sinopse curta e o botão **Ver detalhes**;
- a imagem de fundo do filme ocupando o topo da página de detalhes;
- fontes com personalidade (**Bricolage Grotesque** nos títulos, **Inter** nos textos);
- cartões, filtros, paginação e avisos com as cores novas e um brilho âmbar ao passar o mouse.

## Por que fizemos assim

- **O visual antigo parecia genérico.** Cinza escuro, tudo com o mesmo peso, nenhuma imagem grande. Sites de streaming têm personalidade porque **as imagens dos filmes dominam a tela** e as cores conversam com elas.
- **A paleta foi escolhida comparando opções.** Montamos três mockups (Noite de cinema, Pôr do sol e Azul elétrico) com imagens reais e escolhemos o "Pôr do sol": quente, com cara de sessão de cinema.
- **As cores viraram variáveis.** Todas ficam no `:root` do `globals.css`. Para mudar o âmbar do site inteiro, basta mudar uma linha.
- **O destaque muda com os filtros.** Ele é o primeiro filme da lista atual que tem imagem de fundo. Filtrando por Netflix, o destaque é o filme mais popular da Netflix. Ele só aparece na página 1, para não se repetir.
- **Os filtros continuam funcionando igual.** Só o visual mudou, então os testes de antes continuaram valendo.

## Conceitos novos

### Variáveis CSS (*custom properties*)

```css
:root {
  --ambar: #ffb347;
  --tinta: #2a0f2e;
}

.botao {
  background: var(--ambar);
  color: var(--tinta);
}
```

`--nome: valor` cria uma variável; `var(--nome)` usa. É como uma constante em Python que todo o CSS enxerga.

### Degradês

```css
background: linear-gradient(90deg, #ffb347, #ff5e8a);   /* em linha reta, da esquerda para a direita */
background: radial-gradient(60vw 50vh at 10% -10%, rgba(255, 120, 60, 0.22), transparent 70%);   /* em círculo */
```

- `linear-gradient(direção, cor1, cor2, ...)` vai de uma cor a outra em linha reta.
- `radial-gradient(tamanho at posição, cor, ...)` sai de um ponto, como uma luz. É assim que fizemos os "brilhos" do fundo.
- Dá para **empilhar** vários degradês separados por vírgula: o primeiro fica por cima.
- `rgba(255, 120, 60, 0.22)` é uma cor com transparência: o último número vai de 0 (invisível) a 1 (sólido).

### Texto em degradê (o logo)

```css
.marca {
  background: linear-gradient(90deg, var(--ambar), var(--rosa));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

O degradê é pintado no fundo, "recortado" no formato das letras (`background-clip: text`), e o texto fica transparente para o degradê aparecer.

### O "véu" sobre a imagem

No destaque, a imagem fica embaixo e uma camada de degradês fica por cima:

```css
.veu {
  position: absolute;
  inset: 0;                    /* ocupa todo o espaço do pai */
  background:
    linear-gradient(90deg, var(--fundo) 0%, rgba(42, 15, 46, 0.75) 35%, transparent 75%),
    linear-gradient(0deg, var(--fundo) 0%, transparent 55%);
}
```

O primeiro degradê escurece a esquerda, onde fica o texto, para ele ficar legível. O segundo escurece a parte de baixo, e a imagem parece "derreter" no fundo.

### Máscara: sumir sem deixar linha

Na página do filme, a imagem de fundo precisava desaparecer suavemente. Um degradê de cor deixava uma "linha" visível, porque o fundo da página também é um degradê. A solução foi uma **máscara**:

```css
mask-image: linear-gradient(to bottom, #000 45%, transparent 100%);
```

Onde a máscara é preta, a imagem aparece; onde é transparente, a imagem some. Assim ela some de verdade, mostrando o que estiver atrás.

### `position: absolute` e a imagem que ocupa a largura toda

```css
.capa {
  position: absolute;
  left: 50%;
  width: 100vw;                 /* 100% da largura da tela */
  transform: translateX(-50%);  /* volta metade para a esquerda: fica centralizada */
}
```

O conteúdo do site tem largura máxima de 1200px, mas a capa precisa ir de ponta a ponta. `100vw` é a largura da janela. No `body`, `overflow-x: clip` evita que isso crie uma barra de rolagem lateral.

### Cabeçalho fixo com desfoque

```css
.cabecalho {
  position: sticky;            /* gruda no topo ao rolar */
  top: 0;
  background: rgba(26, 11, 32, 0.72);
  backdrop-filter: blur(14px); /* desfoca o que passa por trás */
}
```

### Fontes do Google com `next/font`

```jsx
import { Bricolage_Grotesque, Inter } from "next/font/google";

const fonteTitulo = Bricolage_Grotesque({ subsets: ["latin"], variable: "--fonte-titulo" });
const fonteTexto = Inter({ subsets: ["latin"], variable: "--fonte-texto" });

<html lang="pt-BR" className={`${fonteTitulo.variable} ${fonteTexto.variable}`}>
```

O Next.js baixa as fontes no build e as serve pelo próprio site, sem depender do Google a cada visita. A opção `variable` cria uma variável CSS com o nome da fonte, usada assim:

```css
h1 { font-family: var(--fonte-titulo), system-ui, sans-serif; }
```

### `clamp()`: tamanho que se adapta

```css
font-size: clamp(2rem, 5vw, 3.4rem);
```

"5% da largura da tela, mas nunca menos que 2rem nem mais que 3.4rem." O título fica grande no computador e cabe no celular, sem precisar de `@media`.

## O código comentado

### Escolher o destaque — `lib/formatar.js`

```js
export function escolherDestaque(filmes) {
  return filmes.find((filme) => filme.backdrop_path) ?? null;   // o 1º com imagem de fundo
}
```

### Encurtar a sinopse sem cortar palavras

```js
export function resumir(texto, limite) {
  if (!texto) return "";
  if (texto.length <= limite) return texto;
  const corte = texto.lastIndexOf(" ", limite);          // último espaço antes do limite
  return texto.slice(0, corte > 0 ? corte : limite) + "…";
}
```

`lastIndexOf(" ", limite)` procura o último espaço **até** a posição `limite`, como o `rfind(" ", 0, limite)` do Python.

### O componente `Destaque`

```jsx
<section className={estilos.destaque}>
  <Image src={urlImagem(filme.backdrop_path, "w1280")} alt={"Cena de " + filme.title} fill preload ... />
  <div className={estilos.veu} />
  <div className={estilos.conteudo}>
    <span className={estilos.selo}>★ {formatarNota(filme.vote_average)} · Em alta</span>
    <h2>{filme.title}</h2>
    <p>{resumir(filme.overview, TAMANHO_SINOPSE)}</p>
    <Link href={`/filme/${filme.id}`}>Ver detalhes</Link>
  </div>
</section>
```

- `fill` faz a imagem ocupar todo o espaço do pai (que precisa ter `position: relative`).
- `preload` pede ao navegador para baixar essa imagem primeiro, porque ela é a primeira coisa que aparece. No Next.js 16, essa opção substituiu a antiga `priority`.

Na página do catálogo:

```jsx
const destaque = filtros.pagina === 1 ? escolherDestaque(filmes) : null;
...
{destaque && <Destaque filme={destaque} />}
```

## Erros comuns

| Problema | Causa e solução |
|---|---|
| O texto do destaque fica ilegível sobre a imagem | Falta o "véu" de degradê por cima da imagem, ou ele está claro demais. |
| A imagem com `fill` não aparece ou cobre a página toda | O elemento pai precisa de `position: relative` (ou `absolute`) e de um tamanho. |
| Aparece uma barra de rolagem lateral | Algo com `100vw` passou da tela. Use `overflow-x: clip` no `body`. |
| O texto em degradê aparece como um retângulo colorido | Faltou `background-clip: text` (e a versão `-webkit-`) ou `color: transparent`. |
| A fonte nova não aparece | A classe `fonte.variable` precisa estar no `<html>`, e o CSS precisa usar `var(--fonte-titulo)`. |

## Para praticar

1. Mude a paleta: troque `--ambar` e `--rosa` no `globals.css` por outras cores e veja o site inteiro mudar.
2. Faça os streamings aparecerem como **pílulas clicáveis** acima da grade, em vez da lista de seleção. Dica: cada pílula pode ser um `<Link>` para `/?streaming=8` (use o `paraQuery` para manter os outros filtros), com um estilo diferente para a pílula do streaming escolhido.
