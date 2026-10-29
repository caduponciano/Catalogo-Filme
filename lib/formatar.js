// Funções puras que transformam dados do TMDB em texto ou endereços para a tela.

const URL_IMAGENS = "https://image.tmdb.org/t/p/";
const SEM_IMAGEM = "/sem-imagem.svg";

export function urlImagem(caminho, tamanho = "w342") {
  return caminho ? URL_IMAGENS + tamanho + caminho : SEM_IMAGEM;
}

export function extrairAno(data) {
  return data ? data.slice(0, 4) : "";
}

export function formatarNota(nota) {
  return nota ? nota.toFixed(1).replace(".", ",") : "–";
}
