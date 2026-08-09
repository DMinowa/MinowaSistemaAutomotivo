import ChatWidget from "@/components/chat/ChatWidget";
export const dynamic = "force-dynamic";
export default function ChatPage() {
return (
<div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
<div style={{ textAlign: "center", marginBottom: 24 }}>
<div className="brand" style={{ fontSize: 22 }}>MINOWA</div>
<div className="brand-sub">Fale com a Ana, nossa consultora virtual</div>
</div>
<ChatWidget aberturaInicial />
</div>
);
}
