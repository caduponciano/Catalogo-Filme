import GradeFilmes from "@/components/GradeFilmes";
import { listarFilmes, listarStreamings } from "@/lib/tmdb";
import estilos from "./page.module.css";

export default async function Catalogo() {
  const streamings = await listarStreamings();
  const { filmes } = await listarFilmes({
    streamings: streamings.map((s) => s.id),
    genero: null,
    ordem: "popularidade",
    pagina: 1,
  });

  return (
    <>
      <h1 className={estilos.titulo}>Filmes nos streamings</h1>
      <GradeFilmes filmes={filmes} />
    </>
  );
}
