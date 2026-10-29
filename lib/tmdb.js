// Único módulo que conversa com a API do TMDB.
// Documentação: https://developer.themoviedb.org/reference
import { cacheLife } from "next/cache";

const URL_BASE = "https://api.themoviedb.org/3";
const LIMITE_PAGINAS = 500;
const MAX_STREAMINGS = 12;
const TEMPO_LIMITE_MS = 10000;

const ORDENACOES = {
  popularidade: { sort_by: "popularity.desc" },
  nota: { sort_by: "vote_average.desc", "vote_count.gte": 200 },
  lancamento: { sort_by: "primary_release_date.desc" },
};

async function requisitar(caminho, parametros = {}) {
  const token = process.env.TMDB_TOKEN;
  if (!token) {
    throw new Error("Configure a variável TMDB_TOKEN no arquivo .env.local");
  }

  const busca = new URLSearchParams({ language: "pt-BR" });
  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor !== null && valor !== undefined) busca.set(chave, valor);
  }

  const resposta = await fetch(`${URL_BASE}${caminho}?${busca}`, {
    headers: { Authorization: "Bearer " + token },
    signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
  });

  if (resposta.status === 404) return null;
  if (!resposta.ok) {
    throw new Error(`Erro ao consultar o TMDB (status ${resposta.status})`);
  }
  return resposta.json();
}

function paraLista(dados) {
  return {
    filmes: dados.results,
    pagina: dados.page,
    totalPaginas: Math.min(dados.total_pages, LIMITE_PAGINAS),
  };
}

export async function listarFilmes({ streamings, genero, ordem, pagina }) {
  "use cache";
  cacheLife("hours");

  const extras =
    ordem === "lancamento"
      ? { "primary_release_date.lte": new Date().toISOString().slice(0, 10) }
      : {};

  const dados = await requisitar("/discover/movie", {
    watch_region: "BR",
    with_watch_providers: streamings.join("|"),
    with_watch_monetization_types: "flatrate",
    with_genres: genero,
    ...ORDENACOES[ordem],
    ...extras,
    page: pagina,
  });
  return paraLista(dados);
}

export async function buscarFilmes(termo, pagina) {
  "use cache";
  cacheLife("hours");

  const dados = await requisitar("/search/movie", {
    query: termo,
    page: pagina,
    include_adult: false,
  });
  return paraLista(dados);
}

export async function detalhesFilme(id) {
  "use cache";
  cacheLife("hours");

  return requisitar(`/movie/${id}`, {
    append_to_response: "credits,videos,watch/providers",
    include_video_language: "pt,en",
  });
}

export async function listarStreamings() {
  "use cache";
  cacheLife("days");

  const dados = await requisitar("/watch/providers/movie", { watch_region: "BR" });
  const prioridade = (p) => p.display_priorities?.BR ?? p.display_priority;

  return dados.results
    .toSorted((a, b) => prioridade(a) - prioridade(b))
    .slice(0, MAX_STREAMINGS)
    .map((p) => ({ id: p.provider_id, nome: p.provider_name, logo: p.logo_path }));
}

export async function listarGeneros() {
  "use cache";
  cacheLife("days");

  const dados = await requisitar("/genre/movie/list");
  return dados.genres.map((g) => ({ id: g.id, nome: g.name }));
}
