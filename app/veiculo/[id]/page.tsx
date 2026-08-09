import { createClient } from "@/lib/supabase/server";
import ChatWidget from "@/components/chat/ChatWidget";
export const dynamic = "force-dynamic";
function formatMoney(value: number | null) {
if (value === null || value === undefined) return "Consulte";
return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export default async function VeiculoPublicoPage({ params }: { params: { id: string } }) {
const supabase = await createClient();
const { data: veiculo } = await supabase
.from("veiculos")
.select("*, fotos:veiculo_fotos(url, ordem)")
.eq("id", params.id)
.single();
if (!veiculo) {
return (
<div style={{ padding: 40, textAlign: "center", color: "#9a9a9c" }}>
Veículo não encontrado.
</div>
);
}
const fotos = (veiculo.fotos ?? []).sort((a: any, b: any) => a.ordem - b.ordem);
return (
<div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px" }}>
<div style={{ marginBottom: 24, textAlign: "center" }}>
<div className="brand" style={{ fontSize: 22 }}>MINOWA</div>
<div className="brand-sub">Gestão Automotiva</div>
</div>
{fotos.length > 0 ? (
<div style={{ display: "grid", gridTemplateColumns: fotos.length > 1 ? "1fr 1fr" : "1fr", gap: 8, marginBottom: 20 }}>
{fotos.map((f: any, i: number) => (
<img
key={i}
src={f.url}
alt={`Foto ${i + 1}`}
style={{ width: "100%", borderRadius: 10, objectFit: "cover", maxHeight: 320 }}
/>
))}
</div>
) : (
<div className="empty-state" style={{ marginBottom: 20 }}>Sem fotos disponíveis</div>
)}
<h1 className="page-title" style={{ marginBottom: 4 }}>
{veiculo.marca} {veiculo.modelo} {veiculo.versao || ""}
</h1>
<div className="destaque-preco" style={{ fontSize: 26, marginBottom: 20 }}>
{formatMoney(veiculo.preco_venda)}
</div>
<div className="widget-card">
<div className="form-grid">
<div><span className="form-label">Ano</span><div>{veiculo.ano_fabricacao || "—"}/{veiculo.ano_modelo || "—"}</div></div>
<div><span className="form-label">KM</span><div>{veiculo.km ? `${veiculo.km.toLocaleString("pt-BR")} km` : "—"}</div></div>
<div><span className="form-label">Cor</span><div className="capitalize">{veiculo.cor || "—"}</div></div>
<div><span className="form-label">Câmbio</span><div className="capitalize">{veiculo.cambio || "—"}</div></div>
<div><span className="form-label">Combustível</span><div className="capitalize">{veiculo.combustivel || "—"}</div></div>
<div><span className="form-label">Garantia</span><div>{veiculo.garantia_dias ? `${veiculo.garantia_dias} dias` : "Sem garantia"}</div></div>
</div>
{veiculo.descricao && (
<div style={{ marginTop: 16 }}>
<span className="form-label">Descrição</span>
<p style={{ marginTop: 4 }}>{veiculo.descricao}</p>
</div>
)}
</div>
<ChatWidget contextoInicial={`${veiculo.marca} ${veiculo.modelo}`} />
</div>
);
}
