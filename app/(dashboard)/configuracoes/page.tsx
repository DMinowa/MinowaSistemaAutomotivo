import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EmpresaForm from "@/components/configuracoes/EmpresaForm";
import IntegracaoOlxPanel from "@/components/configuracoes/IntegracaoOlxPanel";
export const dynamic = "force-dynamic";
const TABS = [
{ id: "empresa", label: "🏢 Empresa" },
{ id: "usuarios", label: "👥 Usuários" },
{ id: "integracoes", label: "🔌 Integrações" },
{ id: "preferencias", label: "⚙ Preferências" },
{ id: "consultas", label: "🔍 Consultas" },
{ id: "fiscal", label: "📄 Fiscal" },
];
const PAPEL_LABEL: Record<string, string> = {
admin: "Administrador",
gerente: "Gerente",
vendedor: "Vendedor",
};
export default async function ConfiguracoesPage({
searchParams,
}: {
searchParams: { aba?: string };
}) {
const supabase = await createClient();
const abaAtiva = searchParams?.aba ?? "empresa";
const { data: empresaData } = await supabase.from("empresa").select("*").limit(1).single();
const { data: usuarios } = await supabase
.from("usuarios")
.select("id, nome, email, telefone, papel, ativo")
.order("nome");
return (
<div>
<h1 className="page-title">Configurações</h1>
<p className="page-subtitle">
Gerencie os dados da empresa, usuários, integrações e preferências do sistema
</p>
<div className="filter-row">
{TABS.map((tab) => (
<Link
key={tab.id}
href={`/configuracoes?aba=${tab.id}`}
className={`filter-chip ${abaAtiva === tab.id ? "active" : ""}`}
>
{tab.label}
</Link>
))}
</div>
{abaAtiva === "empresa" && empresaData && <EmpresaForm empresa={empresaData} />}
{abaAtiva === "usuarios" && (
<div className="widget-card">
<div className="page-header-row" style={{ marginBottom: 8 }}>
<div className="widget-title">Usuários do sistema</div>
</div>
<p className="form-hint" style={{ marginBottom: 16 }}>
Para adicionar um novo usuário, peça para a pessoa criar uma conta na tela de
login (opção "Criar acesso") e avise o Daniel para liberar o acesso.
</p>
<div className="table-card" style={{ border: "none" }}>
<table className="data-table">
<thead>
<tr>
<th>Nome</th>
<th>E-mail</th>
<th>Telefone</th>
<th>Papel</th>
<th>Status</th>
</tr>
</thead>
<tbody>
{(!usuarios || usuarios.length === 0) && (
<tr>
<td colSpan={5} className="empty-row">
Nenhum usuário cadastrado.
</td>
</tr>
)}
{usuarios?.map((u: any) => (
<tr key={u.id}>
<td>{u.nome}</td>
<td>{u.email}</td>
<td>{u.telefone || "—"}</td>
<td className="capitalize">{PAPEL_LABEL[u.papel] ?? u.papel}</td>
<td>
<span className={`pill ${u.ativo ? "pill-status-disponivel" : "pill-status-inativo"}`}>
{u.ativo ? "Ativo" : "Inativo"}
</span>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
)}
{abaAtiva === "integracoes" && <IntegracaoOlxPanel />}
{abaAtiva !== "empresa" && abaAtiva !== "usuarios" && abaAtiva !== "integracoes" && (
<div className="widget-card">
<p className="empty-state">
Esta aba ({TABS.find((t) => t.id === abaAtiva)?.label}) ainda está em construção.
</p>
</div>
)}
</div>
);
}
