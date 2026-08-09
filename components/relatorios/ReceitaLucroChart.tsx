"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
type Ponto = { label: string; receita: number; lucro: number };
export default function ReceitaLucroChart({ data }: { data: Ponto[] }) {
if (!data || data.length === 0) {
return <p className="empty-state">Nenhum dado no período selecionado</p>;
}
return (
<ResponsiveContainer width="100%" height={260}>
<LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
<CartesianGrid strokeDasharray="3 3" stroke="#262627" vertical={false} />
<XAxis dataKey="label" stroke="#9a9a9c" fontSize={12} tickLine={false} axisLine={false} />
<YAxis stroke="#9a9a9c" fontSize={12} tickLine={false} axisLine={false} />
<Tooltip
contentStyle={{
background: "#161617",
border: "1px solid #262627",
borderRadius: 8,
color: "#f5f5f5",
fontSize: 13,
}}
labelStyle={{ color: "#9a9a9c" }}
formatter={(value: number) =>
value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}
/>
<Legend
formatter={(value) => <span style={{ color: "#9a9a9c", fontSize: 13 }}>{value}</span>}
/>
<Line
type="monotone"
dataKey="receita"
name="Receita"
stroke="#e0263c"
strokeWidth={2}
dot={false}
/>
<Line
type="monotone"
dataKey="lucro"
name="Lucro"
stroke="#f5f5f5"
strokeWidth={2}
dot={false}
/>
</LineChart>
</ResponsiveContainer>
);
}
