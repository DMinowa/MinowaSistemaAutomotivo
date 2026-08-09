"use client";
import { useEffect, useRef, useState } from "react";
type Mensagem = { role: "user" | "assistant"; content: string };
const SAUDACAO: Mensagem = {
role: "assistant",
content:
"Oi! Eu sou a Ana, consultora virtual da Minowa Veículos 🚗 Me conta, você está procurando algum carro em especial?",
};
export default function ChatWidget({
contextoInicial,
aberturaInicial,
}: {
contextoInicial?: string;
aberturaInicial?: boolean;
}) {
const [aberto, setAberto] = useState(!!aberturaInicial);
const [mensagens, setMensagens] = useState<Mensagem[]>([SAUDACAO]);
const [texto, setTexto] = useState("");
const [carregando, setCarregando] = useState(false);
const [linkVendedor, setLinkVendedor] = useState<string | null>(null);
const fimRef = useRef<HTMLDivElement>(null);
useEffect(() => {
if (contextoInicial && aberto && mensagens.length === 1) {
setMensagens((m) => [
...m,
{ role: "assistant", content: `Vi que você está de olho no ${contextoInicial}. Quer saber mais sobre ele?` },
]);
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [aberto]);
useEffect(() => {
fimRef.current?.scrollIntoView({ behavior: "smooth" });
}, [mensagens, aberto]);
async function enviarMensagem() {
const conteudo = texto.trim();
if (!conteudo || carregando) return;
const novasMensagens: Mensagem[] = [...mensagens, { role: "user", content: conteudo }];
setMensagens(novasMensagens);
setTexto("");
setCarregando(true);
try {
const res = await fetch("/api/chat", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ mensagens: novasMensagens }),
});
const json = await res.json();
if (!res.ok) {
setMensagens((m) => [...m, { role: "assistant", content: "Ops, tive um probleminha aqui. Pode tentar de novo?" }]);
return;
}
setMensagens((m) => [...m, { role: "assistant", content: json.resposta }]);
if (json.linkVendedor) setLinkVendedor(json.linkVendedor);
} catch {
setMensagens((m) => [...m, { role: "assistant", content: "Ops, tive um probleminha aqui. Pode tentar de novo?" }]);
} finally {
setCarregando(false);
}
}
function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
if (e.key === "Enter") enviarMensagem();
}
return (
<div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
{aberto && (
<div
style={{
width: 340,
maxWidth: "calc(100vw - 40px)",
height: 480,
background: "#161617",
border: "1px solid #262627",
borderRadius: 14,
display: "flex",
flexDirection: "column",
boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
marginBottom: 12,
overflow: "hidden",
}}
>
<div
style={{
padding: "14px 16px",
borderBottom: "1px solid #262627",
display: "flex",
alignItems: "center",
gap: 10,
}}
>
<div
style={{
width: 32,
height: 32,
borderRadius: "50%",
background: "rgba(224,38,60,0.15)",
color: "#e0263c",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontWeight: 700,
fontSize: 13,
}}
>
A
</div>
<div>
<div style={{ color: "#f5f5f5", fontWeight: 600, fontSize: 14 }}>Ana · Minowa Veículos</div>
<div style={{ color: "#9a9a9c", fontSize: 11 }}>Consultora virtual</div>
</div>
</div>
<div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
{mensagens.map((m, i) => (
<div
key={i}
style={{
alignSelf: m.role === "user" ? "flex-end" : "flex-start",
background: m.role === "user" ? "#e0263c" : "#0c0c0d",
color: "#f5f5f5",
padding: "8px 12px",
borderRadius: 12,
maxWidth: "85%",
fontSize: 13.5,
lineHeight: 1.4,
whiteSpace: "pre-wrap",
}}
>
{m.content}
</div>
))}
{carregando && (
<div style={{ color: "#9a9a9c", fontSize: 12, alignSelf: "flex-start" }}>Ana está digitando...</div>
)}
{linkVendedor && (
<a
href={linkVendedor}
target="_blank"
rel="noopener noreferrer"
style={{
alignSelf: "flex-start",
background: "#1f7a3d",
color: "#fff",
padding: "8px 12px",
borderRadius: 12,
fontSize: 13,
textDecoration: "none",
}}
>
📲 Falar com um vendedor agora
</a>
)}
<div ref={fimRef} />
</div>
<div style={{ padding: 10, borderTop: "1px solid #262627" }}>
<div style={{ display: "flex", gap: 8 }}>
<input
value={texto}
onChange={(e) => setTexto(e.target.value)}
onKeyDown={handleKeyDown}
placeholder="Digite sua mensagem..."
style={{
flex: 1,
background: "#0c0c0d",
border: "1px solid #262627",
borderRadius: 8,
padding: "8px 10px",
color: "#f5f5f5",
fontSize: 13.5,
}}
/>
<button
onClick={enviarMensagem}
disabled={carregando}
style={{
background: "#e0263c",
color: "#fff",
border: "none",
borderRadius: 8,
padding: "0 14px",
fontSize: 13,
fontWeight: 600,
cursor: "pointer",
}}
>
Enviar
</button>
</div>
<p style={{ color: "#9a9a9c", fontSize: 10, marginTop: 6, marginBottom: 0 }}>
Seus dados são usados apenas para contato comercial da Minowa Veículos.
</p>
</div>
</div>
)}
<button
onClick={() => setAberto((a) => !a)}
style={{
width: 56,
height: 56,
borderRadius: "50%",
background: "#e0263c",
color: "#fff",
border: "none",
fontSize: 24,
cursor: "pointer",
boxShadow: "0 8px 20px rgba(224,38,60,0.4)",
}}
aria-label="Abrir chat"
>
{aberto ? "✕" : "💬"}
</button>
</div>
);
}
