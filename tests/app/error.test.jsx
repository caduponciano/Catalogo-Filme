import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PaginaErro from "@/app/error";

describe("página de erro", () => {
  test("mostra a mensagem e tenta de novo", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const retry = vi.fn();
    render(<PaginaErro error={new Error("x")} retry={retry} />);
    expect(screen.getByText("Não foi possível carregar os filmes")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
