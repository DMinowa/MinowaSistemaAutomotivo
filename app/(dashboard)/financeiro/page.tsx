import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FinanceiroFiltros from "@/components/financeiro/FinanceiroFiltros";
import ImprimirButton from "@/components/financeiro/ImprimirButton";
export const dynamic = "force-dynamic";
const TABS = [
{ id: "vendas", label: "🛒 Vendas" },
{ id: "promissorias", label: "📄 Promissórias" },
{ id: "comissoes", label: "🎯 Comissões" },
{ id: "lista", label: "☰ Lista" },
{ id: "financ", label: "📊 Financ." },
{ id: "nfe", label: "📃 NF-e" },
];
const STATUS_LABEL: Record<string, string> = {
em_andamento: "Em andamento",
concluida: "Concluída",
cancelada: "Cancelada",
};
const PAGAMENTO_LABEL: Record<string, string> = {
a_vista: "À vista",
financiamento: "Financiamento",
troca: "Troca",
};
function formatMoney(value: number | null) {
if (value === null || value === undefined) return "R$ 0,00";
return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function getRangeForPeriodo(periodo: string) {
const hoje = new Date();
const ano = hoje.getFullYear();
const mes = hoje.getMonth();
if (periodo === "mes_passado") {
const inicio = new Date(ano, mes - 1, 1);
const fim = new Date(ano, mes, 0);
return { inicio: inicio.toISOString().slice(0, 10), fim: fim.toISOString().slice(0, 10) };
}
if (periodo === "este_ano") {
return { inicio: `${ano}-01-01`, fim: `${ano}-12-31` };
}
if (periodo === "todos") {
return null;
}
// mes_atual (default)
const inicio = new Date(ano, mes, 1);
const fim = new Date(ano, mes + 1, 0);
return { inicio: inicio.toISOString().slice(0, 10), fim: fim.toISOString().slice(0, 10) };
}
export default async function FinanceiroPage({
searchParams,
}: {
searchParams: { aba?: string; periodo?: string; vendedor?: string; status?: string };
}) {
const supabase = await createClient();
const abaAtiva = searchParams?.aba ?? "vendas";
const periodo = searchParams?.periodo ?? "mes_atual";
const vendedorId = searchParams?.vendedor ?? "";
const statusFiltro = searchParams?.status ?? "";
const { data: vendedores } = await supabase.from("usuarios").select("id, nome").order("nome");
// Cards fixos do mês atual (independem dos filtros abaixo)
const rangeMesAtual = getRangeForPeriodo("mes_atual");
let cardsQuery = supabase
.from("vendas")
.select("valor_venda, veiculo:veiculos(preco_compra)")
.eq("status", "concluida");
if (rangeMesAtual) {
cardsQuery = cardsQuery.gte("data_venda", rangeMesAtual.inicio).lte("data_venda", rangeMesAtual.fim);
}
const { data: vendasDoMes } = await cardsQuery;
const vendasNoMesCount = vendasDoMes?.length ?? 0;
const totalVendasNoMes = (vendasDoMes ?? []).reduce((soma, v: any) => soma + (v.valor_venda ?? 0), 0);
const lucroDoMes = (vendasDoMes ?? []).reduce((soma, v: any) => {
const custo = v.veiculo?.preco_compra ?? 0;
return soma + ((v.valor_venda ?? 0) - custo);
}, 0);
const margemDoMes = totalVendasNoMes > 0 ? (lucroDoMes / totalVendasNoMes) * 100 : 0;
// Histórico filtrado (respeita os filtros da tela)
const range = getRangeForPeriodo(periodo);
let historicoQuery = supabase
.from("vendas")
.select("*, cliente:clientes(nome), veiculo:veiculos(marca, modelo), vendedor:usuarios(nome)")
.order("data_venda", { ascending: false });
if (range) {
historicoQuery = historicoQuery.gte("data_venda", range.inicio).lte("data_venda", range.fim);
}
if (vendedorId) {
historicoQuery = historicoQuery.eq("vendedor_id", vendedorId);
}
if (statusFiltro) {
historicoQuery = historicoQuery.eq("status", statusFiltro);
}
const { data: historico, error } = await historicoQuery;
function tabHref(tabId: string) {
const params = new URLSearchParams();
params.set("aba", tabId);
if (periodo !== "mes_atual") params.set("periodo", periodo);
if (vendedorId) params.set("vendedor", vendedorId);
if (statusFiltro) params.set("status", statusFiltro);
return `/financeiro?${params.toString()}`;
}
return (
<div>
<h1 className="page-title">Financeiro</h1>
<p className="page-subtitle">Relatórios de vendas, comissões e financiamentos</p>
<div className="cards-row">
<div className="card">
<div className="card-label">Vendas no Mês</div>
<div className="card-value">{vendasNoMesCount} venda{vendasNoMesCount !== 1 ? "s" : ""}</div>
<div className="card-hint">Total: {formatMoney(totalVendasNoMes)}</div>
</div>
<div className="card">
<div className="card-label">Lucro do Mês</div>
<div className="card-value" style={{ color: "#5ac882" }}>
{formatMoney(lucroDoMes)}
</div>
<div className="card-hint">Margem: {margemDoMes.toFixed(0)}%</div>
</div>
</div>
<div className="filter-row">
{TABS.map((tab) => (
<Link
key={tab.id}
href={tabHref(tab.id)}
className={`filter-chip ${abaAtiva === tab.id ? "active" : ""}`}
>
{tab.label}
</Link>
))}
</div>
{abaAtiva === "vendas" ? (
<>
<div style={{ marginBottom: 16 }}>
<FinanceiroFiltros vendedores={vendedores ?? []} />
</div>
<div className="page-header-row" style={{ marginBottom: 8 }}>
<div />
<ImprimirButton />
</div>
{error && (
<p className="auth-error">Erro ao carregar histórico: {error.message}</p>
)}
<div className="widget-card">
<div className="widget-title" style={{ marginBottom: 12 }}>
Histórico de Vendas
</div>
{(!historico || historico.length === 0) ? (
<p className="empty-state">Nenhuma venda encontrada no período</p>
) : (
<div className="table-card" style={{ border: "none" }}>
<table className="data-table">
<thead>
<tr>
<th>Data</th>
<th>Cliente</th>
<th>Veículo</th>
<th>Vendedor</th>
<th>Pagamento</th>
<th>Valor</th>
<th>Status</th>
</tr>
</thead>
<tbody>
{historico.map((v: any) => (
<tr key={v.id}>
<td>
{v.data_venda
? new Date(v.data_venda + "T00:00:00").toLocaleDateString("pt-BR")
: "—"}
</td>
<td>{v.cliente?.nome || "—"}</td>
<td>{v.veiculo ? `${v.veiculo.marca} ${v.veiculo.modelo}` : "—"}</td>
<td>{v.vendedor?.nome || "—"}</td>
<td>{PAGAMENTO_LABEL[v.forma_pagamento] ?? v.forma_pagamento}</td>
<td>{formatMoney(v.valor_venda)}</td>
<td>
<span className={`pill pill-venda-${v.status}`}>
{STATUS_LABEL[v.status] ?? v.status}
</span>
</td>
</tr>
))}
</tbody>
</table>
</div>
)}
</div>
</>
) : (
<div className="widget-card">
<p className="empty-state">
Esta aba ({TABS.find((t) => t.id === abaAtiva)?.label}) ainda está em construção.
</p>
</div>
)}
</div>
);
}
