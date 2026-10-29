# 01 — Preparando o ambiente

## O que fizemos

Conferimos as ferramentas instaladas no computador (Node.js, npm e Git) e preparamos o lugar onde fica a chave de acesso ao TMDB. Sem esses três programas e sem a chave, o projeto não roda.

## Por que fizemos assim

- **Node.js** é necessário porque o Next.js é escrito em JavaScript e precisa de algo que rode JavaScript fora do navegador.
- **Git** guarda o histórico do projeto. Cada etapa vira um *commit*, e você pode voltar a qualquer uma delas para estudar.
- A **chave do TMDB** é pessoal. Por isso ela fica num arquivo separado (`.env.local`) que **nunca** vai para o GitHub.

## Conceitos novos

### Node.js e npm × Python e pip

| Python | JavaScript |
|---|---|
| `python` roda um arquivo `.py` | `node` roda um arquivo `.js` |
| `pip install requests` | `npm install nome-do-pacote` |
| `requirements.txt` lista as dependências | `package.json` lista as dependências |
| pasta do ambiente virtual (`venv/`) | pasta `node_modules/` |

O `package.json` também guarda **scripts**: atalhos como `npm run dev` (liga o site) e `npm test` (roda os testes).

### Variáveis de ambiente

São valores que o programa lê do ambiente em vez de deixá-los escritos no código. Em Python você faria `os.environ["TMDB_TOKEN"]`; em JavaScript (no Node.js) é `process.env.TMDB_TOKEN`.

O Next.js lê automaticamente o arquivo `.env.local` e coloca o que estiver nele em `process.env`.

## Passo a passo

### 1. Conferir as ferramentas

No terminal do VS Code (PowerShell):

```powershell
node --version   # neste computador: v24.16.0
npm --version    # neste computador: 11.13.0
git --version    # neste computador: 2.54.0
```

Se algum comando não for reconhecido, instale pelo site oficial: [nodejs.org](https://nodejs.org) (versão LTS) e [git-scm.com](https://git-scm.com).

### 2. Criar a conta no TMDB e pegar a chave

1. Crie uma conta gratuita em [themoviedb.org](https://www.themoviedb.org/signup).
2. Entre na conta e vá em **Configurações → API** ([link direto](https://www.themoviedb.org/settings/api)).
3. Peça uma chave de desenvolvedor (uso pessoal/educacional). O formulário pede uma descrição curta: "projeto de estudo" basta.
4. Na mesma página, copie o **API Read Access Token**. É um texto longo que começa com `eyJ...`.

> Existem duas chaves na página: a "API Key" (curta) e o "Read Access Token" (longo). Usamos o **Read Access Token**.

### 3. Criar o `.env.local`

Na raiz do projeto existe o arquivo `.env.example`:

```
TMDB_TOKEN=cole_aqui_o_seu_read_access_token
```

Copie-o com o nome `.env.local` e troque o texto pelo seu token:

```powershell
Copy-Item .env.example .env.local
code .env.local
```

O `.env.example` vai para o GitHub (ele só mostra **quais** variáveis existem). O `.env.local` tem o valor real e está no `.gitignore`.

## O código comentado

Trecho do `.gitignore`:

```
.env*            # ignora todos os arquivos que começam com .env…
!.env.example    # …exceto o .env.example (o "!" abre uma exceção)
```

## Erros comuns

| Problema | Causa e solução |
|---|---|
| `'node' não é reconhecido como um comando` | O Node.js não está instalado ou o terminal foi aberto antes da instalação. Instale e abra um terminal novo. |
| O site diz que falta `TMDB_TOKEN` | O arquivo se chama `.env.local` (com o ponto no início), fica na **raiz** do projeto, e o servidor precisa ser reiniciado depois de criá-lo. |
| Erro 401 do TMDB | O token está errado ou você colou a "API Key" curta em vez do "Read Access Token". |

## Para praticar

Abra o `package.json` e encontre a linha de cada script (`dev`, `build`, `test`). Rode `npm run` sem nada depois: o npm lista todos os scripts disponíveis.
