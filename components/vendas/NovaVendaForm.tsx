"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
type Cliente = { id: string; nome: string };
type Veiculo = { id: string; marca: string; modelo: string; preco_venda: number | null };
type Vendedor = { id: string; nome: string };
type FormState = {
cliente_id: string;
veiculo_id: string;
vendedor_id: string;
forma_pagamento: string;
valor_venda: string;
valor_entrada: string;
valor_financiado: string;
comissao_percentual: string;
status: string;
data_venda: string;
};
function todayISO() {
return new Date().toISOString().slice(0, 10);
}
const INITIAL_STATE: FormState = {
cliente_id: "",
veiculo_id: "",
vendedor_id: "",
forma_pagamento: "a_vista",
valor_venda: "",
valor_entrada: "",
valor_financiado: "",
comissao_percentual: "",
status: "em_andamento",
data_venda: todayISO(),
};
function toNumberOrNull(value: string) {
if (!value.trim()) return null;
const n = parseFloat(value.replace(",", "."));
return Number.isNaN(n) ? null : n;
}
export default function NovaVendaForm({
clientes,
veiculos,
vendedores,
}: {
clientes: Cliente[];
veiculos: Veiculo[];
vendedores: Vendedor[];
}) {
const router = useRouter();
const [form, setForm] = useState<FormState>(INITIAL_STATE);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
function update<K extends keyof FormState>(key: K, value: FormState[K]) {
setForm((f) => ({ ...f, [key]: value }));
}
function handleVeiculoChange(id: string) {
update("veiculo_id", id);
const v = veiculos.find((v) => v.id === id);
if (v?.preco_venda && !form.valor_venda) {
update("valor_venda", String(v.preco_venda));
}
}
async function handleSubmit(e: FormEvent) {
e.preventDefault();
if (!form.cliente_id || !form.veiculo_id || !form.valor_venda) {
setError("Preencha ao menos Cliente, Veículo e Valor da venda.");
return;
}
setLoading(true);
setError(null);
const supabase = createClient();
const valorVenda = toNumberOrNull(form.valor_venda) ?? 0;
const comissaoPercentual = toNumberOrNull(form.comissao_percentual) ?? 0;
const comissaoValor = (valorVenda * comissaoPercentual) / 100;
const { error } = await supabase.from("vendas").insert({
cliente_id: form.cliente_id,
veiculo_id: form.veiculo_id,
vendedor_id: form.vendedor_id || null,
forma_pagamento: form.forma_pagamento,
valor_venda: valorVenda,
valor_entrada: toNumberOrNull(form.valor_entrada) ?? 0,
valor_financiado: toNumberOrNull(form.valor_financiado) ?? 0,
comissao_percentual: comissaoPercentual,
comissao_valor: comissaoValor,
status: form.status,
data_venda: form.data_venda,
});
if (error) {
setLoading(false);
setError(error.message);
return;
}
const novoStatusVeiculo = form.status === "concluida" ? "vendido" : "reservado";
await supabase
.from("veiculos")
.update({ status: novoStatusVeiculo })
.eq("id", form.veiculo_id);
setLoading(false);
router.push("/vendas");
router.refresh();
}
return (
<form className="form-card" onSubmit={handleSubmit}>
<div className="form-grid">
<div className="form-group">
<label className="form-label" htmlFor="cliente">Cliente *</label>
<select
id="cliente"
className="form-select"
value={form.cliente_id}
onChange={(e) => update("cliente_id", e.target.value)}
>
<option value="">— Selecionar —</option>
{clientes.map((c) => (
<option key={c.id} value={c.id}>
{c.nome}
</option>
))}
</select>
{clientes.length === 0 && (
<p className="form-hint">Nenhum cliente cadastrado ainda.</p>
)}
</div>
<div className="form-group">
<label className="form-label" htmlFor="veiculo">Veículo *</label>
<select
id="veiculo"
className="form-select"
value={form.veiculo_id}
onChange={(e) => handleVeiculoChange(e.target.value)}
>
<option value="">— Selecionar —</option>
{veiculos.map((v) => (
<option key={v.id} value={v.id}>
{v.marca} {v.modelo}
</option>
))}
</select>
{veiculos.length === 0 && (
<p className="form-hint">Nenhum veículo disponível no estoque.</p>
)}
</div>
<div className="form-group">
<label className="form-label" htmlFor="vendedor">Vendedor responsável</label>
<select
id="vendedor"
className="form-select"
value={form.vendedor_id}
onChange={(e) => update("vendedor_id", e.target.value)}
>
<option value="">— Selecionar —</option>
{vendedores.map((v) => (
<option key={v.id} value={v.id}>
{v.nome}
</option>
))}
</select>
</div>
<div className="form-group">
<label className="form-label" htmlFor="pagamento">Forma de pagamento</label>
<select
id="pagamento"
className="form-select"
value={form.forma_pagamento}
onChange={(e) => update("forma_pagamento", e.target.value)}
>
<option value="a_vista">À vista</option>
<option value="financiamento">Financiamento</option>
<option value="troca">Troca</option>
</select>
</div>
<div className="form-group">
<label className="form-label" htmlFor="valor_venda">Valor da venda *</label>
<input
id="valor_venda"
className="form-input"
inputMode="decimal"
value={form.valor_venda}
onChange={(e) => update("valor_venda", e.target.value)}
placeholder="0,00"
/>
</div>
<div className="form-group">
<label className="form-label" htmlFor="valor_entrada">Valor de entrada</label>
<input
id="valor_entrada"
className="form-input"
inputMode="decimal"
value={form.valor_entrada}
onChange={(e) => update("valor_entrada", e.target.value)}
placeholder="0,00"
/>
</div>
{form.forma_pagamento === "financiamento" && (
<div className="form-group">
<label className="form-label" htmlFor="valor_financiado">Valor financiado</label>
<input
id="valor_financiado"
className="form-input"
inputMode="decimal"
value={form.valor_financiado}
onChange={(e) => update("valor_financiado", e.target.value)}
placeholder="0,00"
/>
</div>
)}
<div className="form-group">
<label className="form-label" htmlFor="comissao">Comissão (%)</label>
<input
id="comissao"
className="form-input"
inputMode="decimal"
value={form.comissao_percentual}
onChange={(e) => update("comissao_percentual", e.target.value)}
placeholder="0"
/>
</div>
<div className="form-group">
<label className="form-label" htmlFor="status">Status</label>
<select
id="status"
className="form-select"
value={form.status}
onChange={(e) => update("status", e.target.value)}
>
<option value="em_andamento">Em andamento</option>
<option value="concluida">Concluída</option>
<option value="cancelada">Cancelada</option>
</select>
</div>
<div className="form-group">
<label className="form-label" htmlFor="data_venda">Data da venda</label>
<input
id="data_venda"
className="form-input"
type="date"
value={form.data_venda}
onChange={(e) => update("data_venda", e.target.value)}
/>
</div>
</div>
<p className="form-hint">
Ao marcar como <strong>Concluída</strong>, o veículo é automaticamente movido para "Vendido"
no estoque. Em <strong>Em andamento</strong>, ele fica como "Reservado".
</p>
{error && <p className="auth-error">{error}</p>}
<div className="form-actions">
<button type="button" className="secondary-button" onClick={() => router.push("/vendas")}>
Cancelar
</button>
<button type="submit" className="primary-button" disabled={loading}>
{loading ? "Salvando..." : "Registrar venda"}
</button>
</div>
</form>
);
}
