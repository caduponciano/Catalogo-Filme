# 11 — Publicando na Vercel

## O que fizemos

Neste capítulo o site vai para o ar, com um endereço público para o portfólio. O código vai para um repositório no **GitHub**, e a **Vercel** passa a construir e publicar o site a partir dele. A cada `git push`, a Vercel publica a versão nova sozinha.

## Por que fizemos assim

- **GitHub** guarda o código na nuvem e é onde recrutadores e colegas olham projetos de portfólio. O material de estudo aparece formatado lá.
- **Vercel** é da mesma empresa que criou o Next.js. Ela entende o projeto sem configuração e tem um plano gratuito para projetos pessoais.
- **O token não vai junto com o código.** O `.env.local` está no `.gitignore`. Na Vercel, o token é cadastrado à parte, como **variável de ambiente**.

## Conceitos novos

### Deploy

*Deploy* (ou "publicação") é pegar o código e colocá-lo num servidor acessível pela internet. Na Vercel, isso acontece em três passos automáticos:

1. baixar o código do GitHub;
2. rodar `npm install` e `npm run build`;
3. ligar o servidor e apontar o endereço público para ele.

### Repositório remoto e `push`

Até aqui, o Git guardava o histórico só no seu computador. Um **repositório remoto** é uma cópia no GitHub.

```powershell
git remote add origin https://github.com/SEU_USUARIO/catalogo-filmes.git   # liga ao GitHub (uma vez só)
git push -u origin main                                                    # envia a branch main
```

Depois da primeira vez, basta `git push`.

### Variáveis de ambiente na Vercel

O `.env.local` existe só no seu computador. Na Vercel, você cadastra o mesmo nome e valor (`TMDB_TOKEN`) nas configurações do projeto. O código continua lendo `process.env.TMDB_TOKEN`, sem mudar nada.

> **Importante:** cadastre o `TMDB_TOKEN` **antes** do primeiro deploy. Como vimos no capítulo 09, o `npm run build` busca os streamings e os gêneros no TMDB, então o build falha sem o token.

## Passo a passo

### 1. Juntar a branch na `main`

O trabalho foi feito na branch `feat/catalogo-v1`. Antes de publicar, ela é juntada (*merge*) à `main`:

```powershell
git switch main
git merge feat/catalogo-v1
```

### 2. Conferir que o token não vai junto

```powershell
git ls-files | Select-String "env"
```

Deve aparecer **só** o `.env.example`. Se aparecer `.env.local`, pare: ele não pode ir para o GitHub.

### 3. Criar o repositório no GitHub e enviar o código

1. Em [github.com/new](https://github.com/new), crie um repositório chamado `catalogo-filmes` (público, para o portfólio), **sem** README, `.gitignore` ou licença, porque o projeto já os tem.
2. No terminal:
   ```powershell
   git remote add origin https://github.com/SEU_USUARIO/catalogo-filmes.git
   git push -u origin main
   ```

### 4. Importar na Vercel

1. Entre em [vercel.com](https://vercel.com) com a sua conta do GitHub.
2. **Add New… → Project** e escolha o repositório `catalogo-filmes`.
3. Antes de clicar em **Deploy**, abra **Environment Variables** e cadastre:
   - **Key:** `TMDB_TOKEN`
   - **Value:** o seu Read Access Token (o mesmo do `.env.local`)
4. Clique em **Deploy** e aguarde o build (cerca de 1 minuto).
5. A Vercel mostra o endereço público, algo como `https://catalogo-filmes-seu-usuario.vercel.app`.

### 5. Conferir o site no ar

Repita as conferências feitas durante o projeto:

- [ ] o catálogo mostra 20 filmes;
- [ ] os filtros por streaming, gênero e ordenação funcionam;
- [ ] "Próxima" e "Anterior" mantêm os filtros;
- [ ] a busca encontra "Cidade de Deus" e "Tom & Jerry";
- [ ] a página de um filme mostra elenco, trailer e onde assistir;
- [ ] `/filme/abc` mostra "Filme não encontrado";
- [ ] no celular, a grade fica com duas colunas e nada sai da tela.

## Erros comuns

| Problema | Causa e solução |
|---|---|
| Build falha com "Configure a variável TMDB_TOKEN" | A variável não foi cadastrada na Vercel (ou foi cadastrada com outro nome). Cadastre e clique em **Redeploy**. |
| Site no ar, mas com erro 401 do TMDB | O valor do token na Vercel está errado (talvez a "API Key" curta em vez do "Read Access Token"). |
| `git push` pede usuário e senha e recusa a senha | O GitHub não aceita a senha da conta no terminal. Use o login pelo navegador que aparece, ou instale o [GitHub CLI](https://cli.github.com) e rode `gh auth login`. |
| `.env.local` apareceu no GitHub | Remova-o do repositório (`git rm --cached .env.local`), faça um commit e **gere um token novo no TMDB**, porque o antigo ficou público. |

## Para praticar

Faça uma mudança pequena, como trocar o título "Filmes nos streamings" por outro texto. Rode `npm test`, faça o commit, depois `git push`, e acompanhe no painel da Vercel o deploy novo acontecer sozinho. Em um minuto, a mudança está no ar.

## Próximos passos

O plano do projeto já previa uma **versão 2** com **login**, para recursos como favoritos e listas pessoais. Ela terá a sua própria especificação e o seu próprio plano, começando por estas perguntas: onde guardar os usuários (qual banco de dados), como fazer o login (e-mail e senha? conta do Google?) e o que cada usuário poderá salvar.
