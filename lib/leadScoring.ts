export type DadosLead = {
veiculoInteresse?: string;
formaPagamento?: string;
prazoDecisao?: string;
telefone?: string;
aceitouVisita?: boolean;
// Sinal de intenção explícita de financiamento (ex: solicitação de simulação via OLX).
// Opcional — não quebra chamadas existentes que não passam esse campo.
solicitouSimulacaoFinanciamento?: boolean;
};
export function classificarLead(d: DadosLead): { classificacao: "quente" | "morno" | "frio"; pontos: number } {
let pontos = 0;
if (d.veiculoInteresse) pontos += 2;
if (d.formaPagamento) pontos += 2;
if (d.prazoDecisao === "curto") pontos += 2;
if (d.telefone) pontos += 2;
if (d.aceitouVisita) pontos += 2;
// Solicitar simulação de financiamento é um sinal forte de intenção de compra
if (d.solicitouSimulacaoFinanciamento) pontos += 3;
let classificacao: "quente" | "morno" | "frio" = "frio";
if (pontos >= 7) classificacao = "quente";
else if (pontos >= 3) classificacao = "morno";
return { classificacao, pontos };
}
