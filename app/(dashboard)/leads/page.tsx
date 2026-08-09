import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
const FILTERS = [
{ label: "Todos", value: "" },
{ label: "Quentes", value: "quente" },
{ label: "Mornos", value: "morno" },
{ label: "Frios", value: "frio" },
];
const CLASSIFICACAO_LABEL: Record<string, string> = {
quente: "Quente",
morno: "Morno",
frio: "Frio",
};
const STATUS_LABEL: Record<string, string> = {
novo: "Novo",
em_atendimento: "Em atendimento",
agendado: "Agendado",
convertido: "Convertido",
perdido: "Perdido",
};
export default async function LeadsPage({
searchParams,
}: {
searchParams: { classificacao?: string };
}) {
const classificacao = searchParams?.classificacao ?? "";
const supabase = await createClient();
let query = supabase
.from("leads")
.select("*, veiculo:veiculos(marca, modelo)")
.order("criado_em", { ascending: false });
if (classificacao) {
query = query.eq("classificacao", classificacao);
}
const { data: leads, error } = await query;
return (
<div>
<div className="page-header-row">
<div>
<h1 className="page-title">Leads</h1>
<p className="page-subtitle">
Contatos recebidos pela Ana (chatbot) e cadastros manuais
</p>
</div>
<Link href="/leads/novo" className="primary-button">
+ Novo lead
</Link>
</div>
<div className="filter-row">
{FILTERS.map((f) => (
<Link
key={f.value}
href={f.value ? `/leads?classificacao=${f.value}` : "/leads"}
className={`filter-chip ${classificacao === f.value ? "active" : ""}`}
>
{f.label}
</Link>
))}
</div>
{error && (
<p className="auth-error">Erro ao carregar leads: {error.message}</p>
)}
<div className="table-card">
<table className="data-table">
<thead>
<tr>
<th>Nome</th>
<th>Telefone</th>
<th>Veículo de interesse</th>
<th>Origem</th>
<th>Classificação</th>
<th>Status</th>
<th>Data</th>
</tr>
</thead>
<tbody>
{(!leads || leads.length === 0) && (
<tr>
<td colSpan={7} className="empty-row">
Nenhum lead encontrado.
</td>
</tr>
)}
{leads?.map((lead: any) => (
<tr key={lead.id}>
<td>{lead.nome || "—"}</td>
<td>{lead.telefone || "—"}</td>
<td>
{lead.veiculo
? `${lead.veiculo.marca} ${lead.veiculo.modelo}`
: lead.modelo_interesse_texto || "—"}
</td>
<td className="capitalize">{lead.origem}</td>
<td>
<span className={`pill pill-${lead.classificacao}`}>
{CLASSIFICACAO_LABEL[lead.classificacao] ?? lead.classificacao}
</span>
</td>
<td>{STATUS_LABEL[lead.status_atendimento] ?? lead.status_atendimento}</td>
<td>
{lead.criado_em
? new Date(lead.criado_em).toLocaleDateString("pt-BR")
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
