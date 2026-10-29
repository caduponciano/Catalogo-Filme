import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { cacheLife } from "next/cache";
import {
  listarFilmes,
  buscarFilmes,
  detalhesFilme,
  listarStreamings,
  listarGeneros,
} from "@/lib/tmdb";

// Fora do Next.js o cacheLife não funciona; aqui só registramos as chamadas.
vi.mock("next/cache", () => ({ cacheLife: vi.fn() }));

let fetchMock;
beforeEach(() => {
  vi.stubEnv("TMDB_TOKEN", "token-teste");
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(cacheLife).mockClear();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const responder = (corpo, status = 200) =>
  fetchMock.mockResolvedValue(new Response(JSON.stringify(corpo), { status }));
const urlChamada = () => new URL(fetchMock.mock.calls[0][0]);
const opcoesChamada = () => fetchMock.mock.calls[0][1];
const listaVazia = { page: 1, results: [], total_pages: 1 };
const filtrosBase = { streamings: [8], genero: null, ordem: "popularidade", pagina: 1 };

describe("autenticação", () => {
  test("envia o token no cabeçalho Authorization", async () => {
    responder({ genres: [] });
    await listarGeneros();
    expect(opcoesChamada().headers.Authorization).toBe("Bearer token-teste");
  });

  test("lança erro claro quando falta o token", async () => {
    vi.stubEnv("TMDB_TOKEN", "");
    await expect(listarGeneros()).rejects.toThrow(
      "Configure a variável TMDB_TOKEN no arquivo .env.local",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("listarFilmes", () => {
  test("consulta o discover com região, idioma, streamings e gênero", async () => {
    responder(listaVazia);
    await listarFilmes({ streamings: [8, 119], genero: 28, ordem: "popularidade", pagina: 2 });
    const url = urlChamada();
    expect(url.pathname).toBe("/3/discover/movie");
    expect(url.searchParams.get("language")).toBe("pt-BR");
    expect(url.searchParams.get("watch_region")).toBe("BR");
    expect(url.searchParams.get("with_watch_providers")).toBe("8|119");
    expect(url.searchParams.get("with_watch_monetization_types")).toBe("flatrate");
    expect(url.searchParams.get("with_genres")).toBe("28");
    expect(url.searchParams.get("sort_by")).toBe("popularity.desc");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("vote_count.gte")).toBeNull();
  });

  test("sem gênero não envia with_genres", async () => {
    responder(listaVazia);
    await listarFilmes(filtrosBase);
    expect(urlChamada().searchParams.has("with_genres")).toBe(false);
  });

  test("ordem nota exige no mínimo 200 votos", async () => {
    responder(listaVazia);
    await listarFilmes({ ...filtrosBase, ordem: "nota" });
    const params = urlChamada().searchParams;
    expect(params.get("sort_by")).toBe("vote_average.desc");
    expect(params.get("vote_count.gte")).toBe("200");
  });

  test("ordem lancamento só traz filmes já lançados", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-28T12:00:00Z"));
    responder(listaVazia);
    await listarFilmes({ ...filtrosBase, ordem: "lancamento" });
    const params = urlChamada().searchParams;
    expect(params.get("sort_by")).toBe("primary_release_date.desc");
    expect(params.get("primary_release_date.lte")).toBe("2026-10-28");
  });

  test("limita o total de páginas a 500", async () => {
    responder({ page: 1, results: [{ id: 1 }], total_pages: 900 });
    const resultado = await listarFilmes(filtrosBase);
    expect(resultado).toEqual({ filmes: [{ id: 1 }], pagina: 1, totalPaginas: 500 });
  });

  test("guarda o resultado em cache por horas", async () => {
    responder(listaVazia);
    await listarFilmes(filtrosBase);
    expect(cacheLife).toHaveBeenCalledWith("hours");
  });

  test("lança erro quando o TMDB falha", async () => {
    responder({}, 500);
    await expect(listarFilmes(filtrosBase)).rejects.toThrow(
      "Erro ao consultar o TMDB (status 500)",
    );
  });
});

describe("buscarFilmes", () => {
  test("codifica termos com símbolos", async () => {
    responder(listaVazia);
    await buscarFilmes("Tom & Jerry", 3);
    const url = urlChamada();
    expect(url.pathname).toBe("/3/search/movie");
    expect(url.searchParams.get("query")).toBe("Tom & Jerry");
    expect(fetchMock.mock.calls[0][0]).toContain("query=Tom+%26+Jerry");
    expect(url.searchParams.get("page")).toBe("3");
    expect(url.searchParams.get("include_adult")).toBe("false");
    expect(url.searchParams.get("language")).toBe("pt-BR");
  });

  test("preserva acentos", async () => {
    responder(listaVazia);
    await buscarFilmes("Amélie", 1);
    expect(urlChamada().searchParams.get("query")).toBe("Amélie");
  });

  test("guarda o resultado em cache por horas", async () => {
    responder(listaVazia);
    await buscarFilmes("Matrix", 1);
    expect(cacheLife).toHaveBeenCalledWith("hours");
  });
});

describe("detalhesFilme", () => {
  test("pede créditos, vídeos e onde assistir em uma chamada", async () => {
    responder({ id: 603 });
    const resultado = await detalhesFilme(603);
    const url = urlChamada();
    expect(url.pathname).toBe("/3/movie/603");
    expect(url.searchParams.get("append_to_response")).toBe("credits,videos,watch/providers");
    expect(url.searchParams.get("include_video_language")).toBe("pt,en");
    expect(resultado).toEqual({ id: 603 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(cacheLife).toHaveBeenCalledWith("hours");
  });

  test("devolve null quando o filme não existe", async () => {
    responder({}, 404);
    expect(await detalhesFilme(999999999)).toBeNull();
  });
});

describe("listarStreamings", () => {
  test("devolve os 12 principais do Brasil", async () => {
    const results = Array.from({ length: 15 }, (_, indice) => {
      const i = indice + 1;
      return {
        provider_id: i,
        provider_name: "S" + i,
        logo_path: "/l" + i + ".png",
        display_priorities: { BR: 15 - i },
      };
    });
    responder({ results });
    const resultado = await listarStreamings();
    const url = urlChamada();
    expect(url.pathname).toBe("/3/watch/providers/movie");
    expect(url.searchParams.get("watch_region")).toBe("BR");
    expect(resultado).toHaveLength(12);
    expect(resultado[0]).toEqual({ id: 15, nome: "S15", logo: "/l15.png" });
    expect(cacheLife).toHaveBeenCalledWith("days");
  });
});

describe("listarGeneros", () => {
  test("devolve id e nome", async () => {
    responder({ genres: [{ id: 28, name: "Ação" }] });
    expect(await listarGeneros()).toEqual([{ id: 28, nome: "Ação" }]);
    expect(urlChamada().pathname).toBe("/3/genre/movie/list");
    expect(cacheLife).toHaveBeenCalledWith("days");
  });
});
