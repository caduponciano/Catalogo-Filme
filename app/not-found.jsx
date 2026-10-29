import Link from "next/link";
import estilos from "./aviso.module.css";

export default function NaoEncontrado() {
  return (
    <div className={estilos.aviso}>
      <h1>Filme não encontrado</h1>
      <p>O endereço pode estar errado ou o filme não existe mais no TMDB.</p>
      <Link href="/" className={estilos.botao}>
        Voltar ao catálogo
      </Link>
    </div>
  );
}
