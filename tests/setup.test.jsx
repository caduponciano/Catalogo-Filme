import { render, screen } from "@testing-library/react";
import { test, expect } from "vitest";

test("o ambiente de testes renderiza React", () => {
  render(<p>funcionando</p>);
  expect(screen.getByText("funcionando")).toBeInTheDocument();
});
