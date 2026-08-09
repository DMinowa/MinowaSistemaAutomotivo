import { createClient } from "@/lib/supabase/server";
export type FiltrosVeiculo = {
marca?: string;
modelo?: string;
ano_min?: number;
ano_max?: number;
preco_min?: number;
preco_max?: number;
cambio?: string;
combustivel?: string;
km_max?: number;
};
export async function buscarVeiculosDisponiveis(filtros: FiltrosVeiculo) {
const supabase = await createClient();
let query = supabase
.from("veiculos")
.select(
"id, marca, modelo, versao, ano_fabricacao, ano_modelo, km, cor, cambio, combustivel, preco_venda, descricao, garantia_dias"
)
.eq("status", "disponivel")
.order("criado_em", { ascending: false })
.limit(8);
if (filtros.marca) query = query.ilike("marca", `%${filtros.marca}%`);
if (filtros.modelo) query = query.ilike("modelo", `%${filtros.modelo}%`);
if (filtros.ano_min) query = query.gte("ano_modelo", filtros.ano_min);
if (filtros.ano_max) query = query.lte("ano_modelo", filtros.ano_max);
if (filtros.preco_min) query = query.gte("preco_venda", filtros.preco_min);
if (filtros.preco_max) query = query.lte("preco_venda", filtros.preco_max);
if (filtros.cambio) query = query.eq("cambio", filtros.cambio);
if (filtros.combustivel) query = query.eq("combustivel", filtros.combustivel);
if (filtros.km_max) query = query.lte("km", filtros.km_max);
const { data, error } = await query;
if (error) return { erro: error.message, veiculos: [] as any[] };
return { erro: null, veiculos: data ?? [] };
}
