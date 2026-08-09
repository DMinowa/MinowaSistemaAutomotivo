"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export type FotoPendente = { file: File; preview: string };
export default function FotosUpload({
fotos,
onChange,
}: {
fotos: FotoPendente[];
onChange: (fotos: FotoPendente[]) => void;
}) {
const [erro, setErro] = useState<string | null>(null);
function handleFiles(fileList: FileList | null) {
if (!fileList) return;
const novas: FotoPendente[] = Array.from(fileList).map((file) => ({
file,
preview: URL.createObjectURL(file),
}));
onChange([...fotos, ...novas]);
setErro(null);
}
function remover(index: number) {
const copia = [...fotos];
copia.splice(index, 1);
onChange(copia);
}
return (
<div className="form-group">
<label className="form-label">Fotos do veículo</label>
<input
type="file"
accept="image/*"
multiple
className="form-input"
onChange={(e) => handleFiles(e.target.files)}
/>
{erro && <p className="auth-error">{erro}</p>}
{fotos.length > 0 && (
<div className="destaque-grid" style={{ marginTop: 12 }}>
{fotos.map((f, i) => (
<div key={i} className="destaque-card" style={{ padding: 8 }}>
<img
src={f.preview}
alt="Foto do veículo"
style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 6, marginBottom: 8 }}
/>
<button
type="button"
className="secondary-button"
style={{ width: "100%", padding: "4px 8px", fontSize: 12 }}
onClick={() => remover(i)}
>
Remover
</button>
</div>
))}
</div>
)}
</div>
);
}
export async function enviarFotos(veiculoId: string, fotos: FotoPendente[]) {
if (fotos.length === 0) return;
const supabase = createClient();
for (let i = 0; i < fotos.length; i++) {
const foto = fotos[i];
const ext = foto.file.name.split(".").pop() || "jpg";
const path = `${veiculoId}/${Date.now()}-${i}.${ext}`;
const { error: uploadError } = await supabase.storage
.from("veiculo-fotos")
.upload(path, foto.file);
if (uploadError) continue;
const { data: publicUrlData } = supabase.storage.from("veiculo-fotos").getPublicUrl(path);
await supabase.from("veiculo_fotos").insert({
veiculo_id: veiculoId,
url: publicUrlData.publicUrl,
ordem: i,
});
}
}
