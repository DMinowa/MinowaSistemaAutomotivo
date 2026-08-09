import NovoVeiculoForm from "@/components/veiculos/NovoVeiculoForm";
export const dynamic = "force-dynamic";
export default function NovoVeiculoPage() {
return (
<div>
<h1 className="page-title">Novo veículo</h1>
<p className="page-subtitle">Cadastre um veículo no estoque</p>
<NovoVeiculoForm />
</div>
);
}
