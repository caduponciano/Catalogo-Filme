import Image from "next/image";
import Link from "next/link";
import { urlImagem, extrairAno, formatarNota } from "@/lib/formatar";
import estilos from "./CartaoFilme.module.css";

export default function CartaoFilme({ filme }) {
  return (
    <Link href={`/filme/${filme.id}`} className={estilos.cartao}>
      <Image
        src={urlImagem(filme.poster_path)}
        alt={"Pôster de " + filme.title}
        width={342}
        height={513}
        className={estilos.poster}
      />
      <div className={estilos.info}>
        <h3 className={estilos.titulo}>{filme.title}</h3>
        <p className={estilos.detalhes}>
          <span>{extrairAno(filme.release_date)}</span>
          <span className={estilos.nota}>{formatarNota(filme.vote_average)}</span>
        </p>
      </div>
    </Link>
  );
}
