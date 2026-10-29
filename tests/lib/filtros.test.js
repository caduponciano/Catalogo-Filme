import { describe, test, expect } from "vitest";
import { lerFiltros, lerPagina, paraQuery } from "@/lib/filtros";

const listas = { streamings: [8, 119], generos: [28, 35] };

describe("lerFiltros", () => {
  test("usa os valores padrão sem parâmetros", () => {
    expect(lerFiltros({}, listas)).toEqual({
      streaming: null,
      genero: null,
      ordem: "popularidade",
      pagina: 1,
    });
  });

  test("lê valores válidos", () => {
    expect(
      lerFiltros({ streaming: "8", genero: "35", ordem: "nota", pagina: "3" }, listas),
    ).toEqual({ streaming: 8, genero: 35, ordem: "nota", pagina: 3 });
  });

  test("ignora streaming e gênero fora da lista", () => {
    const filtros = lerFiltros({ streaming: "99999", genero: "1" }, listas);
    expect(filtros.streaming).toBeNull();
    expect(filtros.genero).toBeNull();
  });

  test("usa o primeiro valor de parâmetros repetidos", () => {
    expect(lerFiltros({ genero: ["28", "35"] }, listas).genero).toBe(28);
  });

  test("ignora ordem desconhecida", () => {
    expect(lerFiltros({ ordem: "aleatoria" }, listas).ordem).toBe("popularidade");
  });
});

describe("lerPagina", () => {
  test("corrige valores inválidos", () => {
    for (const valor of ["abc", "0", "-2", "1.5", undefined]) {
      expect(lerPagina(valor)).toBe(1);
    }
  });

  test("limita a 500 páginas", () => {
    expect(lerPagina("9999")).toBe(500);
  });

  test("usa o primeiro valor repetido", () => {
    expect(lerPagina(["4", "7"])).toBe(4);
  });
});

describe("paraQuery", () => {
  test("omite valores vazios", () => {
    expect(paraQuery({ streaming: 8, genero: null, ordem: "nota", q: "", pagina: 2 })).toBe(
      "streaming=8&ordem=nota&pagina=2",
    );
  });
});
