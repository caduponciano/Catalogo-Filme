import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { lerIdFilme } from "@/lib/filtros";
import {
  urlImagem,
  extrairAno,
  formatarNota,
  formatarDuracao,
  escolherTrailer,
  ondeAssistir,
} from "@/lib/formatar";
import { detalhesFilme, listarStreamings } from "@/lib/tmdb";
import estilos from "./page.module.css";

const MAX_ELENCO = 10;

export async function generateMetadata({ params }) {
  const id = lerIdFilme((await params).id);
  const detalhes = id ? await detalhesFilme(id) : null;
  return { title: detalhes ? `${detalhes.title} — CINEMINHA` : "CINEMINHA" };
}

export default function PaginaFilme({ params }) {
  return (
    <Suspense fallback={<p className={estilos.carregando}>Carregando filme…</p>}>
      <Filme params={params} />
    </Suspense>
  );
}

async function Filme({ params }) {
  const id = lerIdFilme((await params).id);
  if (!id) notFound();

  const [detalhes, streamings] = await Promise.all([detalhesFilme(id), listarStreamings()]);
  if (!detalhes) notFound();

  const elenco = (detalhes.credits?.cast ?? []).slice(0, MAX_ELENCO);
  const trailer = escolherTrailer(detalhes.videos?.results);
  const disponivel = ondeAssistir(
    detalhes["watch/providers"]?.results?.BR,
    streamings.map((s) => s.id),
  );
  const informacoes = [
    extrairAno(detalhes.release_date),
    formatarDuracao(detalhes.runtime),
    detalhes.genres.map((g) => g.name).join(", "),
  ].filter(Boolean);

  return (
    <article className={estilos.filme}>
      {detalhes.backdrop_path && (
        <div className={estilos.capa}>
          <Image
            src={urlImagem(detalhes.backdrop_path, "w1280")}
            alt=""
            fill
            preload
            sizes="100vw"
            className={estilos.capaImagem}
          />
          <div className={estilos.capaVeu} />
        </div>
      )}

      <section className={estilos.topo}>
        <Image
          src={urlImagem(detalhes.poster_path, "w500")}
          alt={"Pôster de " + detalhes.title}
          width={500}
          height={750}
          className={estilos.poster}
          preload
        />

        <div className={estilos.resumo}>
          <h1 className={estilos.titulo}>{detalhes.title}</h1>
          <p className={estilos.informacoes}>{informacoes.join(" · ")}</p>
          <p className={estilos.nota}>★ {formatarNota(detalhes.vote_average)}</p>
          <p className={estilos.sinopse}>{detalhes.overview || "Sinopse não disponível."}</p>

          <h2 className={estilos.subtitulo}>Onde assistir</h2>
          {disponivel.lista.length > 0 ? (
            <>
              <ul className={estilos.streamings}>
                {disponivel.lista.map((s) => (
                  <li key={s.id}>
                    <Image
                      src={urlImagem(s.logo, "w92")}
                      alt={s.nome}
                      title={s.nome}
                      width={48}
                      height={48}
                      className={estilos.logo}
                    />
                  </li>
                ))}
              </ul>
              {disponivel.link && (
                <a href={disponivel.link} target="_blank" rel="noopener noreferrer">
                  Ver todas as opções
                </a>
              )}
            </>
          ) : (
            <p>Este filme não está disponível em nenhum streaming no Brasil no momento.</p>
          )}
        </div>
      </section>

      {trailer && (
        <section>
          <h2 className={estilos.subtitulo}>Trailer</h2>
          <div className={estilos.video}>
            <iframe
              src={"https://www.youtube.com/embed/" + trailer}
              title={"Trailer de " + detalhes.title}
              allowFullScreen
            />
          </div>
        </section>
      )}

      {elenco.length > 0 && (
        <section>
          <h2 className={estilos.subtitulo}>Elenco</h2>
          <ul className={estilos.elenco}>
            {elenco.map((pessoa) => (
              <li key={pessoa.id} className={estilos.pessoa}>
                <Image
                  src={urlImagem(pessoa.profile_path, "w185")}
                  alt={pessoa.name}
                  width={185}
                  height={278}
                  className={estilos.foto}
                />
                <strong>{pessoa.name}</strong>
                <span>{pessoa.character}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
