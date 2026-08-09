import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EnviarWhatsAppButton from "@/components/veiculos/EnviarWhatsAppButton";
export const dynamic = "force-dynamic";
const FILTERS = [
{ label: "Todos", value: "" },
{ label: "Disponíveis", value: "disponivel" },
{ label: "Reservados", value: "reservado" },
{ label: "Em preparação", value: "em_preparacao" },
{ label: "Vendidos", value: "vendido" },
];
const STATUS_LABEL: Record<string, string> = {
disponivel: "Disponível",
reservado: "Reservado",
em_preparacao: "Em preparação",
vendido: "Vendido",
inativo: "Inativo",
};
function formatMoney(value: number | null) {
if (value === null || value === undefined) return "—";
return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function formatKm(value: number | null) {
if (value === null || value === undefined) return "—";
return `${value.toLocaleString("pt-BR")} km`;
}
export default async function VeiculosPage({
searchParams,
}: {
searchParams: { status?: string };
}) {
const status = searchParams?.status ?? "";
const supabase = await createClient();
let query = supabase
.from("veiculos")
.select("*")
.order("criado_em", { ascending: false });
if (status) {
query = query.eq("status", status);
}
const { data: veiculos, error } = await query;
return (
<div>
<div className="page-header-row">
<div>
<h1 className="page-title">Veículos</h1>
<p className="page-subtitle">Gerencie o estoque de veículos da Minowa</p>
</div>
<Link href="/veiculos/novo" className="primary-button">
+ Novo veículo
</Link>
</div>
<div className="filter-row">
{FILTERS.map((f) => (
<Link
key={f.value}
href={f.value ? `/veiculos?status=${f.value}` : "/veiculos"}
className={`filter-chip ${status === f.value ? "active" : ""}`}
>
{f.label}
</Link>
))}
</div>
{error && (
<p className="auth-error">Erro ao carregar veículos: {error.message}</p>
)}
<div className="table-card">
<table className="data-table">
<thead>
<tr>
<th>Marca / Modelo</th>
<th>Ano</th>
<th>Placa</th>
<th>KM</th>
<th>Preço de venda</th>
<th>Status</th>
<th>Garantia</th>
<th>Ações</th>
</tr>
</thead>
<tbody>
{(!veiculos || veiculos.length === 0) && (
<tr>
<td colSpan={8} className="empty-row">
Nenhum veículo cadastrado.
</td>
</tr>
)}
{veiculos?.map((v: any) => (
<tr key={v.id}>
<td>
<Link href={`/veiculos/${v.id}`} style={{ color: "inherit", textDecoration: "none" }}>
{v.marca} {v.modelo}
{v.versao ? ` ${v.versao}` : ""}
</Link>
</td>
<td>
{v.ano_fabricacao && v.ano_modelo
? `${v.ano_fabricacao}/${v.ano_modelo}`
: v.ano_modelo || v.ano_fabricacao || "—"}
</td>
<td>{v.placa || "—"}</td>
<td>{formatKm(v.km)}</td>
<td>{formatMoney(v.preco_venda)}</td>
<td>
<span className={`pill pill-status-${v.status}`}>
{STATUS_LABEL[v.status] ?? v.status}
</span>
</td>
<td>
{v.garantia_dias ? `${v.garantia_dias} dias` : "Sem garantia"}
</td>
<td>
<EnviarWhatsAppButton
id={v.id}
marca={v.marca}
modelo={v.modelo}
versao={v.versao}
preco_venda={v.preco_venda}
ano_modelo={v.ano_modelo}
km={v.km}
/>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
);
}
