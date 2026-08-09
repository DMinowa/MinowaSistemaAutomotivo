"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export default function LoginPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
const router = useRouter();
async function handleSubmit(e: FormEvent) {
e.preventDefault();
setLoading(true);
setError(null);
const supabase = createClient();
const { error } = await supabase.auth.signInWithPassword({ email, password });
setLoading(false);
if (error) {
setError("E-mail ou senha incorretos.");
return;
}
router.push("/");
router.refresh();
}
return (
<form className="auth-card" onSubmit={handleSubmit}>
<div className="brand">MINOWA</div>
<div className="brand-sub">Gestão Automotiva</div>
<h1 className="auth-title">Entrar</h1>
<label className="auth-label" htmlFor="email">
E-mail
</label>
<input
id="email"
className="auth-input"
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
/>
<label className="auth-label" htmlFor="password">
Senha
</label>
<input
id="password"
className="auth-input"
type="password"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
/>
{error && <p className="auth-error">{error}</p>}
<button className="auth-button" type="submit" disabled={loading}>
{loading ? "Entrando..." : "Entrar"}
</button>
<a className="auth-link" href="/signup">
Ainda não tem conta? Criar acesso
</a>
</form>
);
}
