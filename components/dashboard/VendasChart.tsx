"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
type Ponto = { dia: string; vendas: number };
export default function VendasChart({ data }: { data: Ponto[] }) {
return (
<ResponsiveContainer width="100%" height={220}>
<LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
<CartesianGrid strokeDasharray="3 3" stroke="#262627" vertical={false} />
<XAxis dataKey="dia" stroke="#9a9a9c" fontSize={12} tickLine={false} axisLine={false} />
<YAxis stroke="#9a9a9c" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
<Tooltip
contentStyle={{
background: "#161617",
border: "1px solid #262627",
borderRadius: 8,
color: "#f5f5f5",
fontSize: 13,
}}
labelStyle={{ color: "#9a9a9c" }}
/>
<Line
type="monotone"
dataKey="vendas"
stroke="#e0263c"
strokeWidth={2}
dot={{ r: 3, fill: "#e0263c" }}
activeDot={{ r: 5 }}
/>
</LineChart>
</ResponsiveContainer>
);
}
