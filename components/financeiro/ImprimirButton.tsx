"use client";
export default function ImprimirButton() {
return (
<button
type="button"
className="secondary-button"
onClick={() => window.print()}
>
🖨 Imprimir Relatório
</button>
);
}
