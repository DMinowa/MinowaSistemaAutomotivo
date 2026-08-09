"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export type FotoExistente = { id: string; url: string; ordem: number };
function extrairPathDoStorage(url: string): string | null {
const marcador = "/veiculo-fotos/";
const index = url.indexOf(marcador);
if (index === -1) return null;
return url.slice(index + marcador.length);
}
export default function FotosExistentes({
fotos,
onChange,
}: {
fotos: FotoExistente[];
onChange: (fotos: FotoExistente[]) => void;
}) {
const [removendo, setRemovendo] = useState<string | null>(null);
async function handleRemover(foto: FotoExistente) {
setRemovendo(foto.id);
const supabase = createClient();
const path = extrairPathDoStorage(foto.url);
if (path) {
await supabase.storage.from("veiculo-fotos").remove([path]);
}
await supabase.from("veiculo_fotos").delete().eq("id", foto.id);
onChange(fotos.filter((f) => f.id !== foto.id));
setRemovendo(null);
}
if (fotos.length === 0) return null;
return (
<div className="form-group">
<label className="form-label">Fotos salvas</label>
<div className="destaque-grid">
{fotos.map((f) => (
<div key={f.id} className="destaque-card" style={{ padding: 8 }}>
<img
src={f.url}
alt="Foto do veículo"
style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 6, marginBottom: 8 }}
/>
<button
type="button"
className="secondary-button"
style={{ width: "100%", padding: "4px 8px", fontSize: 12 }}
disabled={removendo === f.id}
onClick={() => handleRemover(f)}
>
{removendo === f.id ? "Removendo..." : "Remover"}
</button>
</div>
))}
</div>
</div>
);
}
