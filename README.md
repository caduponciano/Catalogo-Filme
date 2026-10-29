# CINEMINHA

Site que mostra os filmes disponíveis **agora** nos principais streamings do Brasil, usando a API do [TMDB](https://www.themoviedb.org).

Projeto de estudo e portfólio, feito com Next.js. O passo a passo completo de como ele foi construído está em [`docs/estudo/`](docs/estudo/00-visao-geral.md).

**No ar:** [catalogo-filme-roan.vercel.app](https://catalogo-filme-roan.vercel.app)

## Funcionalidades

- **Catálogo** dos filmes disponíveis por assinatura nos 12 principais streamings do Brasil.
- **Filtros** por streaming e por gênero.
- **Ordenação** por popularidade, nota ou lançamento.
- **Busca** por nome.
- **Página do filme** com sinopse, nota, duração, gêneros, elenco, trailer e onde assistir.
- Filme em destaque no topo do catálogo, visual em degradê "pôr do sol".
- Paginação, páginas de erro e de "não encontrado", layout para computador e celular.

## Tecnologias

- [Next.js](https://nextjs.org) 16 (App Router, Server Components, Cache Components)
- JavaScript e CSS Modules
- [Vitest](https://vitest.dev) e [React Testing Library](https://testing-library.com) para os testes

## Como rodar

Pré-requisitos: [Node.js](https://nodejs.org) 20 ou mais recente e uma conta gratuita no TMDB.

```bash
npm install
cp .env.example .env.local    # no PowerShell: Copy-Item .env.example .env.local
```

Abra o `.env.local` e cole o seu **API Read Access Token** do TMDB (em *Configurações → API* no site do TMDB):

```
TMDB_TOKEN=seu_token_aqui
```

Depois:

```bash
npm run dev     # site em http://localhost:3000
npm test        # testes automáticos
npm run lint    # verificação de código
npm run build   # versão de produção (precisa do TMDB_TOKEN)
```

## Estrutura

```
app/            páginas (catálogo, busca, filme), layout, erro e "não encontrado"
components/     cartão, grade, filtros e paginação
lib/            tmdb.js (API), filtros.js (URL), formatar.js (texto e imagens)
tests/          testes automáticos
docs/estudo/    material de estudo, um capítulo por etapa
```

## Créditos

Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.
Os dados de onde assistir são fornecidos pelo [JustWatch](https://www.justwatch.com).
