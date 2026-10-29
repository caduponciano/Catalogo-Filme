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

export function formatarDuracao(minutos) {
  if (!minutos) return "";
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto}min`;
  return resto === 0 ? `${horas}h` : `${horas}h ${resto}min`;
}

// Devolve a "key" do trailer no YouTube: primeiro em português, senão em inglês.
export function escolherTrailer(videos = []) {
  const trailers = videos.filter((v) => v.site === "YouTube" && v.type === "Trailer");
  const escolhido =
    trailers.find((v) => v.iso_639_1 === "pt") ?? trailers.find((v) => v.iso_639_1 === "en");
  return escolhido ? escolhido.key : null;
}

// Recebe os dados de "onde assistir" do Brasil e mantém só os principais streamings por assinatura.
export function ondeAssistir(provedoresBR, idsPrincipais) {
  const lista = (provedoresBR?.flatrate ?? [])
    .filter((p) => idsPrincipais.includes(p.provider_id))
    .map((p) => ({ id: p.provider_id, nome: p.provider_name, logo: p.logo_path }));
  return { lista, link: lista.length > 0 ? (provedoresBR.link ?? null) : null };
}

// O filme em destaque é o primeiro da lista que tem imagem de fundo (backdrop).
export function escolherDestaque(filmes) {
  return filmes.find((filme) => filme.backdrop_path) ?? null;
}

// Encurta um texto sem cortar palavras no meio.
export function resumir(texto, limite) {
  if (!texto) return "";
  if (texto.length <= limite) return texto;
  const corte = texto.lastIndexOf(" ", limite);
  return texto.slice(0, corte > 0 ? corte : limite) + "…";
}
