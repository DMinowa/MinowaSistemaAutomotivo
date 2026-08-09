export type ResultadoSimulacao = {
valorFinanciado: number;
parcela: number;
totalPago: number;
totalJuros: number;
taxaMensal: number;
cetAproximado: number;
};
// Tabela Price: PV * i / (1 - (1+i)^-n)
export function simularFinanciamento(
valorVeiculo: number,
valorEntrada: number,
prazoMeses: number,
taxaMensalPercentual: number
): ResultadoSimulacao {
const valorFinanciado = Math.max(valorVeiculo - valorEntrada, 0);
const i = taxaMensalPercentual / 100;
const parcela =
i === 0
? valorFinanciado / prazoMeses
: (valorFinanciado * i) / (1 - Math.pow(1 + i, -prazoMeses));
const totalPago = parcela * prazoMeses;
const totalJuros = totalPago - valorFinanciado;
// CET ilustrativo: taxa mensal + estimativa de IOF/tarifas (~0,38% + 0,0082%/dia ~ arredondado)
const cetAproximado = taxaMensalPercentual + 0.35;
return {
valorFinanciado,
parcela,
totalPago,
totalJuros,
taxaMensal: taxaMensalPercentual,
cetAproximado,
};
}
export const PRAZOS_DISPONIVEIS = [12, 24, 36, 48, 60];
// Taxa ilustrativa padrão do mercado para financiamento de veículo com garantia
// (ajustar quando a integração oficial com a API da Creditas estiver disponível)
export const TAXA_MENSAL_PADRAO = 1.99;
