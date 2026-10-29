import "./globals.css";

export const metadata = {
  title: "Catálogo de Filmes",
  description: "Filmes disponíveis nos streamings do Brasil",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
