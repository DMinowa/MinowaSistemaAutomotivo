"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
type FormState = {
nome: string;
cpf_cnpj: string;
telefone: string;
email: string;
data_nascimento: string;
cidade: string;
estado: string;
endereco_completo: string;
cep: string;
origem: string;
observacoes: string;
};
const INITIAL_STATE: FormState = {
nome: "",
cpf_cnpj: "",
telefone: "",
email: "",
data_nascimento: "",
cidade: "",
estado: "",
endereco_completo: "",
cep: "",
origem: "loja",
observacoes: "",
};
export default function NovoClienteForm() {
const router = useRouter();
const [form, setForm] = useState<FormState>(INITIAL_STATE);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
function update<K extends keyof FormState>(key: K, value: FormState[K]) {
setForm((f) => ({ ...f, [key]: value }));
}
async function handleSubmit(e: FormEvent) {
e.preventDefault();
if (!form.nome || !form.telefone) {
setError("Preencha ao menos Nome e Telefone.");
return;
}
setLoading(true);
setError(null);
const supabase = createClient();
const { error } = await supabase.from("clientes").insert({
nome: form.nome,
cpf_cnpj: form.cpf_cnpj || null,
telefone: form.telefone,
email: form.email || null,
data_nascimento: form.data_nascimento || null,
cidade: form.cidade || null,
estado: form.estado || null,
endereco_completo: form.endereco_completo || null,
cep: form.cep || null,
origem: form.origem,
observacoes: form.observacoes || null,
});
setLoading(false);
if (error) {
setError(error.message);
return;
}
router.push("/clientes");
router.refresh();
}
return (
<form className="form-card" onSubmit={handleSubmit}>
<div className="form-grid">
<div className="form-group">
<label className="form-label" htmlFor="nome">Nome *</label>
<input
id="nome"
className="form-input"
value={form.nome}
onChange={(e) => update("nome", e.target.value)}
/>
</div>
<div className="form-group">
<label className="form-label" htmlFor="telefone">Telefone *</label>
<input
id="telefone"
className="form-input"
value={form.telefone}
onChange={(e) => update("telefone", e.target.value)}
placeholder="(85) 99999-9999"
/>
</div>
<div className="form-group">
<label className="form-label" htmlFor="cpf_cnpj">CPF/CNPJ</label>
<input
id="cpf_cnpj"
className="form-input"
value={form.cpf_cnpj}
onChange={(e) => update("cpf_cnpj", e.target.value)}
/>
</div>
<div className="form-group">
<label className="form-label" htmlFor="email">E-mail</label>
<input
id="email"
className="form-input"
type="email"
value={form.email}
onChange={(e) => update("email", e.target.value)}
/>
</div>
<div className="form-group">
<label className="form-label" htmlFor="data_nascimento">Data de nascimento</label>
<input
id="data_nascimento"
className="form-input"
type="date"
value={form.data_nascimento}
onChange={(e) => update("data_nascimento", e.target.value)}
/>
</div>
<div className="form-group">
<label className="form-label" htmlFor="cidade">Cidade</label>
<input
id="cidade"
className="form-input"
value={form.cidade}
onChange={(e) => update("cidade", e.target.value)}
/>
</div>
<div className="form-group">
<label className="form-label" htmlFor="estado">Estado (UF)</label>
<input
id="estado"
className="form-input"
maxLength={2}
value={form.estado}
onChange={(e) => update("estado", e.target.value.toUpperCase())}
placeholder="CE"
/>
</div>
<div className="form-group">
<label className="form-label" htmlFor="cep">CEP</label>
<input
id="cep"
className="form-input"
value={form.cep}
onChange={(e) => update("cep", e.target.value)}
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
</div>
<div className="form-group">
<label className="form-label" htmlFor="endereco">Endereço completo</label>
<input
id="endereco"
className="form-input"
value={form.endereco_completo}
onChange={(e) => update("endereco_completo", e.target.value)}
placeholder="Rua, número, bairro"
/>
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
<button type="button" className="secondary-button" onClick={() => router.push("/clientes")}>
Cancelar
</button>
<button type="submit" className="primary-button" disabled={loading}>
{loading ? "Salvando..." : "Salvar cliente"}
</button>
</div>
</form>
);
}
