import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import estilos from "./layout.module.css";

export const metadata = {
  title: "Catálogo de Filmes",
  description: "Filmes disponíveis nos streamings do Brasil",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className={estilos.cabecalho}>
          <div className={estilos.barra}>
            <Link href="/" className={estilos.marca}>
              Catálogo de Filmes
            </Link>
            <form method="get" action="/busca" role="search" className={estilos.busca}>
              <input
                type="search"
                name="q"
                placeholder="Buscar filme…"
                aria-label="Buscar filme"
                className={estilos.campoBusca}
              />
              <button type="submit" className={estilos.botaoBusca}>
                Buscar
              </button>
            </form>
          </div>
        </header>

        <main className={estilos.conteudo}>{children}</main>

        <footer className={estilos.rodape}>
          <div className={estilos.creditos}>
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">
              <Image
                src="/tmdb-logo.svg"
                alt="Logotipo do TMDB"
                width={273}
                height={36}
                className={estilos.logoTmdb}
              />
            </a>
            <p>Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.</p>
            <p>Dados de onde assistir fornecidos pelo JustWatch.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
