"use client";
import { useState } from "react";
export type DadosCrlv = {
marca?: string;
modelo?: string;
versao?: string;
ano_fabricacao?: string;
ano_modelo?: string;
placa?: string;
chassi?: string;
renavam?: string;
cor?: string;
combustivel?: string;
};
function fileToBase64(file: File): Promise<string> {
return new Promise((resolve, reject) => {
const reader = new FileReader();
reader.onload = () => {
const result = reader.result as string;
resolve(result.split(",")[1]);
};
reader.onerror = reject;
reader.readAsDataURL(file);
});
}
export default function CrlvUpload({ onReconhecido }: { onReconhecido: (dados: DadosCrlv) => void }) {
const [carregando, setCarregando] = useState(false);
const [erro, setErro] = useState<string | null>(null);
const [sucesso, setSucesso] = useState(false);
async function handleFile(file: File | undefined) {
if (!file) return;
setCarregando(true);
setErro(null);
setSucesso(false);
try {
const base64 = await fileToBase64(file);
const res = await fetch("/api/reconhecer-crlv", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ base64, mediaType: file.type }),
});
const json = await res.json();
if (!res.ok) {
setErro(json.error || "Não foi possível reconhecer os dados.");
return;
}
onReconhecido(json.dados ?? {});
setSucesso(true);
} catch (e: any) {
setErro("Erro ao processar o arquivo. Tente novamente.");
} finally {
setCarregando(false);
}
}
return (
<div className="widget-card">
<div className="widget-title" style={{ marginBottom: 8 }}>
📄 Reconhecer dados do CRLV
</div>
<p className="form-hint" style={{ marginBottom: 12 }}>
Envie uma foto ou PDF do CRLV / CRLV-e para preencher automaticamente os campos abaixo.
</p>
<input
type="file"
accept="image/*,application/pdf"
className="form-input"
disabled={carregando}
onChange={(e) => handleFile(e.target.files?.[0])}
/>
{carregando && <p className="form-hint">Lendo o documento, aguarde...</p>}
{erro && <p className="auth-error">{erro}</p>}
{sucesso && !carregando && (
<p className="form-hint" style={{ color: "#5ac882" }}>
Dados reconhecidos! Confira e ajuste os campos abaixo se necessário.
</p>
)}
</div>
);
}
