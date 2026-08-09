"use client";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
export default function SignupPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState<string | null>(null);
const [done, setDone] = useState(false);
const [loading, setLoading] = useState(false);
async function handleSubmit(e: FormEvent) {
e.preventDefault();
setLoading(true);
setError(null);
const supabase = createClient();
const { error } = await supabase.auth.signUp({ email, password });
setLoading(false);
if (error) {
setError(error.message);
return;
}
setDone(true);
}
if (done) {
return (
<div className="auth-card">
<div className="brand">MINOWA</div>
<div className="brand-sub">Gestão Automotiva</div>
<h1 className="auth-title">Conta criada!</h1>
<p className="auth-hint">
Avise no chat do Claude que você já criou a conta com o e-mail{" "}
<strong>{email}</strong> para liberarmos o acesso, e depois volte
para a <a href="/login">tela de login</a>.
</p>
</div>
);
}
return (
<form className="auth-card" onSubmit={handleSubmit}>
<div className="brand">MINOWA</div>
<div className="brand-sub">Gestão Automotiva</div>
<h1 className="auth-title">Criar acesso</h1>
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
Senha (mínimo 6 caracteres)
</label>
<input
id="password"
className="auth-input"
type="password"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
minLength={6}
/>
{error && <p className="auth-error">{error}</p>}
<button className="auth-button" type="submit" disabled={loading}>
{loading ? "Criando..." : "Criar conta"}
</button>
<a className="auth-link" href="/login">
Já tem conta? Entrar
</a>
</form>
);
}
