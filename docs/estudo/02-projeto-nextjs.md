# 02 — Criando o projeto Next.js

## O que fizemos

Criamos o esqueleto do projeto com o `create-next-app`, deixamos só uma página mínima ("Catálogo de Filmes") e configuramos a ferramenta de testes (Vitest). Também criamos uma *branch* no Git para trabalhar.

## Por que fizemos assim

- O `create-next-app` monta toda a estrutura e as configurações de uma vez. Fazer isso à mão levaria horas e daria margem a erros.
- Escolhemos **JavaScript** em vez de TypeScript para ter menos coisa nova para aprender ao mesmo tempo.
- Não usamos o **Tailwind** (uma forma de escrever CSS com classes prontas). CSS comum ensina melhor os fundamentos.
- Os arquivos com JSX usam a extensão **`.jsx`**. O Next.js aceita `.js` também, mas com `.jsx` o Vitest entende os arquivos sem configuração extra.

## Conceitos novos

### Branch

Uma branch é uma linha de trabalho paralela. A `main` guarda a versão "oficial"; nós trabalhamos na `feat/catalogo-v1`. Se algo der muito errado, a `main` continua intacta. No fim, juntamos as duas.

```powershell
git switch -c feat/catalogo-v1   # cria a branch e passa a usá-la
git branch                       # mostra em qual branch você está
```

### A pasta `app/` e as rotas

No Next.js, **a estrutura de pastas dentro de `app/` define os endereços do site**:

| Arquivo | Endereço |
|---|---|
| `app/page.jsx` | `/` |
| `app/busca/page.jsx` | `/busca` (capítulo 07) |
| `app/filme/[id]/page.jsx` | `/filme/603`, `/filme/550`… (capítulo 08) |

No Flask você escreveria `@app.route("/busca")` em cima de uma função. Aqui, basta criar a pasta e o arquivo `page.jsx`.

### `layout.jsx`

É a "moldura" que envolve todas as páginas — no nosso caso, o `<html lang="pt-BR">` e, mais adiante, o cabeçalho e o rodapé. É parecido com um template base do Jinja (`{% extends "base.html" %}`).

### Vitest

O Vitest roda testes automáticos, como o `pytest`. Um teste é uma função que monta uma situação e confere o resultado com `expect(...)` — o equivalente ao `assert` do Python.

## O código comentado

### O comando que criou o projeto

```powershell
npx create-next-app@latest catalogo-filmes --js --app --eslint --no-tailwind --no-src-dir --import-alias "@/*" --use-npm --yes --disable-git
```

| Parte | Significado |
|---|---|
| `npx create-next-app@latest` | baixa e roda a versão mais recente do criador de projetos |
| `catalogo-filmes` | nome da pasta (o npm não aceita letras maiúsculas, por isso não usamos o nome da pasta principal; depois movemos tudo para a raiz) |
| `--js` | JavaScript, não TypeScript |
| `--app` | usa o *App Router* (a pasta `app/`) |
| `--eslint` | instala o ESLint, que aponta erros comuns no código (`npm run lint`) |
| `--no-tailwind` | sem Tailwind |
| `--no-src-dir` | as pastas ficam na raiz, sem uma pasta `src/` |
| `--import-alias "@/*"` | permite escrever `import ... from "@/lib/tmdb"` em vez de `../../lib/tmdb` |
| `--use-npm` | usa o npm (e não yarn/pnpm) |
| `--yes` | aceita os padrões sem perguntar |
| `--disable-git` | não cria outro repositório Git (já tínhamos um) |

O Next.js instalado foi a versão **16.4**. Ela já vem com os **Cache Components** ligados (`next.config.mjs`), um jeito novo de guardar dados em cache. Vamos usá-lo no capítulo 03.

### Estrutura de pastas

```
app/
  layout.jsx      → moldura de todas as páginas
  page.jsx        → a página inicial (/)
  globals.css     → estilos que valem para o site todo
public/           → arquivos servidos como estão (imagens, ícones)
tests/            → nossos testes
docs/estudo/      → este material
next.config.mjs   → configurações do Next.js
package.json      → dependências e scripts
vitest.config.mjs → configuração dos testes
.env.example      → modelo das variáveis de ambiente
AGENTS.md         → aviso do Next.js para ferramentas de IA (criado automaticamente)
```

### A página mínima — `app/page.jsx`

```jsx
export default function Home() {   // um componente é uma função…
  return (                          // …que devolve JSX
    <main>
      <h1>Catálogo de Filmes</h1>
    </main>
  );
}
```

O `export default` diz ao Next.js: "este é o componente desta página".

### A configuração dos testes — `vitest.config.mjs`

```js
export default defineConfig({
  plugins: [react()],                       // ensina o Vitest a entender JSX
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },  // "@/" = raiz do projeto
  },
  test: {
    environment: "jsdom",                   // simula um navegador dentro do Node.js
    setupFiles: ["./tests/setup.js"],       // roda antes de cada arquivo de teste
  },
});
```

### O teste de fumaça — `tests/setup.test.jsx`

```jsx
test("o ambiente de testes renderiza React", () => {
  render(<p>funcionando</p>);                                  // desenha o JSX no "navegador simulado"
  expect(screen.getByText("funcionando")).toBeInTheDocument(); // confere que o texto apareceu
});
```

Chama-se "teste de fumaça" porque só verifica se a máquina liga sem soltar fumaça: se ele passa, o ambiente de testes está funcionando.

## Erros comuns

| Problema | Causa e solução |
|---|---|
| `name can no longer contain capital letters` | O npm não aceita maiúsculas no nome do projeto. Use um nome em minúsculas, como fizemos. |
| `npm run dev` diz que a porta 3000 está em uso | Já existe um servidor ligado. Feche o outro terminal ou use `npm run dev -- -p 3001`. |
| O `AGENTS.md` volta depois de apagado | O `next dev` o recria automaticamente. Pode deixá-lo no projeto. |

## Para praticar

1. Rode `npm run dev`, abra `http://localhost:3000` e mude o texto do `<h1>` em `app/page.jsx`. Veja a página atualizar sozinha.
2. Rode `npm run test:watch`, mude `"funcionando"` para outro texto **só no `expect`** e veja o teste falhar. Desfaça a mudança e veja-o passar de novo.
