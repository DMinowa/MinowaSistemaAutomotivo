import { createClient } from "@/lib/supabase/server";
import EditarClienteForm from "@/components/clientes/EditarClienteForm";
export const dynamic = "force-dynamic";
export default async function ClienteDetalhePage({ params }: { params: { id: string } }) {
const supabase = await createClient();
const { data: cliente, error } = await supabase
.from("clientes")
.select("*")
.eq("id", params.id)
.single();
if (error || !cliente) {
return (
<div>
<h1 className="page-title">Cliente não encontrado</h1>
<p className="page-subtitle">Verifique se o link está correto ou volte para a lista de clientes.</p>
</div>
);
}
return (
<div>
<h1 className="page-title">{cliente.nome}</h1>
<p className="page-subtitle">Edite os dados deste cliente</p>
<EditarClienteForm cliente={cliente} />
</div>
);
}
