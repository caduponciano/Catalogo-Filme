# 00 — Visão geral e glossário

## O que estamos construindo

Um **catálogo de filmes** que mostra o que está disponível agora nos principais streamings do Brasil (Netflix, Prime Video, Disney+, Max, Globoplay…). Os dados vêm do **TMDB** (The Movie Database), um site colaborativo de filmes que oferece uma API gratuita. As informações de "onde assistir" o TMDB recebe do **JustWatch**.

O que dá para fazer no site:

- navegar pelos filmes de um streaming específico;
- filtrar por gênero;
- ordenar por popularidade, nota ou lançamento;
- buscar um filme pelo nome;
- abrir a página de um filme com sinopse, elenco, trailer e onde assistir.

Este material acompanha o projeto etapa por etapa. Cada capítulo foi escrito logo depois de a etapa ficar pronta, usando o código real.

## O mapa do projeto

```
Navegador ──pede /?streaming=8&genero=28──▶ Next.js (servidor)
                                               │
                                               ▼
                                   lib/tmdb.js ──▶ API do TMDB
                                               │
                                               ▼
Navegador ◀──── página pronta ──────── componentes React
```

1. Você abre um endereço no navegador.
2. O **servidor** do Next.js recebe o pedido.
3. O servidor pede os dados ao TMDB (é aqui que a chave secreta é usada — ela nunca sai do servidor).
4. Com os dados, o servidor monta a página usando **componentes React** e devolve o HTML pronto.

Se você já viu Flask: é a mesma ideia de uma rota que busca dados e preenche um template. A diferença é que, em vez de templates Jinja, usamos componentes React escritos em JavaScript.

## Capítulos

| # | Capítulo |
|---|---|
| 00 | [Visão geral e glossário](00-visao-geral.md) (este) |
| 01 | [Preparando o ambiente](01-ambiente.md) |
| 02 | [Criando o projeto Next.js](02-projeto-nextjs.md) |
| 03 | [Conversando com a API](03-api-tmdb.md) |
| 04 | [A primeira página: o catálogo](04-catalogo.md) |
| 05 | [Filtros e ordenação](05-filtros.md) |
| 06 | [Paginação](06-paginacao.md) |
| 07 | [Busca](07-busca.md) |
| 08 | [Página do filme](08-pagina-do-filme.md) |
| 09 | [Quando algo dá errado](09-erros-e-cache.md) |
| 10 | [Testes](10-testes.md) |
| 11 | [Publicando na Vercel](11-publicacao.md) |

## Glossário

Os termos estão em ordem alfabética. Cada capítulo acrescenta os seus.

| Termo | O que é |
|---|---|
| **API** | Uma "porta de entrada" que um sistema oferece para outros programas pedirem dados. O TMDB tem uma API: mandamos um pedido e recebemos dados de filmes. |
| **Branch** | Uma linha de trabalho separada no Git. Trabalhamos na branch `feat/catalogo-v1` e, no fim, juntamos tudo na `main`. |
| **Commit** | Uma "foto" do projeto salva no Git, com uma mensagem dizendo o que mudou. |
| **Componente** | Uma função JavaScript que devolve um pedaço de interface (um cartão de filme, um botão…). Componentes se combinam para formar páginas. |
| **Git** | Programa que guarda o histórico de versões do projeto. Permite voltar no tempo e ver o que mudou. |
| **JSON** | Formato de texto para trocar dados. Parece muito um `dict` do Python: `{"title": "Matrix", "year": 1999}`. |
| **Navegador** | O programa onde o site aparece (Chrome, Edge, Firefox). Também chamado de *cliente*. |
| **Next.js** | Framework que junta React (a interface) com um servidor (que busca dados). É o "Flask + templates" deste projeto. |
| **Node.js** | Programa que roda JavaScript fora do navegador. É o "interpretador Python" do JavaScript. |
| **npm** | Gerenciador de pacotes do Node.js. É o "pip" do JavaScript. |
| **React** | Biblioteca para montar interfaces com componentes. |
| **Requisição** | Um pedido feito a um servidor ("me dê a página X", "me dê os filmes da Netflix"). A resposta volta com os dados ou com um erro. |
| **Rota** | Um endereço do site (`/`, `/busca`, `/filme/603`) ligado ao código que monta aquela página. |
| **Servidor** | O computador (ou programa) que recebe as requisições e devolve as respostas. No nosso caso, o Next.js. |
| **Teste automático** | Um pequeno programa que confere se outro pedaço de código faz o que deveria. Roda com `npm test`. |
