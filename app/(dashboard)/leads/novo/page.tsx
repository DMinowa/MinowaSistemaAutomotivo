import { createClient } from "@/lib/supabase/server";
import NovoLeadForm from "@/components/leads/NovoLeadForm";
export const dynamic = "force-dynamic";
export default async function NovoLeadPage() {
const supabase = await createClient();
const { data: veiculos } = await supabase
.from("veiculos")
.select("id, marca, modelo")
.order("marca");
return (
<div>
<h1 className="page-title">Novo lead</h1>
<p className="page-subtitle">
Cadastre manualmente um contato recebido fora do chatbot (telefone, WhatsApp direto, indicação, etc.)
</p>
<NovoLeadForm veiculos={veiculos ?? []} />
</div>
);
}
