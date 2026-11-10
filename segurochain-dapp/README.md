# 🔗 SeguroChain dApp

**dApp de Seguro Veicular Descentralizado na Ethereum Sepolia**

> Trabalho 2 — ODS III · Solidity 0.8.20 · Web3.js 4.x · MetaMask · Vercel

---

## 📌 Descrição do Projeto

O **SeguroChain** é um dApp (aplicação descentralizada) de seguro veicular implementado em Solidity sobre a rede de testes Ethereum Sepolia. Ele digitaliza e automatiza processos de uma seguradora: emissão de apólices, registro de sinistros, análise automatizada com regras de negócio on-chain e registro de pagamentos de indenizações.

Este projeto é uma evolução de dois trabalhos anteriores:

| Projeto anterior | Tecnologia | Contribuição |
|-----------------|-----------|-------------|
| `dApp/` — Mural de Mensagens | Solidity + Web3.js | Padrões de frontend dApp |
| `seguroApp/` — Simulador Java | Java (OO puro) | Modelagem de regras de negócio |

---

## 🛠️ Stack de Tecnologias

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Contrato inteligente | Solidity | 0.8.20 |
| Compilação / Deploy | Hardhat | ^3.21.2 |
| Frontend Web3 | Web3.js | 4.16.0 (CDN) |
| Carteira | MetaMask | qualquer versão atual |
| Rede de testes | Ethereum Sepolia | Chain ID 11155111 |
| Hospedagem | Vercel | — |

---

## 📁 Estrutura do Projeto

```
segurochain-dapp/
├── contracts/
│   ├── SeguroChain.sol        ← Contrato principal (apólices + sinistros)
│   └── MuralDeMensagens.sol   ← Referência didática (exemplo anterior)
├── frontend/
│   ├── index.html             ← Interface do dApp
│   ├── app.js                 ← Lógica Web3.js 4.x
│   └── style.css              ← Tema escuro responsivo
├── hardhat.config.js          ← Configuração do Hardhat
├── package.json               ← Dependências e scripts NPM
├── vercel.json                ← Configuração de deploy no Vercel
├── .gitignore
└── README.md
```

---

## ⚙️ Configuração e Instalação

### Pré-requisitos

- [Node.js 18+](https://nodejs.org/)
- [MetaMask](https://metamask.io/) instalado no navegador
- Conta com ETH de teste na rede Sepolia ([Sepolia Faucet](https://sepoliafaucet.com/))

### 1. Instalar dependências

```bash
npm install
# ou
pnpm install
```

### 2. Criar arquivo `.env`

Crie um arquivo `.env` na raiz do projeto com:

```env
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=0xSUA_CHAVE_PRIVADA_AQUI
```

> ⚠️ **NUNCA** faça commit do arquivo `.env`. Ele já está no `.gitignore`.

### 3. Compilar o contrato

```bash
npx hardhat compile
```

A ABI gerada estará em `artifacts/contracts/SeguroChain.sol/SeguroChain.json`.

---

## 🚀 Deploy do Contrato

### Opção A — Remix IDE (recomendado para iniciantes)

1. Acesse [remix.ethereum.org](https://remix.ethereum.org)
2. Faça upload de `contracts/SeguroChain.sol`
3. Compile com Solidity 0.8.20
4. Na aba "Deploy & Run Transactions":
   - Environment: **Injected Provider — MetaMask**
   - Certifique-se de estar na rede **Sepolia**
5. Clique em **Deploy** e confirme no MetaMask
6. Copie o endereço do contrato deployado
7. Copie a ABI (botão "ABI" na aba "Solidity Compiler")

### Opção B — Hardhat (linha de comando)

```bash
npm run deploy:sepolia
```

---

## 🔧 Configurar o Frontend

Após o deploy, edite o arquivo `frontend/app.js`:

```js
// Linha 1: endereço do contrato deployado na Sepolia
const CONTRACT_ADDRESS = "0xSEU_ENDEREÇO_AQUI";

// Linha 2: ABI copiada do Remix ou de artifacts/
const ABI = [ /* cole aqui o array ABI completo */ ];
```

---

## 🧪 Testar Localmente

Abra `frontend/index.html` com um servidor local. Recomendamos a extensão **Live Server** do VS Code:

1. Clique com botão direito em `index.html` → "Open with Live Server"
2. A página abre em `http://127.0.0.1:5500`
3. Conecte o MetaMask na rede Sepolia
4. Interaja com o dApp

> ⚠️ Abrir o arquivo diretamente como `file://` pode bloquear requisições Web3 em alguns navegadores.

---

## 🌐 Deploy do Frontend no Vercel

```bash
# Instalar CLI do Vercel (uma vez)
npm install -g vercel

# Deploy
vercel --prod
```

O `vercel.json` já está configurado para servir a pasta `frontend/` como site estático.

---

## 🦊 Configurar MetaMask com a Rede Sepolia

1. Abra o MetaMask → clique na rede atual → "Adicionar rede"
2. Clique em "Adicionar uma rede manualmente" e preencha:

| Campo | Valor |
|-------|-------|
| Nome da rede | Sepolia Test Network |
| URL do RPC | `https://rpc.sepolia.org` |
| Chain ID | `11155111` |
| Símbolo | `ETH` |
| URL do explorador | `https://sepolia.etherscan.io` |

3. Obtenha ETH de teste em: [https://sepoliafaucet.com](https://sepoliafaucet.com)

---

## 📋 Resumo das Funções do Contrato

### Funções da Seguradora (owner)

| Função | Descrição |
|--------|-----------|
| `emitirApolice(...)` | Cria uma nova apólice com status ATIVA |
| `ativarApolice(id)` | Ativa uma apólice PENDENTE |
| `cancelarApolice(id)` | Cancela uma apólice |
| `analisarSinistro(id)` | Analisa sinistro aplicando regras de negócio |
| `pagarSinistro(id)` | Registra o pagamento de um sinistro APROVADO |

### Funções do Segurado

| Função | Descrição |
|--------|-----------|
| `registrarSinistro(...)` | Registra um sinistro contra uma apólice |

### Funções de Consulta (gratuitas — view)

| Função | Descrição |
|--------|-----------|
| `consultarApolice(id)` | Retorna todos os dados de uma apólice |
| `saldoDisponivel(id)` | Saldo restante para indenizações (wei) |
| `estaVigente(id, data)` | Verifica vigência em uma data específica |
| `listarApolicesProprietario(wallet)` | Lista IDs de apólices de um endereço |
| `listarSinistrosApolice(id)` | Lista IDs de sinistros de uma apólice |

---

## 📐 Regras de Negócio

### Emissão de Apólice

| Regra | Detalhe |
|-------|---------|
| Franquia máxima | ≤ 20% do valor segurado |
| Coberturas | Ao menos uma de: Colisão, Roubo, Incêndio |
| Vigência | `dataFim` deve ser posterior a `dataInicio` |
| Data de início | Não pode ser no passado |

### Análise de Sinistro

| Regra | Resultado |
|-------|-----------|
| Apólice não vigente na data do sinistro | ❌ REJEITADO |
| Cobertura não contratada | ❌ REJEITADO |
| Roubo (ROUBO) | Franquia = 0 (zerada automaticamente) |
| Perda total (valor ≥ 75% do segurado) | Franquia = 0 (zerada automaticamente) |
| Valor solicitado ≤ franquia | ❌ REJEITADO |
| Indenização excede saldo disponível | ❌ REJEITADO |
| Todos os critérios atendidos | ✅ APROVADO |

### Fórmulas

```
Indenização = Valor Solicitado − Franquia Aplicada
Saldo Disponível = Valor Segurado − Valor Comprometido
Franquia Máxima = Valor Segurado × 20%
Perda Total = Valor Solicitado ≥ Valor Segurado × 75%
```

---

## 🔐 Segurança

- Apenas o owner (seguradora) pode emitir apólices, analisar e pagar sinistros
- Apenas o proprietário da apólice pode registrar sinistros
- Regras de negócio são executadas on-chain (imutáveis e transparentes)
- Sem armazenamento de chaves privadas no código — use sempre `.env`

---

## 📜 Licença

MIT — veja o cabeçalho SPDX em cada arquivo `.sol`.
