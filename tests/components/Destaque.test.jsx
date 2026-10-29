import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Destaque from "@/components/Destaque";

const filme = {
  id: 687163,
  title: "Devoradores de Estrelas",
  backdrop_path: "/fundo.jpg",
  vote_average: 8.633,
  overview: "O professor de ciências Ryland Grace acorda em uma espaçonave a anos-luz de casa.",
};

describe("Destaque", () => {
  test("mostra título, nota, sinopse e link para o filme", () => {
    render(<Destaque filme={filme} />);
    expect(screen.getByRole("heading", { name: "Devoradores de Estrelas" })).toBeInTheDocument();
    expect(screen.getByText("★ 8,6 · Em alta")).toBeInTheDocument();
    expect(screen.getByText(/Ryland Grace acorda/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver detalhes" })).toHaveAttribute("href", "/filme/687163");
  });

  test("usa a imagem de fundo do filme", () => {
    render(<Destaque filme={filme} />);
    expect(screen.getByRole("img").getAttribute("src")).toContain("fundo.jpg");
  });
});
