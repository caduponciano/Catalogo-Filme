import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NaoEncontrado from "@/app/not-found";

describe("página não encontrada", () => {
  test("avisa e leva de volta ao catálogo", () => {
    render(<NaoEncontrado />);
    expect(screen.getByText("Filme não encontrado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar ao catálogo" })).toHaveAttribute("href", "/");
  });
});
