import { describe, test, expect } from "vitest";
import {
  urlImagem,
  extrairAno,
  formatarNota,
  formatarDuracao,
  escolherTrailer,
  ondeAssistir,
  escolherDestaque,
  resumir,
} from "@/lib/formatar";

describe("urlImagem", () => {
  test("monta a URL do TMDB", () => {
    expect(urlImagem("/abc.jpg")).toBe("https://image.tmdb.org/t/p/w342/abc.jpg");
    expect(urlImagem("/abc.jpg", "w500")).toBe("https://image.tmdb.org/t/p/w500/abc.jpg");
  });

  test("usa a imagem genérica sem caminho", () => {
    expect(urlImagem(null)).toBe("/sem-imagem.svg");
    expect(urlImagem("")).toBe("/sem-imagem.svg");
  });
});

describe("extrairAno", () => {
  test("pega o ano de uma data", () => {
    expect(extrairAno("1999-03-30")).toBe("1999");
  });

  test("devolve texto vazio sem data", () => {
    expect(extrairAno("")).toBe("");
    expect(extrairAno(null)).toBe("");
    expect(extrairAno(undefined)).toBe("");
  });
});

describe("formatarNota", () => {
  test("usa vírgula e uma casa", () => {
    expect(formatarNota(7.834)).toBe("7,8");
    expect(formatarNota(8)).toBe("8,0");
  });

  test("mostra um traço sem nota", () => {
    expect(formatarNota(null)).toBe("–");
    expect(formatarNota(0)).toBe("–");
  });
});

describe("formatarDuracao", () => {
  test("mostra horas e minutos", () => {
    expect(formatarDuracao(136)).toBe("2h 16min");
    expect(formatarDuracao(120)).toBe("2h");
    expect(formatarDuracao(45)).toBe("45min");
  });

  test("devolve texto vazio sem duração", () => {
    expect(formatarDuracao(0)).toBe("");
    expect(formatarDuracao(null)).toBe("");
    expect(formatarDuracao(undefined)).toBe("");
  });
});

describe("escolherTrailer", () => {
  const trailerEn = { site: "YouTube", type: "Trailer", key: "en1", iso_639_1: "en" };
  const trailerPt = { site: "YouTube", type: "Trailer", key: "pt1", iso_639_1: "pt" };

  test("prefere português", () => {
    expect(escolherTrailer([trailerEn, trailerPt])).toBe("pt1");
  });

  test("usa inglês na falta de português", () => {
    expect(escolherTrailer([trailerEn])).toBe("en1");
  });

  test("ignora teasers e outros sites", () => {
    expect(
      escolherTrailer([
        { site: "YouTube", type: "Teaser", key: "t", iso_639_1: "pt" },
        { site: "Vimeo", type: "Trailer", key: "v", iso_639_1: "pt" },
      ]),
    ).toBeNull();
    expect(escolherTrailer(undefined)).toBeNull();
  });
});

describe("ondeAssistir", () => {
  test("lista só os principais streamings", () => {
    const provedores = {
      link: "https://www.themoviedb.org/movie/603/watch",
      flatrate: [
        { provider_id: 8, provider_name: "Netflix", logo_path: "/n.png" },
        { provider_id: 9999, provider_name: "Outro", logo_path: "/o.png" },
      ],
    };
    expect(ondeAssistir(provedores, [8, 119])).toEqual({
      lista: [{ id: 8, nome: "Netflix", logo: "/n.png" }],
      link: "https://www.themoviedb.org/movie/603/watch",
    });
  });

  test("sem dados do Brasil", () => {
    expect(ondeAssistir(undefined, [8])).toEqual({ lista: [], link: null });
  });

  test("só com aluguel não conta como streaming", () => {
    expect(ondeAssistir({ link: "x", rent: [{ provider_id: 8 }] }, [8])).toEqual({
      lista: [],
      link: null,
    });
  });
});

describe("escolherDestaque", () => {
  test("escolhe o primeiro filme com imagem de fundo", () => {
    const filmes = [
      { id: 1, backdrop_path: null },
      { id: 2, backdrop_path: "/b2.jpg" },
      { id: 3, backdrop_path: "/b3.jpg" },
    ];
    expect(escolherDestaque(filmes)).toEqual({ id: 2, backdrop_path: "/b2.jpg" });
  });

  test("devolve null quando nenhum filme tem imagem de fundo", () => {
    expect(escolherDestaque([{ id: 1, backdrop_path: null }])).toBeNull();
    expect(escolherDestaque([])).toBeNull();
  });
});

describe("resumir", () => {
  test("mantém textos curtos como estão", () => {
    expect(resumir("Um filme curto.", 50)).toBe("Um filme curto.");
  });

  test("corta no último espaço antes do limite e acrescenta reticências", () => {
    expect(resumir("O jovem programador Thomas Anderson", 22)).toBe("O jovem programador…");
  });

  test("devolve texto vazio sem texto", () => {
    expect(resumir("", 10)).toBe("");
    expect(resumir(null, 10)).toBe("");
  });
});
