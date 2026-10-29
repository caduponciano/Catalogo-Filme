import Image from "next/image";
import Link from "next/link";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import estilos from "./layout.module.css";

// Fontes do Google, baixadas no build e servidas pelo próprio site.
const fonteTitulo = Bricolage_Grotesque({ subsets: ["latin"], variable: "--fonte-titulo" });
const fonteTexto = Inter({ subsets: ["latin"], variable: "--fonte-texto" });

export const metadata = {
  title: "CINEMINHA",
  description: "Filmes disponíveis nos streamings do Brasil",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${fonteTitulo.variable} ${fonteTexto.variable}`}>
      <body>
        <header className={estilos.cabecalho}>
          <div className={estilos.barra}>
            <Link href="/" className={estilos.marca}>
              CINEMINHA
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
