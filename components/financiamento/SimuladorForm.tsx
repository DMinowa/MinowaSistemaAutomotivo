"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
simularFinanciamento,
PRAZOS_DISPONIVEIS,
TAXA_MENSAL_PADRAO,
type ResultadoSimulacao,
} from "@/lib/financiamento";
type Veiculo = { id: string; marca: string; modelo: string; preco_venda: number | null };
function formatMoney(value: number) {
return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export default function SimuladorForm({ veiculos }: { veiculos: Veiculo[] }) {
const [veiculoId, setVeiculoId] = useState("");
const [valorVeiculo, setValorVeiculo] = useState("");
const [valorEntrada, setValorEntrada] = useState("");
const [prazo, setPrazo] = useState(48);
const [nome, setNome] = useState("");
const [cpf, setCpf] = useState("");
const [email, setEmail] = useState("");
const [telefone, setTelefone] = useState("");
const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);
const [salvando, setSalvando] = useState(false);
const [mensagem, setMensagem] = useState<string | null>(null);
function handleVeiculoChange(id: string) {
setVeiculoId(id);
const v = veiculos.find((v) => v.id === id);
if (v?.preco_venda) {
setValorVeiculo(String(v.preco_venda));
}
}
function handleSimular(e: React.FormEvent) {
e.preventDefault();
const valor = parseFloat(valorVeiculo.replace(",", ".")) || 0;
const entrada = parseFloat(valorEntrada.replace(",", ".")) || 0;
if (valor <= 0) {
setMensagem("Informe o valor do veículo.");
return;
}
setMensagem(null);
const r = simularFinanciamento(valor, entrada, prazo, TAXA_MENSAL_PADRAO);
setResultado(r);
}
async function handleRegistrarInteresse() {
if (!resultado) return;
setSalvando(true);
setMensagem(null);
const supabase = createClient();
const veiculo = veiculos.find((v) => v.id === veiculoId);
const resumo = [
`Simulação de financiamento (modelo Creditas):`,
veiculo ? `Veículo: ${veiculo.marca} ${veiculo.modelo}` : null,
`Valor do veículo: ${formatMoney(parseFloat(valorVeiculo.replace(",", ".")) || 0)}`,
`Entrada: ${formatMoney(parseFloat(valorEntrada.replace(",", ".")) || 0)}`,
`Prazo: ${prazo}x`,
`Parcela estimada: ${formatMoney(resultado.parcela)}`,
`CET aproximado: ${resultado.cetAproximado.toFixed(2)}% a.m.`,
cpf ? `CPF: ${cpf}` : null,
]
.filter(Boolean)
.join("\n");
const { error } = await supabase.from("leads").insert({
nome: nome || null,
telefone: telefone || null,
origem: "site",
veiculo_interesse_id: veiculoId || null,
forma_pagamento: "financiamento",
classificacao: "quente",
observacoes: resumo,
});
setSalvando(false);
if (error) {
setMensagem("Erro ao registrar: " + error.message);
return;
}
setMensagem(
"Interesse registrado como lead! Como a integração oficial com a Creditas ainda não está configurada, entre em contato manualmente com a Creditas (ou peça para o cliente ligar) para formalizar a proposta real."
);
}
return (
<div>
<div className="widget-card">
<div className="widget-title" style={{ marginBottom: 4 }}>
💰 Simulador de Financiamento
</div>
<p className="form-hint" style={{ marginBottom: 16 }}>
Modelo baseado no fluxo da Creditas (Elegibilidade → Oferta → Proposta). Esta é uma
simulação ilustrativa com taxa de mercado — não é uma oferta oficial da Creditas.
</p>
<form onSubmit={handleSimular}>
<div className="form-grid">
<div className="form-group">
<label className="form-label">Veículo do estoque (opcional)</label>
<select
className="form-select"
value={veiculoId}
onChange={(e) => handleVeiculoChange(e.target.value)}
>
<option value="">— Selecionar —</option>
{veiculos.map((v) => (
<option key={v.id} value={v.id}>
{v.marca} {v.modelo}
</option>
))}
</select>
</div>
<div className="form-group">
<label className="form-label">Valor do veículo *</label>
<input
className="form-input"
inputMode="decimal"
value={valorVeiculo}
onChange={(e) => setValorVeiculo(e.target.value)}
placeholder="0,00"
/>
</div>
<div className="form-group">
<label className="form-label">Valor de entrada</label>
<input
className="form-input"
inputMode="decimal"
value={valorEntrada}
onChange={(e) => setValorEntrada(e.target.value)}
placeholder="0,00"
/>
</div>
<div className="form-group">
<label className="form-label">Prazo</label>
<select
className="form-select"
value={prazo}
onChange={(e) => setPrazo(Number(e.target.value))}
>
{PRAZOS_DISPONIVEIS.map((p) => (
<option key={p} value={p}>
{p}x
</option>
))}
</select>
</div>
<div className="form-group">
<label className="form-label">Nome do cliente</label>
<input className="form-input" value={nome} onChange={(e) => setNome(e.target.value)} />
</div>
<div className="form-group">
<label className="form-label">Telefone</label>
<input
className="form-input"
value={telefone}
onChange={(e) => setTelefone(e.target.value)}
placeholder="(85) 99999-9999"
/>
</div>
<div className="form-group">
<label className="form-label">CPF</label>
<input className="form-input" value={cpf} onChange={(e) => setCpf(e.target.value)} />
</div>
<div className="form-group">
<label className="form-label">E-mail</label>
<input
className="form-input"
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
/>
</div>
</div>
<div className="form-actions" style={{ justifyContent: "flex-start" }}>
<button type="submit" className="primary-button">
Simular
</button>
</div>
</form>
</div>
{resultado && (
<div className="cards-row">
<div className="card">
<div className="card-label">VALOR FINANCIADO</div>
<div className="card-value">{formatMoney(resultado.valorFinanciado)}</div>
</div>
<div className="card">
<div className="card-label">PARCELA ESTIMADA</div>
<div className="card-value" style={{ color: "#e0263c" }}>
{formatMoney(resultado.parcela)}
</div>
<div className="card-hint">{prazo}x</div>
</div>
<div className="card">
<div className="card-label">TOTAL A PAGAR</div>
<div className="card-value">{formatMoney(resultado.totalPago)}</div>
<div className="card-hint">Juros: {formatMoney(resultado.totalJuros)}</div>
</div>
<div className="card">
<div className="card-label">CET APROXIMADO</div>
<div className="card-value">{resultado.cetAproximado.toFixed(2)}%</div>
<div className="card-hint">ao mês (ilustrativo)</div>
</div>
</div>
)}
{resultado && (
<div className="widget-card">
<p className="form-hint" style={{ marginBottom: 12 }}>
Gostou da simulação? Registre o interesse do cliente como lead para dar sequência ao
atendimento (a proposta oficial precisa ser formalizada diretamente com a Creditas até
a integração via API estar configurada).
</p>
{mensagem && (
<p className={mensagem.startsWith("Erro") ? "auth-error" : "form-hint"}>{mensagem}</p>
)}
<button
type="button"
className="primary-button"
onClick={handleRegistrarInteresse}
disabled={salvando}
>
{salvando ? "Registrando..." : "Registrar interesse (criar lead)"}
</button>
</div>
)}
</div>
);
}
