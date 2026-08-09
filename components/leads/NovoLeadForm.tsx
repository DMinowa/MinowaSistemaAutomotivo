"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
type Veiculo = { id: string; marca: string; modelo: string };
type FormState = {
nome: string;
telefone: string;
origem: string;
canal_preferido: string;
veiculo_interesse_id: string;
modelo_interesse_texto: string;
forma_pagamento: string;
prazo_decisao: string;
aceitou_visita: boolean;
classificacao: string;
observacoes: string;
};
const INITIAL_STATE: FormState = {
nome: "",
telefone: "",
origem: "instagram",
canal_preferido: "texto",
veiculo_interesse_id: "",
modelo_interesse_texto: "",
forma_pagamento: "a_vista",
prazo_decisao: "indefinido",
aceitou_visita: false,
classificacao: "frio",
observacoes: "",
};
export default function NovoLeadForm({ veiculos }: { veiculos: Veiculo[] }) {
const router = useRouter();
const [form, setForm] = useState<FormState>(INITIAL_STATE);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
function update<K extends keyof FormState>(key: K, value: FormState[K]) {
setForm((f) => ({ ...f, [key]: value }));
}
async function handleSubmit(e: FormEvent) {
e.preventDefault();
setLoading(true);
setError(null);
const supabase = createClient();
const { error } = await supabase.from("leads").insert({
nome: form.nome || null,
telefone: form.telefone || null,
origem: form.origem,
canal_preferido: form.canal_preferido,
veiculo_interesse_id: form.veiculo_interesse_id || null,
modelo_interesse_texto: form.modelo_interesse_texto || null,
forma_pagamento: form.forma_pagamento,
prazo_decisao: form.prazo_decisao,
aceitou_visita: form.aceitou_visita,
classificacao: form.classificacao,
observacoes: form.observacoes || null,
});
setLoading(false);
if (error) {
setError(error.message);
return;
}
router.push("/leads");
router.refresh();
}
return (
<form className="form-card" onSubmit={handleSubmit}>
<div className="form-grid">
<div className="form-group">
<label className="form-label" htmlFor="nome">Nome</label>
<input
id="nome"
className="form-input"
value={form.nome}
onChange={(e) => update("nome", e.target.value)}
/>
</div>
<div className="form-group">
<label className="form-label" htmlFor="telefone">Telefone / WhatsApp</label>
<input
id="telefone"
className="form-input"
value={form.telefone}
onChange={(e) => update("telefone", e.target.value)}
placeholder="(85) 99999-9999"
/>
</div>
<div className="form-group">
<label className="form-label" htmlFor="origem">Origem</label>
<select
id="origem"
className="form-select"
value={form.origem}
onChange={(e) => update("origem", e.target.value)}
>
<option value="instagram">Instagram</option>
<option value="facebook">Facebook</option>
<option value="olx">OLX</option>
<option value="whatsapp">WhatsApp</option>
<option value="site">Site</option>
<option value="indicacao">Indicação</option>
<option value="loja">Loja física</option>
<option value="outro">Outro</option>
</select>
</div>
<div className="form-group">
<label className="form-label" htmlFor="canal_preferido">Canal preferido</label>
<select
id="canal_preferido"
className="form-select"
value={form.canal_preferido}
onChange={(e) => update("canal_preferido", e.target.value)}
>
<option value="texto">Texto</option>
<option value="audio">Áudio</option>
</select>
</div>
<div className="form-group">
<label className="form-label" htmlFor="veiculo">Veículo do estoque (se houver)</label>
<select
id="veiculo"
className="form-select"
value={form.veiculo_interesse_id}
onChange={(e) => update("veiculo_interesse_id", e.target.value)}
>
<option value="">— Selecionar —</option>
{veiculos.map((v) => (
<option key={v.id} value={v.id}>
{v.marca} {v.modelo}
</option>
))}
</select>
{veiculos.length === 0 && (
<p className="form-hint">Nenhum veículo cadastrado no estoque ainda.</p>
)}
</div>
<div className="form-group">
<label className="form-label" htmlFor="modelo_texto">Ou descreva o modelo de interesse</label>
<input
id="modelo_texto"
className="form-input"
value={form.modelo_interesse_texto}
onChange={(e) => update("modelo_interesse_texto", e.target.value)}
placeholder="Ex: HB20 2022"
/>
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
<label className="form-label" htmlFor="prazo">Prazo de decisão</label>
<select
id="prazo"
className="form-select"
value={form.prazo_decisao}
onChange={(e) => update("prazo_decisao", e.target.value)}
>
<option value="curto">Curto (essa semana/mês)</option>
<option value="medio">Médio</option>
<option value="indefinido">Indefinido</option>
</select>
</div>
<div className="form-group">
<label className="form-label" htmlFor="classificacao">Classificação</label>
<select
id="classificacao"
className="form-select"
value={form.classificacao}
onChange={(e) => update("classificacao", e.target.value)}
>
<option value="quente">🔴 Quente</option>
<option value="morno">🟡 Morno</option>
<option value="frio">🔵 Frio</option>
</select>
</div>
<div className="form-group checkbox-row">
<input
id="visita"
type="checkbox"
checked={form.aceitou_visita}
onChange={(e) => update("aceitou_visita", e.target.checked)}
/>
<label htmlFor="visita">Aceitou agendar visita / test-drive</label>
</div>
</div>
<div className="form-group">
<label className="form-label" htmlFor="observacoes">Observações</label>
<textarea
id="observacoes"
className="form-textarea"
rows={3}
value={form.observacoes}
onChange={(e) => update("observacoes", e.target.value)}
/>
</div>
{error && <p className="auth-error">{error}</p>}
<div className="form-actions">
<button type="button" className="secondary-button" onClick={() => router.push("/leads")}>
Cancelar
</button>
<button type="submit" className="primary-button" disabled={loading}>
{loading ? "Salvando..." : "Salvar lead"}
</button>
</div>
</form>
);
}
