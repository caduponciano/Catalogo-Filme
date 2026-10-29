import Link from "next/link";
import { paraQuery } from "@/lib/filtros";
import estilos from "./Paginacao.module.css";

// "parametros" são os filtros atuais (sem a página); eles vão junto em cada link.
export default function Paginacao({ pagina, totalPaginas, caminho, parametros }) {
  if (totalPaginas <= 1) return null;

  const linkPara = (numero) => `${caminho}?${paraQuery({ ...parametros, pagina: numero })}`;

  return (
    <nav aria-label="Paginação" className={estilos.paginacao}>
      {pagina > 1 ? (
        <Link href={linkPara(pagina - 1)} className={estilos.botao}>
          Anterior
        </Link>
      ) : (
        <span className={estilos.desativado}>Anterior</span>
      )}

      <span>
        Página {pagina} de {totalPaginas}
      </span>

      {pagina < totalPaginas ? (
        <Link href={linkPara(pagina + 1)} className={estilos.botao}>
          Próxima
        </Link>
      ) : (
        <span className={estilos.desativado}>Próxima</span>
      )}
    </nav>
  );
}
