import { createClient } from "@/lib/supabase/server";
import NovaVendaForm from "@/components/vendas/NovaVendaForm";
export const dynamic = "force-dynamic";
export default async function NovaVendaPage() {
const supabase = await createClient();
const [{ data: clientes }, { data: veiculos }, { data: vendedores }] = await Promise.all([
supabase.from("clientes").select("id, nome").order("nome"),
supabase
.from("veiculos")
.select("id, marca, modelo, preco_venda")
.neq("status", "vendido")
.order("marca"),
supabase.from("usuarios").select("id, nome").order("nome"),
]);
return (
<div>
<h1 className="page-title">Nova venda</h1>
<p className="page-subtitle">Registre uma venda vinculando cliente e veículo</p>
<NovaVendaForm
clientes={clientes ?? []}
veiculos={veiculos ?? []}
vendedores={vendedores ?? []}
/>
</div>
);
}
