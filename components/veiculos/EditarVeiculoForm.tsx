"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATALOGO_VEICULOS } from "@/lib/veiculoCatalogo";
import CrlvUpload, { type DadosCrlv } from "./CrlvUpload";
import FotosUpload, { enviarFotos, type FotoPendente } from "./FotosUpload";
import FotosExistentes, { type FotoExistente } from "./FotosExistentes";
type Veiculo = {
id: string;
marca: string;
modelo: string;
versao: string | null;
ano_fabricacao: number | null;
ano_modelo: number | null;
placa: string | null;
chassi: string | null;
renavam: string | null;
km: number | null;
cor: string | null;
combustivel: string;
cambio: string;
preco_compra: number | null;
preco_venda: number | null;
status: string;
laudo_cautelar_aprovado: boolean;
garantia_dias: number | null;
descricao: string | null;
};
type FormState = {
marca: string;
modelo: string;
versao: string;
ano_fabricacao: string;
ano_modelo: string;
placa: string;
chassi: string;
renavam: string;
km: string;
cor: string;
combustivel: string;
cambio: string;
preco_compra: string;
preco_venda: string;
status: string;
laudo_cautelar_aprovado: boolean;
garantia_dias: string;
descricao: string;
};
const OUTRA = "__outra__";
function toIntOrNull(value: string) {
if (!value.trim()) return null;
const n = parseInt(value, 10);
return Number.isNaN(n) ? null : n;
}
function toNumberOrNull(value: string) {
if (!value.trim()) return null;
const n = parseFloat(value.replace(",", "."));
return Number.isNaN(n) ? null : n;
}
function veiculoParaForm(v: Veiculo): FormState {
return {
marca: v.marca ?? "",
modelo: v.modelo ?? "",
versao: v.versao ?? "",
ano_fabricacao: v.ano_fabricacao ? String(v.ano_fabricacao) : "",
ano_modelo: v.ano_modelo ? String(v.ano_modelo) : "",
placa: v.placa ?? "",
chassi: v.chassi ?? "",
renavam: v.renavam ?? "",
km: v.km ? String(v.km) : "",
cor: v.cor ?? "",
combustivel: v.combustivel ?? "flex",
cambio: v.cambio ?? "manual",
preco_compra: v.preco_compra ? String(v.preco_compra) : "",
preco_venda: v.preco_venda ? String(v.preco_venda) : "",
status: v.status ?? "em_preparacao",
laudo_cautelar_aprovado: !!v.laudo_cautelar_aprovado,
garantia_dias: v.garantia_dias ? String(v.garantia_dias) : "0",
descricao: v.descricao ?? "",
};
}
export default function EditarVeiculoForm({
veiculo,
fotosIniciais,
}: {
veiculo: Veiculo;
fotosIniciais: FotoExistente[];
}) {
const router = useRouter();
const [form, setForm] = useState<FormState>(veiculoParaForm(veiculo));
const [marcaLivre, setMarcaLivre] = useState(true);
const [modeloLivre, setModeloLivre] = useState(true);
const [versaoLivre, setVersaoLivre] = useState(true);
const [fotosExistentes, setFotosExistentes] = useState<FotoExistente[]>(fotosIniciais);
const [fotosNovas, setFotosNovas] = useState<FotoPendente[]>([]);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
const [salvo, setSalvo] = useState(false);
function update<K extends keyof FormState>(key: K, value: FormState[K]) {
setForm((f) => ({ ...f, [key]: value }));
}
const marcaAtual = CATALOGO_VEICULOS.find((m) => m.nome === form.marca);
const modeloAtual = marcaAtual?.modelos.find((m) => m.nome === form.modelo);
function handleMarcaChange(value: string) {
if (value === OUTRA) {
setMarcaLivre(true);
update("marca", "");
} else {
setMarcaLivre(false);
update("marca", value);
}
setModeloLivre(false);
setVersaoLivre(false);
update("modelo", "");
update("versao", "");
}
function handleModeloChange(value: string) {
if (value === OUTRA) {
setModeloLivre(true);
update("modelo", "");
} else {
setModeloLivre(false);
update("modelo", value);
}
setVersaoLivre(false);
update("versao", "");
}
function handleVersaoChange(value: string) {
if (value === OUTRA) {
setVersaoLivre(true);
update("versao", "");
} else {
setVersaoLivre(false);
update("versao", value);
}
}
function handleCrlvReconhecido(dados: DadosCrlv) {
setMarcaLivre(true);
setModeloLivre(true);
setVersaoLivre(true);
setForm((f) => ({
...f,
marca: dados.marca || f.marca,
modelo: dados.modelo || f.modelo,
versao: dados.versao || f.versao,
ano_fabricacao: dados.ano_fabricacao || f.ano_fabricacao,
ano_modelo: dados.ano_modelo || f.ano_modelo,
placa: dados.placa || f.placa,
chassi: dados.chassi || f.chassi,
renavam: dados.renavam || f.renavam,
cor: dados.cor || f.cor,
combustivel: dados.combustivel || f.combustivel,
}));
}
async function handleSubmit(e: React.FormEvent) {
e.preventDefault();
if (!form.marca || !form.modelo || !form.preco_venda) {
setError("Preencha ao menos Marca, Modelo e Preço de venda.");
return;
}
setLoading(true);
setError(null);
setSalvo(false);
const supabase = createClient();
const { error } = await supabase
.from("veiculos")
.update({
marca: form.marca,
modelo: form.modelo,
versao: form.versao || null,
ano_fabricacao: toIntOrNull(form.ano_fabricacao),
ano_modelo: toIntOrNull(form.ano_modelo),
placa: form.placa || null,
chassi: form.chassi || null,
renavam: form.renavam || null,
km: toIntOrNull(form.km),
cor: form.cor || null,
combustivel: form.combustivel,
cambio: form.cambio,
preco_compra: toNumberOrNull(form.preco_compra),
preco_venda: toNumberOrNull(form.preco_venda),
status: form.status,
laudo_cautelar_aprovado: form.laudo_cautelar_aprovado,
garantia_dias: toIntOrNull(form.garantia_dias) ?? 0,
descricao: form.descricao || null,
})
.eq("id", veiculo.id);
if (error) {
setLoading(false);
setError(error.message);
return;
}
await enviarFotos(veiculo.id, fotosNovas);
setFotosNovas([]);
setLoading(false);
setSalvo(true);
router.refresh();
}
return (
<div>
<div style={{ marginBottom: 16 }}>
<CrlvUpload onReconhecido={handleCrlvReconhecido} />
</div>
<form className="form-card" onSubmit={handleSubmit}>
<div className="form-grid">
<div className="form-group">
<label className="form-label">Marca *</label>
{marcaLivre ? (
<input
className="form-input"
value={form.marca}
onChange={(e) => update("marca", e.target.value)}
placeholder="Digite a marca"
/>
) : (
<select className="form-select" value={form.marca} onChange={(e) => handleMarcaChange(e.target.value)}>
<option value="">— Selecionar —</option>
{CATALOGO_VEICULOS.map((m) => (
<option key={m.nome} value={m.nome}>
{m.nome}
</option>
))}
<option value={OUTRA}>Outra marca...</option>
</select>
)}
</div>
<div className="form-group">
<label className="form-label">Modelo *</label>
{modeloLivre || !marcaAtual ? (
<input
className="form-input"
value={form.modelo}
onChange={(e) => update("modelo", e.target.value)}
placeholder="Digite o modelo"
/>
) : (
<select className="form-select" value={form.modelo} onChange={(e) => handleModeloChange(e.target.value)}>
<option value="">— Selecionar —</option>
{marcaAtual.modelos.map((m) => (
<option key={m.nome} value={m.nome}>
{m.nome}
</option>
))}
<option value={OUTRA}>Outro modelo...</option>
</select>
)}
</div>
<div className="form-group">
<label className="form-label">Versão</label>
{versaoLivre || !modeloAtual ? (
<input
className="form-input"
value={form.versao}
onChange={(e) => update("versao", e.target.value)}
placeholder="Ex: Comfort 1.0"
/>
) : (
<select className="form-select" value={form.versao} onChange={(e) => handleVersaoChange(e.target.value)}>
<option value="">— Selecionar —</option>
{modeloAtual.versoes.map((v) => (
<option key={v} value={v}>
{v}
</option>
))}
<option value={OUTRA}>Outra versão...</option>
</select>
)}
</div>
<div className="form-group">
<label className="form-label">Cor</label>
<input className="form-input" value={form.cor} onChange={(e) => update("cor", e.target.value)} />
</div>
<div className="form-group">
<label className="form-label">Ano de fabricação</label>
<input
className="form-input"
inputMode="numeric"
value={form.ano_fabricacao}
onChange={(e) => update("ano_fabricacao", e.target.value)}
/>
</div>
<div className="form-group">
<label className="form-label">Ano do modelo</label>
<input
className="form-input"
inputMode="numeric"
value={form.ano_modelo}
onChange={(e) => update("ano_modelo", e.target.value)}
/>
</div>
<div className="form-group">
<label className="form-label">Placa</label>
<input
className="form-input"
value={form.placa}
onChange={(e) => update("placa", e.target.value.toUpperCase())}
/>
</div>
<div className="form-group">
<label className="form-label">Quilometragem</label>
<input className="form-input" inputMode="numeric" value={form.km} onChange={(e) => update("km", e.target.value)} />
</div>
<div className="form-group">
<label className="form-label">Chassi</label>
<input
className="form-input"
value={form.chassi}
onChange={(e) => update("chassi", e.target.value.toUpperCase())}
/>
</div>
<div className="form-group">
<label className="form-label">Renavam</label>
<input className="form-input" value={form.renavam} onChange={(e) => update("renavam", e.target.value)} />
</div>
<div className="form-group">
<label className="form-label">Combustível</label>
<select className="form-select" value={form.combustivel} onChange={(e) => update("combustivel", e.target.value)}>
<option value="flex">Flex</option>
<option value="gasolina">Gasolina</option>
<option value="etanol">Etanol</option>
<option value="diesel">Diesel</option>
<option value="hibrido">Híbrido</option>
<option value="eletrico">Elétrico</option>
<option value="gnv">GNV</option>
</select>
</div>
<div className="form-group">
<label className="form-label">Câmbio</label>
<select className="form-select" value={form.cambio} onChange={(e) => update("cambio", e.target.value)}>
<option value="manual">Manual</option>
<option value="automatico">Automático</option>
<option value="cvt">CVT</option>
<option value="automatizado">Automatizado</option>
</select>
</div>
<div className="form-group">
<label className="form-label">Preço de compra</label>
<input
className="form-input"
inputMode="decimal"
value={form.preco_compra}
onChange={(e) => update("preco_compra", e.target.value)}
/>
</div>
<div className="form-group">
<label className="form-label">Preço de venda *</label>
<input
className="form-input"
inputMode="decimal"
value={form.preco_venda}
onChange={(e) => update("preco_venda", e.target.value)}
/>
</div>
<div className="form-group">
<label className="form-label">Status</label>
<select className="form-select" value={form.status} onChange={(e) => update("status", e.target.value)}>
<option value="em_preparacao">Em preparação</option>
<option value="disponivel">Disponível</option>
<option value="reservado">Reservado</option>
<option value="vendido">Vendido</option>
<option value="inativo">Inativo</option>
</select>
</div>
<div className="form-group">
<label className="form-label">Garantia (dias)</label>
<input
className="form-input"
inputMode="numeric"
value={form.garantia_dias}
onChange={(e) => update("garantia_dias", e.target.value)}
/>
</div>
<div className="form-group checkbox-row">
<input
id="laudo"
type="checkbox"
checked={form.laudo_cautelar_aprovado}
onChange={(e) => update("laudo_cautelar_aprovado", e.target.checked)}
/>
<label htmlFor="laudo">Laudo cautelar aprovado</label>
</div>
</div>
<div className="form-group">
<label className="form-label">Descrição</label>
<textarea
className="form-textarea"
rows={3}
value={form.descricao}
onChange={(e) => update("descricao", e.target.value)}
/>
</div>
<FotosExistentes fotos={fotosExistentes} onChange={setFotosExistentes} />
<FotosUpload fotos={fotosNovas} onChange={setFotosNovas} />
{error && <p className="auth-error">{error}</p>}
{salvo && !loading && <p className="form-hint" style={{ color: "#5ac882" }}>Alterações salvas com sucesso!</p>}
<div className="form-actions">
<button type="button" className="secondary-button" onClick={() => router.push("/veiculos")}>
Voltar
</button>
<button type="submit" className="primary-button" disabled={loading}>
{loading ? "Salvando..." : "Salvar alterações"}
</button>
</div>
</form>
</div>
);
}
