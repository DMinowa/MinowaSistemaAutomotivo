import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
const FILTERS = [
{ label: "Todas", value: "" },
{ label: "Em andamento", value: "em_andamento" },
{ label: "Concluídas", value: "concluida" },
{ label: "Canceladas", value: "cancelada" },
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
if (value === null || value === undefined) return "—";
return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export default async function VendasPage({
searchParams,
}: {
searchParams: { status?: string };
}) {
const status = searchParams?.status ?? "";
const supabase = await createClient();
let query = supabase
.from("vendas")
.select("*, cliente:clientes(nome), veiculo:veiculos(marca, modelo)")
.order("criado_em", { ascending: false });
if (status) {
query = query.eq("status", status);
}
const { data: vendas, error } = await query;
return (
<div>
<div className="page-header-row">
<div>
<h1 className="page-title">Vendas</h1>
<p className="page-subtitle">Registre e acompanhe as vendas da Minowa</p>
</div>
<Link href="/vendas/novo" className="primary-button">
+ Nova venda
</Link>
</div>
<div className="filter-row">
{FILTERS.map((f) => (
<Link
key={f.value}
href={f.value ? `/vendas?status=${f.value}` : "/vendas"}
className={`filter-chip ${status === f.value ? "active" : ""}`}
>
{f.label}
</Link>
))}
</div>
{error && (
<p className="auth-error">Erro ao carregar vendas: {error.message}</p>
)}
<div className="table-card">
<table className="data-table">
<thead>
<tr>
<th>Cliente</th>
<th>Veículo</th>
<th>Forma de pagamento</th>
<th>Valor</th>
<th>Status</th>
<th>Data</th>
</tr>
</thead>
<tbody>
{(!vendas || vendas.length === 0) && (
<tr>
<td colSpan={6} className="empty-row">
Nenhuma venda registrada.
</td>
</tr>
)}
{vendas?.map((v: any) => (
<tr key={v.id}>
<td>{v.cliente?.nome || "—"}</td>
<td>
{v.veiculo ? `${v.veiculo.marca} ${v.veiculo.modelo}` : "—"}
</td>
<td>{PAGAMENTO_LABEL[v.forma_pagamento] ?? v.forma_pagamento}</td>
<td>{formatMoney(v.valor_venda)}</td>
<td>
<span className={`pill pill-venda-${v.status}`}>
{STATUS_LABEL[v.status] ?? v.status}
</span>
</td>
<td>
{v.data_venda
? new Date(v.data_venda + "T00:00:00").toLocaleDateString("pt-BR")
: "—"}
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
);
}
