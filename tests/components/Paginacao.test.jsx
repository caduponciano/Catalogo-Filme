import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Paginacao from "@/components/Paginacao";

const filtros = { streaming: 8, genero: 28, ordem: "nota" };

describe("Paginacao", () => {
  test("não aparece quando há uma página só", () => {
    const um = render(<Paginacao pagina={1} totalPaginas={1} caminho="/" parametros={{}} />);
    expect(um.container).toBeEmptyDOMElement();
    um.unmount();
    const zero = render(<Paginacao pagina={1} totalPaginas={0} caminho="/" parametros={{}} />);
    expect(zero.container).toBeEmptyDOMElement();
  });

  test('mostra "Página X de Y"', () => {
    render(<Paginacao pagina={2} totalPaginas={5} caminho="/" parametros={filtros} />);
    expect(screen.getByText("Página 2 de 5")).toBeInTheDocument();
  });

  test("preserva os filtros nos links", () => {
    render(<Paginacao pagina={2} totalPaginas={5} caminho="/" parametros={filtros} />);
    expect(screen.getByRole("link", { name: "Próxima" })).toHaveAttribute(
      "href",
      "/?streaming=8&genero=28&ordem=nota&pagina=3",
    );
    expect(screen.getByRole("link", { name: "Anterior" })).toHaveAttribute(
      "href",
      "/?streaming=8&genero=28&ordem=nota&pagina=1",
    );
  });

  test('não tem link "Anterior" na primeira página', () => {
    render(<Paginacao pagina={1} totalPaginas={5} caminho="/" parametros={filtros} />);
    expect(screen.queryByRole("link", { name: "Anterior" })).toBeNull();
  });

  test('não tem link "Próxima" na última página', () => {
    render(<Paginacao pagina={5} totalPaginas={5} caminho="/" parametros={filtros} />);
    expect(screen.queryByRole("link", { name: "Próxima" })).toBeNull();
  });

  test('não tem link "Próxima" além do total', () => {
    render(<Paginacao pagina={50} totalPaginas={3} caminho="/" parametros={filtros} />);
    expect(screen.queryByRole("link", { name: "Próxima" })).toBeNull();
  });
});
