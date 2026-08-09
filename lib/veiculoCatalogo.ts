export type ModeloCatalogo = { nome: string; versoes: string[] };
export type MarcaCatalogo = { nome: string; modelos: ModeloCatalogo[] };
export const CATALOGO_VEICULOS: MarcaCatalogo[] = [
{
nome: "Chevrolet",
modelos: [
{ nome: "Onix", versoes: ["Joy", "LT", "LTZ", "Premier", "RS"] },
{ nome: "Onix Plus", versoes: ["LT", "LTZ", "Premier", "RS"] },
{ nome: "Tracker", versoes: ["LT", "LTZ", "Premier", "RS"] },
{ nome: "S10", versoes: ["LS", "LT", "LTZ", "High Country"] },
{ nome: "Spin", versoes: ["LT", "LTZ", "Activ"] },
{ nome: "Cruze", versoes: ["LT", "LTZ", "Premier"] },
{ nome: "Montana", versoes: ["LS", "LT", "Premier"] },
],
},
{
nome: "Volkswagen",
modelos: [
{ nome: "Gol", versoes: ["1.0", "1.6 MSI"] },
{ nome: "Polo", versoes: ["MSI", "TSI Comfortline", "TSI Highline", "GTS"] },
{ nome: "Virtus", versoes: ["MSI", "TSI Comfortline", "TSI Highline", "GTS"] },
{ nome: "T-Cross", versoes: ["200 TSI", "250 TSI Comfortline", "250 TSI Highline"] },
{ nome: "Nivus", versoes: ["200 TSI", "250 TSI Comfortline", "250 TSI Highline"] },
{ nome: "Saveiro", versoes: ["Robust", "Trendline", "Cross"] },
{ nome: "Amarok", versoes: ["S", "SE", "V6 Highline", "V6 Extreme"] },
],
},
{
nome: "Fiat",
modelos: [
{ nome: "Mobi", versoes: ["Like", "Trekking"] },
{ nome: "Argo", versoes: ["Drive", "Trekking", "HGT"] },
{ nome: "Cronos", versoes: ["Drive", "Precision"] },
{ nome: "Pulse", versoes: ["Drive", "Audace", "Impetus", "Abarth"] },
{ nome: "Fastback", versoes: ["Audace", "Impetus", "Abarth"] },
{ nome: "Toro", versoes: ["Endurance", "Freedom", "Volcano", "Ultra"] },
{ nome: "Strada", versoes: ["Endurance", "Freedom", "Volcano"] },
],
},
{
nome: "Hyundai",
modelos: [
{ nome: "HB20", versoes: ["Sense", "Comfort", "Platinum", "N Line"] },
{ nome: "HB20S", versoes: ["Sense", "Comfort", "Platinum"] },
{ nome: "Creta", versoes: ["Action", "Comfort", "Limited", "N Line"] },
{ nome: "Tucson", versoes: ["GLS", "Limited"] },
{ nome: "HB20X", versoes: ["Sense", "Comfort"] },
],
},
{
nome: "Toyota",
modelos: [
{ nome: "Corolla", versoes: ["GLi", "XEi", "Altis", "Altis Hybrid", "GR-S"] },
{ nome: "Corolla Cross", versoes: ["XR", "XRE", "XRV", "Hybrid"] },
{ nome: "Hilux", versoes: ["SR", "SRV", "SRX", "GR-Sport"] },
{ nome: "Yaris", versoes: ["XL", "XS", "XLS"] },
{ nome: "Etios", versoes: ["X", "XS", "XLS"] },
{ nome: "SW4", versoes: ["SR", "SRX", "Diamond"] },
],
},
{
nome: "Honda",
modelos: [
{ nome: "HR-V", versoes: ["LX", "EX", "EXL", "Advance"] },
{ nome: "City", versoes: ["DX", "EX", "EXL", "Touring"] },
{ nome: "City Hatchback", versoes: ["DX", "EX", "EXL"] },
{ nome: "Civic", versoes: ["EX", "EXL", "Touring"] },
{ nome: "WR-V", versoes: ["LX", "EX", "EXL"] },
],
},
{
nome: "Jeep",
modelos: [
{ nome: "Renegade", versoes: ["Sport", "Longitude", "Limited", "Trailhawk"] },
{ nome: "Compass", versoes: ["Sport", "Longitude", "Limited", "S", "Trailhawk"] },
{ nome: "Commander", versoes: ["Longitude", "Limited", "Overland"] },
],
},
{
nome: "Renault",
modelos: [
{ nome: "Kwid", versoes: ["Zen", "Intense"] },
{ nome: "Sandero", versoes: ["Zen", "Intense", "RS"] },
{ nome: "Logan", versoes: ["Zen", "Intense"] },
{ nome: "Duster", versoes: ["Zen", "Intense", "Iconic"] },
{ nome: "Oroch", versoes: ["Zen", "Intense"] },
],
},
{
nome: "Nissan",
modelos: [
{ nome: "Kicks", versoes: ["S", "SV", "SL", "Advance"] },
{ nome: "Versa", versoes: ["S", "SV", "SL", "Advance"] },
{ nome: "Frontier", versoes: ["S", "SE", "Attack", "LE"] },
],
},
{
nome: "Ford",
modelos: [
{ nome: "Ka", versoes: ["S", "SE", "SEL"] },
{ nome: "EcoSport", versoes: ["S", "SE", "Titanium", "Storm"] },
{ nome: "Ranger", versoes: ["XL", "XLS", "XLT", "Limited", "Raptor"] },
{ nome: "Territory", versoes: ["S", "SE", "Titanium"] },
],
},
{
nome: "Peugeot",
modelos: [
{ nome: "208", versoes: ["Like", "Active", "Griffe"] },
{ nome: "2008", versoes: ["Active", "Allure", "Griffe"] },
{ nome: "3008", versoes: ["Allure", "Griffe"] },
],
},
{
nome: "Citroën",
modelos: [
{ nome: "C3", versoes: ["Live", "Feel", "Shine"] },
{ nome: "C4 Cactus", versoes: ["Live", "Feel", "Shine"] },
],
},
{
nome: "Mitsubishi",
modelos: [
{ nome: "L200 Triton", versoes: ["GLS", "GLS-S", "Sport", "HPE"] },
{ nome: "Outlander", versoes: ["GLS", "HPE"] },
{ nome: "Eclipse Cross", versoes: ["GLS", "HPE"] },
],
},
{
nome: "BYD",
modelos: [
{ nome: "Dolphin", versoes: ["GS", "GL", "GD Plus"] },
{ nome: "Song Plus", versoes: ["Premium", "DM-i"] },
{ nome: "Seal", versoes: ["Design", "Premium"] },
],
},
];
