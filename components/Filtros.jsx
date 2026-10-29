import estilos from "./Filtros.module.css";

const ORDENACOES = [
  { valor: "popularidade", nome: "Popularidade" },
  { valor: "nota", nome: "Nota" },
  { valor: "lancamento", nome: "Lançamento" },
];

// Formulário GET: ao enviar, os campos viram parâmetros da URL (?streaming=8&genero=28...).
// O campo "pagina" fica de fora de propósito, para que um filtro novo comece na página 1.
export default function Filtros({ streamings, generos, filtros }) {
  return (
    <form method="get" action="/" className={estilos.filtros}>
      <label className={estilos.campo}>
        Streaming
        <select name="streaming" defaultValue={filtros.streaming ?? ""}>
          <option value="">Todos os streamings</option>
          {streamings.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>
      </label>

      <label className={estilos.campo}>
        Gênero
        <select name="genero" defaultValue={filtros.genero ?? ""}>
          <option value="">Todos os gêneros</option>
          {generos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nome}
            </option>
          ))}
        </select>
      </label>

      <label className={estilos.campo}>
        Ordenar por
        <select name="ordem" defaultValue={filtros.ordem}>
          {ORDENACOES.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.nome}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" className={estilos.botao}>
        Filtrar
      </button>
    </form>
  );
}
