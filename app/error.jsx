"use client"; // páginas de erro precisam rodar no navegador para o botão funcionar

import { useEffect } from "react";
import estilos from "./aviso.module.css";

export default function PaginaErro({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={estilos.aviso}>
      <h1>Não foi possível carregar os filmes</h1>
      <p>Pode ser uma instabilidade passageira no TMDB.</p>
      <button type="button" onClick={() => retry()} className={estilos.botao}>
        Tentar novamente
      </button>
    </div>
  );
}
