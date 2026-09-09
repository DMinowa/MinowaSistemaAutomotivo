# Testes da integração OLX

O projeto não usa um framework de testes automatizados (Jest/Vitest) hoje — para não
adicionar complexidade desnecessária, os testes abaixo cobrem a lógica pura via script
manual, e os testes que dependem do banco ficam documentados como roteiro de verificação.

## Como rodar o teste 1 e 2 (lógica pura, sem banco)

```bash
node -e "
const { mapearOrigemOlx } = require('./lib/olxIntegration.ts'); // requer ts-node ou compilar antes
console.log(mapearOrigemOlx('financing')); // esperado: OLX — Simulação de financiamento
console.log(mapearOrigemOlx('chat'));      // esperado: OLX — Chat Inbox
"
```

Ou simplesmente inspecionar `SOURCE_LABELS` em `lib/olxIntegration.ts` — o mapeamento é
uma tabela estática, sem I/O, então a corretude é verificável por leitura direta.

## Testes 3-8 (dependem do banco — roteiro manual via curl)

Depois do deploy, com `OLX_LEADS_TOKEN` configurado (ou vazio para homologação):

### Teste 1 — source = financing
```bash
curl -X POST https://minowa-sistema-minowa-veiculos.vercel.app/api/integrations/olx/leads \
  -H "Content-Type: application/json" \
  -H "x-olx-token: SEU_TOKEN" \
  -d '{"source":"financing","name":"Teste 1","phone":"85999990001","externalId":"teste-1","createdAt":"2026-09-09T09:42:00.000Z"}'
```
Esperado: lead criado com `origem_detalhada = "OLX — Simulação de financiamento"`, `classificacao = "quente"`.

### Teste 2 — source = chat
```bash
curl -X POST .../api/integrations/olx/leads -d '{"source":"chat","name":"Teste 2","phone":"85999990002","externalId":"teste-2"}'
```
Esperado: `origem_detalhada = "OLX — Chat Inbox"`.

### Teste 3 — mesmo cliente, dois leads
Enviar dois payloads com o mesmo `phone` mas `externalId` diferentes.
Esperado: 1 cliente em `clientes`, 2 registros em `leads`, ambos com o mesmo `cliente_id`.

### Teste 4 — mesmo externalId
Reenviar o payload do Teste 1 com o mesmo `externalId: "teste-1"`.
Esperado: resposta `{ recebido: true, duplicado: true }`, nenhum lead novo criado.

### Teste 5 — veículo identificado por listId
Primeiro, definir `olx_list_id` em um veículo existente:
```sql
update veiculos set olx_list_id = '123456' where id = '<id de um veículo real>';
```
Depois enviar um lead com `"listId":"123456"`.
Esperado: `veiculo_interesse_id` do lead preenchido automaticamente.

### Teste 6 — sem veículo correspondente
Enviar lead sem `adId`/`listId`/`linkAd`/`adsInfo` compatível com nada no estoque.
Esperado: lead criado normalmente, `veiculo_interesse_id = null` — a página do lead mostra
"Veículo não identificado automaticamente".

### Teste 7 — payload inválido
```bash
curl -X POST .../api/integrations/olx/leads -d '{}'
```
Esperado: HTTP 200 com `{ processado: false, erro: "Payload inválido." }`, e uma linha em
`integracoes_log` com `tipo_evento = 'erro'`.

### Teste 8 — lead com adsInfo
Enviar lead sem `adId`/`listId`, mas com `adsInfo: { marca: "Renault", modelo: "Sandero", ano: 2022 }`.
Esperado: sistema tenta casar por marca+modelo+ano no estoque.
