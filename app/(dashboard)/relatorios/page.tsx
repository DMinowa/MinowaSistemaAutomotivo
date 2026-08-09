import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RelatoriosFiltros from "@/components/relatorios/RelatoriosFiltros";
import ReceitaLucroChart from "@/components/relatorios/ReceitaLucroChart";
export const dynamic = "force-dynamic";
const TABS = [
{ id: "relatorios", label: "Relatórios" },
{ id: "executivo", label: "Executivo" },
{ id: "demonstrativo", label: "Demonstrativo" },
{ id: "indicadores", label: "Indicadores" },
{ id: "despesas", label: "Despesas" },
{ id: "categorias", label: "Categorias" },
{ id: "configuracoes", label: "Configurações" },
];
function formatMoney(value: number) {
return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function diasEntre(dataISO: string) {
const inicio = new Date(dataISO + "T00:00:00");
const hoje = new Date();
const diffMs = hoje.getTime() - inicio.getTime();
return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
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
const inicio = new Date(ano, mes, 1);
const fim = new Date(ano, mes + 1, 0);
return { inicio: inicio.toISOString().slice(0, 10), fim: fim.toISOString().slice(0, 10) };
}
function buildSerie(vendas: any[], range: { inicio: string; fim: string } | null) {
const agruparPorMes = !range || (new Date(range.fim).getTime() - new Date(range.inicio).getTime()) > 1000 * 60 * 60 * 24 * 60;
const mapa = new Map<string, { receita: number; lucro: number }>();
vendas.forEach((v: any) => {
if (!v.data_venda) return;
const chave = agruparPorMes ? v.data_venda.slice(0, 7) : v.data_venda;
const atual = mapa.get(chave) ?? { receita: 0, lucro: 0 };
const custo = v.veiculo?.preco_compra ?? 0;
atual.receita += v.valor_venda ?? 0;
atual.lucro += (v.valor_venda ?? 0) - custo;
mapa.set(chave, atual);
});
const chaves = Array.from(mapa.keys()).sort();
return chaves.map((chave) => {
let label = chave;
if (agruparPorMes) {
const [ano, mes] = chave.split("-");
label = `${mes}/${ano.slice(2)}`;
} else {
const [, mes, dia] = chave.split("-");
label = `${dia}/${mes}`;
}
const ponto = mapa.get(chave)!;
return { label, receita: ponto.receita, lucro: ponto.lucro };
});
}
export default async function RelatoriosPage({
searchParams,
}: {
searchParams: { aba?: string; periodo?: string; vendedor?: string; marca?: string };
}) {
const supabase = await createClient();
const abaAtiva = searchParams?.aba ?? "relatorios";
const periodo = searchParams?.periodo ?? "mes_atual";
const vendedorId = searchParams?.vendedor ?? "";
const marcaFiltro = (searchParams?.marca ?? "").trim().toLowerCase();
const { data: vendedores } = await supabase.from("usuarios").select("id, nome").order("nome");
const range = getRangeForPeriodo(periodo);
let vendasQuery = supabase
.from("vendas")
.select("valor_venda, data_venda, veiculo:veiculos(marca, modelo, preco_compra), vendedor:usuarios(nome)")
.eq("status", "concluida");
if (range) {
vendasQuery = vendasQuery.gte("data_venda", range.inicio).lte("data_venda", range.fim);
}
if (vendedorId) {
vendasQuery = vendasQuery.eq("vendedor_id", vendedorId);
}
const { data: vendasRaw } = await vendasQuery;
const vendas = (vendasRaw ?? []).filter((v: any) => {
if (!marcaFiltro) return true;
return (v.veiculo?.marca ?? "").toLowerCase().includes(marcaFiltro);
});
let despesasQuery = supabase.from("despesas").select("categoria, valor, data_despesa");
if (range) {
despesasQuery = despesasQuery.gte("data_despesa", range.inicio).lte("data_despesa", range.fim);
}
const { data: despesas } = await despesasQuery;
const faturamento = vendas.reduce((soma: number, v: any) => soma + (v.valor_venda ?? 0), 0);
const lucroBruto = vendas.reduce((soma: number, v: any) => {
const custo = v.veiculo?.preco_compra ?? 0;
return soma + ((v.valor_venda ?? 0) - custo);
}, 0);
const veiculosVendidos = vendas.length;
const ticketMedio = veiculosVendidos > 0 ? faturamento / veiculosVendidos : 0;
const despesasTotais = (despesas ?? []).reduce((soma: number, d: any) => soma + (d.valor ?? 0), 0);
const lucroLiquido = lucroBruto - despesasTotais;
const margemBruta = faturamento > 0 ? (lucroBruto / faturamento) * 100 : 0;
const margemLiquida = faturamento > 0 ? (lucroLiquido / faturamento) * 100 : 0;
const despesasPorCategoria = new Map<string, number>();
(despesas ?? []).forEach((d: any) => {
despesasPorCategoria.set(d.categoria, (despesasPorCategoria.get(d.categoria) ?? 0) + (d.valor ?? 0));
});
const despesasCategoriaLista = Array.from(despesasPorCategoria.entries())
.map(([categoria, valor]) => ({ categoria, valor }))
.sort((a, b) => b.valor - a.valor);
const { data: veiculosDisponiveis } = await supabase
.from("veiculos")
.select("data_entrada, preco_venda")
.eq("status", "disponivel");
const estoqueParadoCount = veiculosDisponiveis?.length ?? 0;
const valorEstoqueParado = (veiculosDisponiveis ?? []).reduce(
(soma: number, v: any) => soma + (v.preco_venda ?? 0),
0
);
const diasMedios =
estoqueParadoCount > 0
? Math.round(
(veiculosDisponiveis ?? []).reduce((soma: number, v: any) => {
return soma + (v.data_entrada ? diasEntre(v.data_entrada) : 0);
}, 0) / estoqueParadoCount
)
: 0;
const serieChart = buildSerie(vendas, range);
const lucroPorMarca = new Map<string, number>();
vendas.forEach((v: any) => {
if (!v.veiculo?.marca) return;
const custo = v.veiculo?.preco_compra ?? 0;
const lucro = (v.valor_venda ?? 0) - custo;
lucroPorMarca.set(v.veiculo.marca, (lucroPorMarca.get(v.veiculo.marca) ?? 0) + lucro);
});
const lucroPorMarcaLista = Array.from(lucroPorMarca.entries())
.map(([marca, lucro]) => ({ marca, lucro }))
.sort((a, b) => b.lucro - a.lucro)
.slice(0, 6);
const rankingVendedores = new Map<string, { total: number; qtd: number }>();
vendas.forEach((v: any) => {
const nome = v.vendedor?.nome ?? "Sem vendedor";
const atual = rankingVendedores.get(nome) ?? { total: 0, qtd: 0 };
atual.total += v.valor_venda ?? 0;
atual.qtd += 1;
rankingVendedores.set(nome, atual);
});
const rankingVendedoresLista = Array.from(rankingVendedores.entries())
.map(([nome, dados]) => ({ nome, ...dados }))
.sort((a, b) => b.total - a.total)
.slice(0, 6);
function tabHref(tabId: string) {
const params = new URLSearchParams();
params.set("aba", tabId);
if (periodo !== "mes_atual") params.set("periodo", periodo);
if (vendedorId) params.set("vendedor", vendedorId);
if (marcaFiltro) params.set("marca", marcaFiltro);
return `/relatorios?${params.toString()}`;
}
return (
<div>
<h1 className="page-title">Relatórios</h1>
<p className="page-subtitle">Demonstrativo de Resultado do Exercício em tempo real</p>
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
{abaAtiva !== "relatorios" ? (
<div className="widget-card">
<p className="empty-state">
Esta aba ({TABS.find((t) => t.id === abaAtiva)?.label}) ainda está em construção.
</p>
</div>
) : (
<>
<div style={{ marginBottom: 16 }}>
<RelatoriosFiltros vendedores={vendedores ?? []} />
</div>
{[
[
{ label: "FATURAMENTO", value: formatMoney(faturamento) },
{ label: "LUCRO BRUTO", value: formatMoney(lucroBruto) },
{ label: "LUCRO LÍQUIDO", value: formatMoney(lucroLiquido) },
{ label: "MARGEM LÍQUIDA", value: `${margemLiquida.toFixed(1)}%`, hint: `Margem bruta ${margemBruta.toFixed(1)}%` },
],
[
{ label: "VEÍCULOS VENDIDOS", value: String(veiculosVendidos) },
{ label: "TICKET MÉDIO", value: formatMoney(ticketMedio) },
{ label: "DESPESAS TOTAIS", value: formatMoney(despesasTotais) },
{ label: "ESTOQUE PARADO", value: formatMoney(valorEstoqueParado), hint: `${estoqueParadoCount} veículo${estoqueParadoCount !== 1 ? "s" : ""} · ${diasMedios} dias em média` },
],
].map((linha, i) => (
<div className="cards-row" key={i}>
{linha.map((c) => (
<div className="card" key={c.label}>
<div className="card-label">{c.label}</div>
<div className="card-value">{c.value}</div>
{c.hint && <div className="card-hint">{c.hint}</div>}
</div>
))}
</div>
))}
<div className="cards-row cards-row-split">
<div className="widget-card widget-card-grow">
<div className="widget-title" style={{ marginBottom: 12 }}>
Evolução de receita e lucro
</div>
<ReceitaLucroChart data={serieChart} />
</div>
<div className="widget-card widget-card-grow">
<div className="widget-title" style={{ marginBottom: 12 }}>
Despesas por categoria
</div>
{despesasCategoriaLista.length === 0 ? (
<p className="empty-state">Nenhuma despesa lançada no período.</p>
) : (
<ul className="simple-list">
{despesasCategoriaLista.map((d) => (
<li key={d.categoria} className="simple-list-item">
<span className="capitalize">{d.categoria}</span>
<span className="simple-list-meta">{formatMoney(d.valor)}</span>
</li>
))}
</ul>
)}
</div>
</div>
<div className="cards-row cards-row-split">
<div className="widget-card widget-card-grow">
<div className="widget-title" style={{ marginBottom: 12 }}>
Lucro por marca
</div>
{lucroPorMarcaLista.length === 0 ? (
<p className="empty-state">Nenhuma venda concluída no período.</p>
) : (
<ul className="simple-list">
{lucroPorMarcaLista.map((m) => (
<li key={m.marca} className="simple-list-item">
<span>{m.marca}</span>
<span className="simple-list-meta">{formatMoney(m.lucro)}</span>
</li>
))}
</ul>
)}
</div>
<div className="widget-card widget-card-grow">
<div className="widget-title" style={{ marginBottom: 12 }}>
Ranking de vendedores
</div>
{rankingVendedoresLista.length === 0 ? (
<p className="empty-state">Nenhuma venda concluída no período.</p>
) : (
<ul className="simple-list">
{rankingVendedoresLista.map((r) => (
<li key={r.nome} className="simple-list-item">
<span>{r.nome}</span>
<span className="simple-list-meta">
{r.qtd} venda{r.qtd !== 1 ? "s" : ""} · {formatMoney(r.total)}
</span>
</li>
))}
</ul>
)}
</div>
</div>
</>
)}
</div>
);
}
