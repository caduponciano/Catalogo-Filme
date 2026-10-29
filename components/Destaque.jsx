import Image from "next/image";
import Link from "next/link";
import { formatarNota, resumir, urlImagem } from "@/lib/formatar";
import estilos from "./Destaque.module.css";

const TAMANHO_SINOPSE = 180;

export default function Destaque({ filme }) {
  return (
    <section className={estilos.destaque}>
      <Image
        src={urlImagem(filme.backdrop_path, "w1280")}
        alt={"Cena de " + filme.title}
        fill
        preload
        sizes="(max-width: 1200px) 100vw, 1200px"
        className={estilos.fundo}
      />
      <div className={estilos.veu} />

      <div className={estilos.conteudo}>
        <span className={estilos.selo}>★ {formatarNota(filme.vote_average)} · Em alta</span>
        <h2 className={estilos.titulo}>{filme.title}</h2>
        <p className={estilos.sinopse}>{resumir(filme.overview, TAMANHO_SINOPSE)}</p>
        <Link href={`/filme/${filme.id}`} className={estilos.botao}>
          Ver detalhes
        </Link>
      </div>
    </section>
  );
}
