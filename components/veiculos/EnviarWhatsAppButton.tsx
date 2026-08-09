"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
type Props = {
id: string;
marca: string;
modelo: string;
versao: string | null;
preco_venda: number | null;
ano_modelo: number | null;
km: number | null;
};
function formatMoney(value: number | null) {
if (value === null || value === undefined) return "Consulte";
return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
async function urlParaArquivo(url: string, nome: string): Promise<File | null> {
try {
const res = await fetch(url);
const blob = await res.blob();
return new File([blob], nome, { type: blob.type || "image/jpeg" });
} catch {
return null;
}
}
export default function EnviarWhatsAppButton({ id, marca, modelo, versao, preco_venda, ano_modelo, km }: Props) {
const [carregando, setCarregando] = useState(false);
function montarTexto(link: string) {
const linhas = [
`🚗 *${marca} ${modelo}${versao ? " " + versao : ""}*`,
ano_modelo ? `Ano: ${ano_modelo}` : null,
km ? `KM: ${km.toLocaleString("pt-BR")}` : null,
`Valor: ${formatMoney(preco_venda)}`,
"",
`Veja fotos e detalhes: ${link}`,
].filter(Boolean);
return linhas.join("\n");
}
async function handleClick() {
const link = `${window.location.origin}/veiculo/${id}`;
setCarregando(true);
try {
const supabase = createClient();
const { data: fotos } = await supabase
.from("veiculo_fotos")
.select("url")
.eq("veiculo_id", id)
.order("ordem");
const urls = (fotos ?? []).map((f: any) => f.url).slice(0, 5);
if (urls.length > 0 && typeof navigator !== "undefined" && (navigator as any).canShare) {
const arquivos = (
await Promise.all(urls.map((u: string, i: number) => urlParaArquivo(u, `foto-${i + 1}.jpg`)))
).filter((f): f is File => f !== null);
if (arquivos.length > 0 && (navigator as any).canShare({ files: arquivos })) {
await (navigator as any).share({
files: arquivos,
text: montarTexto(link),
});
setCarregando(false);
return;
}
}
} catch {
// segue para o fallback abaixo (ex: usuário cancelou o compartilhamento, ou navegador sem suporte)
}
const texto = encodeURIComponent(montarTexto(link));
window.open(`https://wa.me/?text=${texto}`, "_blank");
setCarregando(false);
}
return (
<button
type="button"
className="secondary-button"
style={{ padding: "6px 10px", fontSize: 12 }}
onClick={handleClick}
disabled={carregando}
>
{carregando ? "Preparando..." : "📲 WhatsApp"}
</button>
);
}
