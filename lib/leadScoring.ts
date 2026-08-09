export type DadosLead = {
veiculoInteresse?: string;
formaPagamento?: string;
prazoDecisao?: string;
telefone?: string;
aceitouVisita?: boolean;
};
export function classificarLead(d: DadosLead): { classificacao: "quente" | "morno" | "frio"; pontos: number } {
let pontos = 0;
if (d.veiculoInteresse) pontos += 2;
if (d.formaPagamento) pontos += 2;
if (d.prazoDecisao === "curto") pontos += 2;
if (d.telefone) pontos += 2;
if (d.aceitouVisita) pontos += 2;
let classificacao: "quente" | "morno" | "frio" = "frio";
if (pontos >= 7) classificacao = "quente";
else if (pontos >= 3) classificacao = "morno";
return { classificacao, pontos };
}
