import LogoutButton from "@/components/LogoutButton";
const NAV_ITEMS = [
{ label: "Dashboard", href: "/" },
{ label: "Clientes", href: "/clientes" },
{ label: "Veículos", href: "/veiculos" },
{ label: "Leads", href: "/leads" },
{ label: "Vendas", href: "/vendas" },
{ label: "Financeiro", href: "/financeiro" },
{ label: "Financiamento", href: "/financiamento" },
{ label: "Relatórios", href: "/relatorios" },
{ label: "Configurações", href: "/configuracoes" },
];
export default function DashboardLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
<div className="layout">
<aside className="sidebar">
<div>
<div className="brand">MINOWA</div>
<div className="brand-sub">Gestão Automotiva</div>
<nav>
{NAV_ITEMS.map((item) => (
<a key={item.href} href={item.href} className="nav-item">
{item.label}
</a>
))}
</nav>
</div>
<div className="sidebar-footer">
<LogoutButton />
</div>
</aside>
<main className="main">{children}</main>
</div>
);
}
