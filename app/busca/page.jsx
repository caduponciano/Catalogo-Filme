import { Suspense } from "react";
import GradeFilmes from "@/components/GradeFilmes";
import Paginacao from "@/components/Paginacao";
import { lerBusca } from "@/lib/filtros";
import { buscarFilmes } from "@/lib/tmdb";
import estilos from "../page.module.css";

export const metadata = {
  title: "Busca — Catálogo de Filmes",
};

export default function PaginaBusca({ searchParams }) {
  return (
    <Suspense fallback={<p className={estilos.carregando}>Buscando…</p>}>
      <Resultados searchParams={searchParams} />
    </Suspense>
  );
}

async function Resultados({ searchParams }) {
  const { termo, pagina } = lerBusca(await searchParams);

  if (!termo) {
    return <p className={estilos.carregando}>Digite o nome de um filme para buscar</p>;
  }

  const { filmes, totalPaginas } = await buscarFilmes(termo, pagina);

  return (
    <>
      <h1 className={estilos.titulo}>Resultados para “{termo}”</h1>
      <GradeFilmes filmes={filmes} mensagemVazia={"Nenhum filme encontrado para “" + termo + "”."} />
      <Paginacao pagina={pagina} totalPaginas={totalPaginas} caminho="/busca" parametros={{ q: termo }} />
    </>
  );
}
