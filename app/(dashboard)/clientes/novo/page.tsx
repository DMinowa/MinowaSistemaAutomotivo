import NovoClienteForm from "@/components/clientes/NovoClienteForm";
export const dynamic = "force-dynamic";
export default function NovoClientePage() {
return (
<div>
<h1 className="page-title">Novo cliente</h1>
<p className="page-subtitle">Cadastre um cliente formalmente</p>
<NovoClienteForm />
</div>
);
}
