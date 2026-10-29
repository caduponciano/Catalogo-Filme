import { describe, test, expect } from "vitest";
import { urlImagem, extrairAno, formatarNota } from "@/lib/formatar";

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
