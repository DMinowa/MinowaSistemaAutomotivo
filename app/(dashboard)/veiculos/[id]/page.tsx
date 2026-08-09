import { createClient } from "@/lib/supabase/server";
import EditarVeiculoForm from "@/components/veiculos/EditarVeiculoForm";
export const dynamic = "force-dynamic";
export default async function VeiculoDetalhePage({ params }: { params: { id: string } }) {
const supabase = await createClient();
const { data: veiculo, error } = await supabase
.from("veiculos")
.select("*, fotos:veiculo_fotos(id, url, ordem)")
.eq("id", params.id)
.single();
if (error || !veiculo) {
return (
<div>
<h1 className="page-title">Veículo não encontrado</h1>
<p className="page-subtitle">Verifique se o link está correto ou volte para a lista de veículos.</p>
</div>
);
}
const fotos = (veiculo.fotos ?? []).sort((a: any, b: any) => a.ordem - b.ordem);
return (
<div>
<h1 className="page-title">
{veiculo.marca} {veiculo.modelo} {veiculo.versao || ""}
</h1>
<p className="page-subtitle">Edite os dados e as fotos deste veículo</p>
<EditarVeiculoForm veiculo={veiculo} fotosIniciais={fotos} />
</div>
);
}
