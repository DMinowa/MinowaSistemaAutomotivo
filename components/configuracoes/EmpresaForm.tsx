"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
type Empresa = { id: string; [k: string]: any };
const CAMPOS_BASICOS = [
{ key: "nome_fantasia", label: "Nome Fantasia" },
{ key: "razao_social", label: "Razão Social" },
{ key: "cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00" },
{ key: "email", label: "E-mail", type: "email" },
{ key: "telefone", label: "Telefone", placeholder: "(00) 0000-0000" },
{ key: "whatsapp", label: "WhatsApp", placeholder: "(00) 00000-0000" },
];
const CAMPOS_ENDERECO = [
{ key: "cidade", label: "Cidade" },
{ key: "estado", label: "Estado", placeholder: "UF", maxLength: 2, upper: true },
{ key: "cep", label: "CEP", placeholder: "00000-000" },
];
export default function EmpresaForm({ empresa }: { empresa: Empresa }) {
const router = useRouter();
const campos = [...CAMPOS_BASICOS, ...CAMPOS_ENDERECO, { key: "endereco_completo" }];
const inicial: Record<string, string> = {};
campos.forEach((c) => { inicial[c.key] = empresa[c.key] ?? ""; });
const [form, setForm] = useState(inicial);
const [salvando, setSalvando] = useState(false);
const [mensagem, setMensagem] = useState<string | null>(null);
function update(key: string, value: string) {
setForm((f) => ({ ...f, [key]: value }));
}
async function handleSalvar() {
setSalvando(true);
setMensagem(null);
const supabase = createClient();
const { error } = await supabase
.from("empresa")
.update({ ...form, atualizado_em: new Date().toISOString() })
.eq("id", empresa.id);
setSalvando(false);
if (error) {
setMensagem("Erro ao salvar: " + error.message);
return;
}
setMensagem("Dados salvos com sucesso!");
router.refresh();
}
return (
<div>
<div className="widget-card">
<div className="widget-title" style={{ marginBottom: 16 }}>Informações Básicas</div>
<div className="form-grid">
{CAMPOS_BASICOS.map((c) => (
<div className="form-group" key={c.key}>
<label className="form-label">{c.label}</label>
<input
className="form-input"
type={c.type || "text"}
value={form[c.key]}
onChange={(e) => update(c.key, e.target.value)}
placeholder={c.placeholder}
/>
</div>
))}
</div>
</div>
<div className="widget-card">
<div className="widget-title" style={{ marginBottom: 16 }}>Endereço</div>
<div className="form-group">
<label className="form-label">Endereço Completo</label>
<input
className="form-input"
value={form.endereco_completo}
onChange={(e) => update("endereco_completo", e.target.value)}
placeholder="Rua, número, complemento"
/>
</div>
<div className="form-grid">
{CAMPOS_ENDERECO.map((c) => (
<div className="form-group" key={c.key}>
<label className="form-label">{c.label}</label>
<input
className="form-input"
maxLength={c.maxLength}
value={form[c.key]}
onChange={(e) => update(c.key, c.upper ? e.target.value.toUpperCase() : e.target.value)}
placeholder={c.placeholder}
/>
</div>
))}
</div>
</div>
{mensagem && (
<p className={mensagem.startsWith("Erro") ? "auth-error" : "form-hint"}>{mensagem}</p>
)}
<div className="form-actions">
<button className="primary-button" onClick={handleSalvar} disabled={salvando}>
{salvando ? "Salvando..." : "💾 Salvar Alterações"}
</button>
</div>
</div>
);
}
