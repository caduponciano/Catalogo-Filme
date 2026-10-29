import { describe, test, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Filtros from "@/components/Filtros";

const streamings = [
  { id: 8, nome: "Netflix" },
  { id: 119, nome: "Prime Video" },
];
const generos = [
  { id: 28, nome: "Ação" },
  { id: 35, nome: "Comédia" },
];
const padrao = { streaming: null, genero: null, ordem: "popularidade", pagina: 1 };

function desenhar(filtros = padrao) {
  return render(<Filtros streamings={streamings} generos={generos} filtros={filtros} />);
}

const nomesDasOpcoes = (select) =>
  within(select)
    .getAllByRole("option")
    .map((opcao) => opcao.textContent);

describe("Filtros", () => {
  test("é um formulário GET para o catálogo", () => {
    const { container } = desenhar();
    const formulario = container.querySelector("form");
    expect(formulario.getAttribute("method")).toBe("get");
    expect(formulario.getAttribute("action")).toBe("/");
  });

  test('lista os streamings com a opção "Todos os streamings"', () => {
    desenhar();
    const select = screen.getByLabelText("Streaming");
    expect(nomesDasOpcoes(select)).toEqual(["Todos os streamings", "Netflix", "Prime Video"]);
    expect(within(select).getByText("Todos os streamings")).toHaveValue("");
  });

  test('lista os gêneros com a opção "Todos os gêneros"', () => {
    desenhar();
    const select = screen.getByLabelText("Gênero");
    expect(nomesDasOpcoes(select)).toEqual(["Todos os gêneros", "Ação", "Comédia"]);
    expect(within(select).getByText("Todos os gêneros")).toHaveValue("");
  });

  test("oferece as três ordenações", () => {
    desenhar();
    const opcoes = within(screen.getByLabelText("Ordenar por")).getAllByRole("option");
    expect(opcoes.map((o) => [o.textContent, o.value])).toEqual([
      ["Popularidade", "popularidade"],
      ["Nota", "nota"],
      ["Lançamento", "lancamento"],
    ]);
  });

  test("marca os filtros atuais", () => {
    desenhar({ streaming: 8, genero: 35, ordem: "nota", pagina: 1 });
    expect(screen.getByLabelText("Streaming")).toHaveValue("8");
    expect(screen.getByLabelText("Gênero")).toHaveValue("35");
    expect(screen.getByLabelText("Ordenar por")).toHaveValue("nota");
  });

  test("tem o botão Filtrar", () => {
    desenhar();
    expect(screen.getByRole("button", { name: "Filtrar" })).toBeInTheDocument();
  });
});
