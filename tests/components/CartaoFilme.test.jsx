import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CartaoFilme from "@/components/CartaoFilme";

const matrix = {
  id: 603,
  title: "Matrix",
  poster_path: "/m.jpg",
  release_date: "1999-03-30",
  vote_average: 8.2,
};

describe("CartaoFilme", () => {
  test("mostra título, ano, nota e link para a página do filme", () => {
    render(<CartaoFilme filme={matrix} />);
    expect(screen.getByText("Matrix")).toBeInTheDocument();
    expect(screen.getByText("1999")).toBeInTheDocument();
    expect(screen.getByText("8,2")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/filme/603");
    expect(screen.getByRole("img", { name: "Pôster de Matrix" }).getAttribute("src")).toContain(
      "m.jpg",
    );
  });

  test("usa a imagem genérica quando não há pôster", () => {
    render(<CartaoFilme filme={{ ...matrix, poster_path: null }} />);
    expect(screen.getByRole("img").getAttribute("src")).toContain("sem-imagem.svg");
  });
});
