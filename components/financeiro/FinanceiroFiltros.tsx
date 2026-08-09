"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
type Vendedor = { id: string; nome: string };
const PERIODO_OPTIONS = [
{ value: "mes_atual", label: "Mês Atual" },
{ value: "mes_passado", label: "Mês Passado" },
{ value: "este_ano", label: "Este Ano" },
{ value: "todos", label: "Todo o Período" },
];
const STATUS_OPTIONS = [
{ value: "", label: "Todas" },
{ value: "em_andamento", label: "Em andamento" },
{ value: "concluida", label: "Concluídas" },
{ value: "cancelada", label: "Canceladas" },
];
export default function FinanceiroFiltros({ vendedores }: { vendedores: Vendedor[] }) {
const router = useRouter();
const pathname = usePathname();
const searchParams = useSearchParams();
function updateParam(key: string, value: string) {
const params = new URLSearchParams(searchParams.toString());
if (value) {
params.set(key, value);
} else {
params.delete(key);
}
router.push(`${pathname}?${params.toString()}`);
}
return (
<div className="widget-card">
<div className="widget-title" style={{ marginBottom: 16 }}>
▽ Filtros
</div>
<div className="form-grid">
<div className="form-group">
<label className="form-label">Período</label>
<select
className="form-select"
value={searchParams.get("periodo") ?? "mes_atual"}
onChange={(e) => updateParam("periodo", e.target.value)}
>
{PERIODO_OPTIONS.map((o) => (
<option key={o.value} value={o.value}>
{o.label}
</option>
))}
</select>
</div>
<div className="form-group">
<label className="form-label">Vendedor</label>
<select
className="form-select"
value={searchParams.get("vendedor") ?? ""}
onChange={(e) => updateParam("vendedor", e.target.value)}
>
<option value="">Todos</option>
{vendedores.map((v) => (
<option key={v.id} value={v.id}>
{v.nome}
</option>
))}
</select>
</div>
<div className="form-group">
<label className="form-label">Status</label>
<select
className="form-select"
value={searchParams.get("status") ?? ""}
onChange={(e) => updateParam("status", e.target.value)}
>
{STATUS_OPTIONS.map((o) => (
<option key={o.value} value={o.value}>
{o.label}
</option>
))}
</select>
</div>
</div>
</div>
);
}
