import { createClient } from "@/lib/supabase/server";
import SimuladorForm from "@/components/financiamento/SimuladorForm";
export const dynamic = "force-dynamic";
export default async function FinanciamentoPage() {
const supabase = await createClient();
const { data: veiculos } = await supabase
.from("veiculos")
.select("id, marca, modelo, preco_venda")
.neq("status", "vendido")
.order("marca");
return (
<div>
<h1 className="page-title">Financiamento</h1>
<p className="page-subtitle">Simule condições de financiamento com garantia do veículo</p>
<SimuladorForm veiculos={veiculos ?? []} />
</div>
);
}
