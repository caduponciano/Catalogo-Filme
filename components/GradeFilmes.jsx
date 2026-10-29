import CartaoFilme from "./CartaoFilme";
import estilos from "./GradeFilmes.module.css";

export default function GradeFilmes({
  filmes,
  mensagemVazia = "Nenhum filme encontrado com esses filtros.",
}) {
  if (filmes.length === 0) {
    return <p className={estilos.vazia}>{mensagemVazia}</p>;
  }

  return (
    <ul className={estilos.grade}>
      {filmes.map((filme) => (
        <li key={filme.id}>
          <CartaoFilme filme={filme} />
        </li>
      ))}
    </ul>
  );
}
