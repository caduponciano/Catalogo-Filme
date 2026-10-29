import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GradeFilmes from "@/components/GradeFilmes";

const filmes = [
  { id: 1, title: "Um", poster_path: null, release_date: "2001-01-01", vote_average: 7 },
  { id: 2, title: "Dois", poster_path: null, release_date: "2002-01-01", vote_average: 6 },
];

describe("GradeFilmes", () => {
  test("renderiza um cartão por filme", () => {
    render(<GradeFilmes filmes={filmes} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  test("mostra a mensagem padrão quando a lista está vazia", () => {
    render(<GradeFilmes filmes={[]} />);
    expect(screen.getByText("Nenhum filme encontrado com esses filtros.")).toBeInTheDocument();
  });

  test("aceita outra mensagem para lista vazia", () => {
    render(<GradeFilmes filmes={[]} mensagemVazia="Nada aqui." />);
    expect(screen.getByText("Nada aqui.")).toBeInTheDocument();
  });
});
