import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function ClientesPage() {
const supabase = await createClient();
const { data: clientes, error } = await supabase
.from("clientes")
.select("*")
.order("criado_em", { ascending: false });
return (
<div>
<div className="page-header-row">
<div>
<h1 className="page-title">Clientes</h1>
<p className="page-subtitle">Gerencie os clientes da Minowa</p>
</div>
<Link href="/clientes/novo" className="primary-button">
+ Novo cliente
</Link>
</div>
{error && (
<p className="auth-error">Erro ao carregar clientes: {error.message}</p>
)}
<div className="table-card">
<table className="data-table">
<thead>
<tr>
<th>Nome</th>
<th>CPF/CNPJ</th>
<th>Telefone</th>
<th>E-mail</th>
<th>Cidade</th>
<th>Origem</th>
</tr>
</thead>
<tbody>
{(!clientes || clientes.length === 0) && (
<tr>
<td colSpan={6} className="empty-row">
Nenhum cliente cadastrado.
</td>
</tr>
)}
{clientes?.map((c: any) => (
<tr key={c.id}>
<td>
<Link href={`/clientes/${c.id}`} style={{ color: "inherit", textDecoration: "none" }}>
{c.nome}
</Link>
</td>
<td>{c.cpf_cnpj || "—"}</td>
<td>{c.telefone || "—"}</td>
<td>{c.email || "—"}</td>
<td>{c.cidade || "—"}</td>
<td className="capitalize">{c.origem}</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
);
}
