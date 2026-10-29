import { Suspense } from "react";
import Destaque from "@/components/Destaque";
import Filtros from "@/components/Filtros";
import GradeFilmes from "@/components/GradeFilmes";
import Paginacao from "@/components/Paginacao";
import { lerFiltros } from "@/lib/filtros";
import { escolherDestaque } from "@/lib/formatar";
import { listarFilmes, listarGeneros, listarStreamings } from "@/lib/tmdb";
import estilos from "./page.module.css";

export default function PaginaCatalogo({ searchParams }) {
  return (
    <Suspense fallback={<p className={estilos.carregando}>Carregando filmes…</p>}>
      <Catalogo searchParams={searchParams} />
    </Suspense>
  );
}

async function Catalogo({ searchParams }) {
  const [streamings, generos] = await Promise.all([listarStreamings(), listarGeneros()]);
  const todosOsStreamings = streamings.map((s) => s.id);

  const filtros = lerFiltros(await searchParams, {
    streamings: todosOsStreamings,
    generos: generos.map((g) => g.id),
  });

  const { filmes, totalPaginas } = await listarFilmes({
    streamings: filtros.streaming ? [filtros.streaming] : todosOsStreamings,
    genero: filtros.genero,
    ordem: filtros.ordem,
    pagina: filtros.pagina,
  });

  // O destaque só aparece na primeira página, para não se repetir ao paginar.
  const destaque = filtros.pagina === 1 ? escolherDestaque(filmes) : null;

  return (
    <>
      {destaque && <Destaque filme={destaque} />}
      <h1 className={estilos.titulo}>Filmes nos streamings</h1>
      <Filtros streamings={streamings} generos={generos} filtros={filtros} />
      <GradeFilmes filmes={filmes} />
      <Paginacao
        pagina={filtros.pagina}
        totalPaginas={totalPaginas}
        caminho="/"
        parametros={{ streaming: filtros.streaming, genero: filtros.genero, ordem: filtros.ordem }}
      />
    </>
  );
}
