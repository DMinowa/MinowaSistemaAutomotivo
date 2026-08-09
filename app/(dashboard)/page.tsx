import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import VendasChart from "@/components/dashboard/VendasChart";
export const dynamic = "force-dynamic";
function formatMoney(value: number | null) {
if (value === null || value === undefined) return "—";
return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function diasEntre(dataISO: string) {
const inicio = new Date(dataISO + "T00:00:00");
const hoje = new Date();
const diffMs = hoje.getTime() - inicio.getTime();
return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}
const MESES = [
"Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
"Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
async function getDashboardData() {
const supabase = await createClient();
const {
data: { user },
} = await supabase.auth.getUser();
const hoje = new Date();
const seteDiasAtras = new Date(hoje);
seteDiasAtras.setDate(hoje.getDate() - 6);
const seteDiasAtrasISO = seteDiasAtras.toISOString().slice(0, 10);
const [
veiculosDisponiveisRes,
veiculosReservadosRes,
veiculosPreparacaoRes,
clientesRes,
todosClientesRes,
vendasConcluidasRes,
vendasUltimos7DiasRes,
veiculosParadosRes,
veiculosDestaqueRes,
] = await Promise.all([
supabase.from("veiculos").select("*", { count: "exact", head: true }).eq("status", "disponivel"),
supabase.from("veiculos").select("*", { count: "exact", head: true }).eq("status", "reservado"),
supabase.from("veiculos").select("*", { count: "exact", head: true }).eq("status", "em_preparacao"),
supabase.from("clientes").select("*", { count: "exact", head: true }),
supabase.from("clientes").select("id, nome, data_nascimento").not("data_nascimento", "is", null),
supabase
.from("vendas")
.select("veiculo:veiculos(marca, modelo)")
.eq("status", "concluida"),
supabase
.from("vendas")
.select("data_venda")
.gte("data_venda", seteDiasAtrasISO),
supabase
.from("veiculos")
.select("id, marca, modelo, data_entrada")
.eq("status", "disponivel")
.order("data_entrada", { ascending: true })
.limit(5),
supabase
.from("veiculos")
.select("id, marca, modelo, ano_modelo, km, preco_venda")
.eq("status", "disponivel")
.order("criado_em", { ascending: false })
.limit(6),
]);
const mesAtual = hoje.getMonth() + 1;
const aniversariantes = (todosClientesRes.data ?? []).filter((c: any) => {
if (!c.data_nascimento) return false;
const mes = parseInt(String(c.data_nascimento).split("-")[1], 10);
return mes === mesAtual;
});
const contagem = new Map<string, number>();
(vendasConcluidasRes.data ?? []).forEach((v: any) => {
if (!v.veiculo) return;
const chave = `${v.veiculo.marca} ${v.veiculo.modelo}`;
contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
});
const maisVendidos = Array.from(contagem.entries())
.map(([nome, total]) => ({ nome, total }))
.sort((a, b) => b.total - a.total)
.slice(0, 5);
const contagemPorDia = new Map<string, number>();
(vendasUltimos7DiasRes.data ?? []).forEach((v: any) => {
contagemPorDia.set(v.data_venda, (contagemPorDia.get(v.data_venda) ?? 0) + 1);
});
const vendas7Dias = [];
for (let i = 6; i >= 0; i--) {
const d = new Date(hoje);
d.setDate(hoje.getDate() - i);
const iso = d.toISOString().slice(0, 10);
const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
vendas7Dias.push({ dia: label, vendas: contagemPorDia.get(iso) ?? 0 });
}
const veiculosParados = (veiculosParadosRes.data ?? []).map((v: any) => ({
...v,
dias: v.data_entrada ? diasEntre(v.data_entrada) : 0,
}));
return {
userEmail: user?.email ?? "",
veiculosDisponiveis: veiculosDisponiveisRes.count ?? 0,
veiculosReservados: veiculosReservadosRes.count ?? 0,
veiculosPreparacao: veiculosPreparacaoRes.count ?? 0,
clientes: clientesRes.count ?? 0,
aniversariantes,
mesNome: MESES[hoje.getMonth()],
maisVendidos,
vendas7Dias,
veiculosParados,
veiculosDestaque: veiculosDestaqueRes.data ?? [],
};
}
export default async function DashboardPage() {
const data = await getDashboardData();
return (
<div>
<h1 className="page-title">Olá, {data.userEmail ? data.userEmail.split("@")[0] : ""}!</h1>
<p className="page-subtitle">Bem-vindo ao painel da Minowa</p>
<div className="cards-row">
<div className="card">
<div className="card-label">Veículos Disponíveis</div>
<div className="card-value">{data.veiculosDisponiveis}</div>
<div className="card-hint">{data.veiculosReservados} reservados</div>
</div>
<div className="card">
<div className="card-label">Clientes</div>
<div className="card-value">{data.clientes}</div>
<div className="card-hint">cadastrados no sistema</div>
</div>
<div className="card">
<div className="card-label">Veículos em Preparação</div>
<div className="card-value">{data.veiculosPreparacao}</div>
<div className="card-hint">aguardando liberação para venda</div>
</div>
</div>
<div className="cards-row">
<div className="widget-card">
<div className="widget-header">
<div>
<div className="widget-title">Aniversariantes do mês</div>
<div className="widget-subtitle">{data.mesNome}</div>
</div>
<span className="widget-count">{data.aniversariantes.length}</span>
</div>
{data.aniversariantes.length === 0 ? (
<p className="empty-state">Nenhum aniversariante este mês</p>
) : (
<ul className="simple-list">
{data.aniversariantes.map((c: any) => (
<li key={c.id} className="simple-list-item">
<span className="avatar-dot">{c.nome?.[0]?.toUpperCase() ?? "?"}</span>
<span>{c.nome}</span>
<span className="simple-list-meta">
{new Date(c.data_nascimento + "T00:00:00").toLocaleDateString("pt-BR", {
day: "2-digit",
month: "2-digit",
})}
</span>
</li>
))}
</ul>
)}
</div>
<div className="widget-card">
<div className="widget-header">
<div>
<div className="widget-title">Mais vendidos</div>
<div className="widget-subtitle">Top marcas e modelos da loja</div>
</div>
</div>
{data.maisVendidos.length === 0 ? (
<p className="empty-state">Nenhuma venda registrada ainda</p>
) : (
<ul className="simple-list">
{data.maisVendidos.map((m) => (
<li key={m.nome} className="simple-list-item">
<span>{m.nome}</span>
<span className="simple-list-meta">{m.total} vendido{m.total > 1 ? "s" : ""}</span>
</li>
))}
</ul>
)}
</div>
</div>
<div className="cards-row cards-row-split">
<div className="widget-card widget-card-grow">
<div className="widget-header">
<div>
<div className="widget-title">Vendas - Últimos 7 dias</div>
<div className="widget-subtitle">Quantidade de vendas realizadas</div>
</div>
</div>
<VendasChart data={data.vendas7Dias} />
</div>
<div className="widget-card widget-card-grow">
<div className="widget-header">
<div className="widget-title">Veículos Parados no Estoque</div>
</div>
<div className="widget-subtitle" style={{ marginBottom: 12 }}>
Top 5 com mais tempo aguardando venda
</div>
{data.veiculosParados.length === 0 ? (
<p className="empty-state">Nenhum veículo parado no estoque</p>
) : (
<ul className="simple-list">
{data.veiculosParados.map((v: any) => (
<li key={v.id} className="simple-list-item">
<span>{v.marca} {v.modelo}</span>
<span className="simple-list-meta">{v.dias} dias</span>
</li>
))}
</ul>
)}
<Link href="/veiculos" className="secondary-button widget-footer-button">
Ver estoque completo →
</Link>
</div>
</div>
<div className="widget-card">
<div className="widget-header">
<div>
<div className="widget-title">Veículos em Destaque</div>
<div className="widget-subtitle">Prontos para venda</div>
</div>
<Link href="/veiculos" className="widget-link">
Ver todos
</Link>
</div>
{data.veiculosDestaque.length === 0 ? (
<p className="empty-state">Nenhum veículo disponível</p>
) : (
<div className="destaque-grid">
{data.veiculosDestaque.map((v: any) => (
<div key={v.id} className="destaque-card">
<div className="destaque-nome">{v.marca} {v.modelo}</div>
<div className="destaque-meta">
{v.ano_modelo ? `${v.ano_modelo} · ` : ""}
{v.km ? `${v.km.toLocaleString("pt-BR")} km` : ""}
</div>
<div className="destaque-preco">{formatMoney(v.preco_venda)}</div>
</div>
))}
</div>
)}
</div>
</div>
);
}
