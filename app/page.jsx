import { Suspense } from "react";
import Filtros from "@/components/Filtros";
import GradeFilmes from "@/components/GradeFilmes";
import { lerFiltros } from "@/lib/filtros";
import { listarFilmes, listarGeneros, listarStreamings } from "@/lib/tmdb";
import estilos from "./page.module.css";

export default function PaginaCatalogo({ searchParams }) {
  return (
    <>
      <h1 className={estilos.titulo}>Filmes nos streamings</h1>
      <Suspense fallback={<p className={estilos.carregando}>Carregando filmes…</p>}>
        <Catalogo searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Catalogo({ searchParams }) {
  const [streamings, generos] = await Promise.all([listarStreamings(), listarGeneros()]);
  const todosOsStreamings = streamings.map((s) => s.id);

  const filtros = lerFiltros(await searchParams, {
    streamings: todosOsStreamings,
    generos: generos.map((g) => g.id),
  });

  const { filmes } = await listarFilmes({
    streamings: filtros.streaming ? [filtros.streaming] : todosOsStreamings,
    genero: filtros.genero,
    ordem: filtros.ordem,
    pagina: filtros.pagina,
  });

  return (
    <>
      <Filtros streamings={streamings} generos={generos} filtros={filtros} />
      <GradeFilmes filmes={filmes} />
    </>
  );
}
