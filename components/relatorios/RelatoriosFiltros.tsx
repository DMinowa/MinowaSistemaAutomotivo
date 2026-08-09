"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
type Vendedor = { id: string; nome: string };
const PERIODO_OPTIONS = [
{ value: "mes_atual", label: "Mês Atual" },
{ value: "mes_passado", label: "Mês Passado" },
{ value: "este_ano", label: "Este Ano" },
{ value: "todos", label: "Todo o Período" },
];
export default function RelatoriosFiltros({ vendedores }: { vendedores: Vendedor[] }) {
const router = useRouter();
const pathname = usePathname();
const searchParams = useSearchParams();
const [marca, setMarca] = useState(searchParams.get("marca") ?? "");
function updateParam(key: string, value: string) {
const params = new URLSearchParams(searchParams.toString());
if (value) {
params.set(key, value);
} else {
params.delete(key);
}
router.push(`${pathname}?${params.toString()}`);
}
function handleMarcaKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
if (e.key === "Enter") {
updateParam("marca", marca);
}
}
return (
<div className="widget-card">
<div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
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
<label className="form-label">Marca</label>
<input
className="form-input"
placeholder="Todas"
value={marca}
onChange={(e) => setMarca(e.target.value)}
onKeyDown={handleMarcaKeyDown}
onBlur={() => updateParam("marca", marca)}
/>
</div>
</div>
</div>
);
}
