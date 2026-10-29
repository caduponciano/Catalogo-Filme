// Funções puras que leem e validam os parâmetros da URL.
// Nunca confiamos no que vem na URL: valores inválidos viram o padrão.

const ORDENS = ["popularidade", "nota", "lancamento"];
const LIMITE_PAGINAS = 500;

function primeiro(valor) {
  return Array.isArray(valor) ? valor[0] : valor;
}

function lerInteiro(valor) {
  const texto = primeiro(valor);
  return /^\d+$/.test(texto ?? "") ? Number(texto) : null;
}

function lerIdDaLista(valor, idsValidos) {
  const id = lerInteiro(valor);
  return idsValidos.includes(id) ? id : null;
}

export function lerPagina(valor) {
  const pagina = lerInteiro(valor);
  if (!pagina) return 1;
  return Math.min(pagina, LIMITE_PAGINAS);
}

export function lerFiltros(searchParams, { streamings, generos }) {
  const ordem = primeiro(searchParams.ordem);
  return {
    streaming: lerIdDaLista(searchParams.streaming, streamings),
    genero: lerIdDaLista(searchParams.genero, generos),
    ordem: ORDENS.includes(ordem) ? ordem : "popularidade",
    pagina: lerPagina(searchParams.pagina),
  };
}

export function paraQuery(parametros) {
  const busca = new URLSearchParams();
  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor !== null && valor !== undefined && valor !== "") busca.set(chave, valor);
  }
  return busca.toString();
}
