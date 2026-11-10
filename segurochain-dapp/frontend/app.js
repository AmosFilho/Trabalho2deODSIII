/**
 * SeguroChain dApp — app.js
 * Web3.js 4.x + MetaMask + Ethereum Sepolia
 *
 * Padrões Web3.js v4 importantes:
 *  - new Web3(window.ethereum)          → conecta ao provider injetado pelo MetaMask
 *  - contract.methods.fn().call()       → leitura (view/pure), sem gas, sem tx
 *  - contract.methods.fn().send({from}) → escrita, abre popup MetaMask, retorna receipt
 *  - web3.utils.toWei(valor, 'ether')   → converte ETH → wei (BigInt no v4)
 *  - web3.utils.fromWei(wei, 'ether')   → converte wei → ETH (string)
 *
 * ⚠️  IMPORTANTE: Preencha CONTRACT_ADDRESS e ABI após fazer o deploy no Remix/Hardhat!
 */

"use strict";

// =============================================================
// CONFIGURAÇÃO — preencher após o deploy
// =============================================================

/**
 * Endereço do contrato SeguroChain implantado na rede Sepolia.
 * Substitua pelo endereço real após o deploy via Remix IDE ou Hardhat.
 */
const CONTRACT_ADDRESS = "0xB8949d90b7A59bFB81efcC9E18A6AB36A32e7aA1";

/**
 * ABI do contrato SeguroChain.
 *
 * ⚠️  DEIXADO VAZIO INTENCIONALMENTE.
 *
 * Como obter a ABI:
 *   1. Compile o contrato no Remix IDE (ou via `npx hardhat compile`).
 *   2. No Remix: aba "Solidity Compiler" → botão "ABI" → copie o JSON.
 *   3. No Hardhat: arquivo gerado em `artifacts/contracts/SeguroChain.sol/SeguroChain.json`
 *                  → copie o campo `"abi": [...]`.
 *   4. Cole aqui substituindo o `[]` abaixo.
 *
 * Exemplo de entrada ABI:
 *   const ABI = [
 *     { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
 *     { "inputs": [...], "name": "emitirApolice", "outputs": [...], "type": "function" },
 *     ...
 *   ];
 */
const ABI = [[
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "analisarSinistro",
    "outputs": [
      {
        "internalType": "bool",
        "name": "aprovado",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "franquiaAplicada",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "valorIndenizacao",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "motivo",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "ApoliceAtivada",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "ApoliceCancelada",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "proprietario",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "modelo",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "placa",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "ano",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "valorSegurado",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "franquia",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "dataInicio",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "dataFim",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool[3]",
        "name": "coberturas",
        "type": "bool[3]"
      }
    ],
    "name": "ApoliceEmitida",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "ativarApolice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "cancelarApolice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_proprietario",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_modelo",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_placa",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_ano",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_valorSegurado",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_franquia",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_dataInicio",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_dataFim",
        "type": "uint256"
      },
      {
        "internalType": "bool[3]",
        "name": "_coberturas",
        "type": "bool[3]"
      }
    ],
    "name": "emitirApolice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "pagarSinistro",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_apoliceId",
        "type": "uint256"
      },
      {
        "internalType": "enum SeguroChain.TipoCobertura",
        "name": "_tipo",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "_valorSolicitado",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_data",
        "type": "uint256"
      }
    ],
    "name": "registrarSinistro",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "apoliceId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "aprovado",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "franquiaAplicada",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "valorIndenizacao",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "motivo",
        "type": "string"
      }
    ],
    "name": "SinistroAnalisado",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "apoliceId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "valorPago",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "proprietario",
        "type": "address"
      }
    ],
    "name": "SinistroPago",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "apoliceId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum SeguroChain.TipoCobertura",
        "name": "tipo",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "valorSolicitado",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "data",
        "type": "uint256"
      }
    ],
    "name": "SinistroRegistrado",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "apolices",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "proprietario",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "modelo",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "placa",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "ano",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "valorSegurado",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "franquia",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "dataInicio",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "dataFim",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "valorComprometido",
        "type": "uint256"
      },
      {
        "internalType": "enum SeguroChain.StatusApolice",
        "name": "status",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "apolicesDoProprietario",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "consultarApolice",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "proprietario",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "modelo",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "placa",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "ano",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "valorSegurado",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "franquia",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "dataInicio",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "dataFim",
            "type": "uint256"
          },
          {
            "internalType": "bool[3]",
            "name": "coberturas",
            "type": "bool[3]"
          },
          {
            "internalType": "uint256",
            "name": "valorComprometido",
            "type": "uint256"
          },
          {
            "internalType": "enum SeguroChain.StatusApolice",
            "name": "status",
            "type": "uint8"
          }
        ],
        "internalType": "struct SeguroChain.Apolice",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_data",
        "type": "uint256"
      }
    ],
    "name": "estaVigente",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_wallet",
        "type": "address"
      }
    ],
    "name": "listarApolicesProprietario",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_apoliceId",
        "type": "uint256"
      }
    ],
    "name": "listarSinistrosApolice",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PERCENTUAL_MAXIMO_FRANQUIA",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PERCENTUAL_PERDA_TOTAL",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "saldoDisponivel",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "sinistros",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "apoliceId",
        "type": "uint256"
      },
      {
        "internalType": "enum SeguroChain.TipoCobertura",
        "name": "tipo",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "valorSolicitado",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "data",
        "type": "uint256"
      },
      {
        "internalType": "enum SeguroChain.StatusSinistro",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "motivo",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "franquiaAplicada",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "valorIndenizacao",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "sinistrosDaApolice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalApolices",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSinistros",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]];

// ID da rede Sepolia
const SEPOLIA_CHAIN_ID = 11155111;

// =============================================================
// ESTADO GLOBAL
// =============================================================

let web3;         // instância Web3
let contract;     // instância do contrato
let conta;        // endereço MetaMask conectado

// =============================================================
// INICIALIZAÇÃO
// =============================================================

/**
 * Inicializa o Web3 e o contrato assim que a página carrega.
 * Verifica se o MetaMask está instalado.
 */
window.addEventListener("load", () => {
  if (typeof window.ethereum === "undefined") {
    log("❌ MetaMask não detectado. Instale a extensão MetaMask para usar este dApp.", "error");
    return;
  }

  // Web3.js v4: passa o provider do MetaMask diretamente
  web3 = new Web3(window.ethereum);

  // Instancia o contrato (leitura disponível antes de conectar a carteira)
  if (ABI.length > 0 && CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
    contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
    document.getElementById("footer-address").textContent = CONTRACT_ADDRESS;
    log("✅ Contrato carregado: " + CONTRACT_ADDRESS, "success");
  } else {
    log("⚠️ ABI ou CONTRACT_ADDRESS não configurados. Edite app.js após o deploy.", "warn");
  }

  // Escuta mudanças de conta no MetaMask → recarrega a página
  window.ethereum.on("accountsChanged", () => {
    log("🔄 Conta alterada — recarregando…", "info");
    window.location.reload();
  });

  // Escuta mudanças de rede no MetaMask → recarrega a página
  window.ethereum.on("chainChanged", () => {
    log("🔄 Rede alterada — recarregando…", "info");
    window.location.reload();
  });
});

// =============================================================
// SEÇÃO 1 · CONEXÃO COM METAMASK
// =============================================================

/**
 * Solicita acesso à carteira MetaMask via eth_requestAccounts.
 * Web3.js v4: window.ethereum.request() retorna uma Promise.
 */
async function conectar() {
  try {
    // Abre o popup do MetaMask para o usuário autorizar o acesso
    const contas = await window.ethereum.request({ method: "eth_requestAccounts" });
    conta = contas[0];

    // Lê o Chain ID atual (retorna string hexadecimal)
    const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
    const chainId = parseInt(chainIdHex, 16);

    // Atualiza a UI
    document.getElementById("txt-conta").textContent = conta;
    document.getElementById("txt-rede").textContent = `${chainId}`;
    document.getElementById("info-conexao").classList.remove("hidden");
    document.getElementById("btn-conectar").textContent = "✅ Conectado";
    document.getElementById("btn-conectar").disabled = true;

    // Alerta se não estiver na Sepolia
    const avisoRede = document.getElementById("aviso-rede");
    if (chainId !== SEPOLIA_CHAIN_ID) {
      avisoRede.classList.remove("hidden");
      log(`⚠️ Você está na rede Chain ID ${chainId}. Por favor, troque para Sepolia (11155111).`, "warn");
    } else {
      avisoRede.classList.add("hidden");
      log(`✅ Conectado como ${conta} na Sepolia.`, "success");
    }
  } catch (err) {
    log("❌ Erro ao conectar: " + (err.message || err), "error");
  }
}

// =============================================================
// SEÇÃO 2 · EMITIR APÓLICE (apenas owner)
// =============================================================

/**
 * Lê os campos do formulário e chama emitirApolice() no contrato.
 * web3.utils.toWei() converte o valor ETH → wei (string/BigInt no v4).
 * .send({ from }) abre o popup MetaMask para assinar a transação.
 */
async function emitirApolice() {
  if (!verificarPronto("result-emitir")) return;

  try {
    const proprietario   = document.getElementById("e-proprietario").value.trim();
    const modelo         = document.getElementById("e-modelo").value.trim();
    const placa          = document.getElementById("e-placa").value.trim();
    const ano            = parseInt(document.getElementById("e-ano").value);
    const valorEth       = document.getElementById("e-valor-segurado").value.trim();
    const franquiaEth    = document.getElementById("e-franquia").value.trim();
    const dataInicioStr  = document.getElementById("e-data-inicio").value;
    const dataFimStr     = document.getElementById("e-data-fim").value;
    const cobColisao     = document.getElementById("cob-colisao").checked;
    const cobRoubo       = document.getElementById("cob-roubo").checked;
    const cobIncendio    = document.getElementById("cob-incendio").checked;

    // Validações básicas no frontend
    if (!proprietario || !modelo || !placa || !ano || !valorEth || !dataInicioStr || !dataFimStr) {
      return mostrarResultado("result-emitir", "⚠️ Preencha todos os campos obrigatórios.", "warn");
    }
    if (!cobColisao && !cobRoubo && !cobIncendio) {
      return mostrarResultado("result-emitir", "⚠️ Selecione ao menos uma cobertura.", "warn");
    }

    // Converte ETH → wei usando Web3.js v4
    // toWei() aceita string; no v4 retorna BigInt
    const valorWei    = web3.utils.toWei(valorEth, "ether");
    const franquiaWei = web3.utils.toWei(franquiaEth || "0", "ether");

    // Converte datas para timestamps Unix (segundos)
    const dataInicio = Math.floor(new Date(dataInicioStr).getTime() / 1000);
    const dataFim    = Math.floor(new Date(dataFimStr).getTime() / 1000);

    // Array de coberturas: [COLISAO, ROUBO, INCENDIO]
    const coberturas = [cobColisao, cobRoubo, cobIncendio];

    log("⏳ Aguardando confirmação no MetaMask para emitir apólice…", "info");

    // .send() → transação — abre popup MetaMask
    const receipt = await contract.methods
      .emitirApolice(
        proprietario,
        modelo,
        placa,
        ano,
        valorWei,
        franquiaWei,
        dataInicio,
        dataFim,
        coberturas
      )
      .send({ from: conta });

    // Extrai o ID da apólice emitido pelo evento ApoliceEmitida
    const evento = receipt.events?.ApoliceEmitida;
    const novoId = evento?.returnValues?.id ?? "N/A";

    mostrarResultado(
      "result-emitir",
      `✅ Apólice #${novoId} emitida com sucesso!<br>
       Tx Hash: <a href="https://sepolia.etherscan.io/tx/${receipt.transactionHash}" target="_blank">${receipt.transactionHash}</a>`,
      "success"
    );
    log(`✅ Apólice #${novoId} emitida. Tx: ${receipt.transactionHash}`, "success");

  } catch (err) {
    const msg = err.message || String(err);
    mostrarResultado("result-emitir", "❌ Erro: " + msg, "error");
    log("❌ Erro ao emitir apólice: " + msg, "error");
  }
}

// =============================================================
// SEÇÃO 3 · CONSULTAR APÓLICE
// =============================================================

/**
 * Busca os dados de uma apólice pelo ID.
 * .call() → leitura gratuita (view), sem transação.
 */
async function consultarApolice() {
  if (!verificarPronto("result-consultar")) return;

  try {
    const id = parseInt(document.getElementById("c-apolice-id").value);
    if (!id || id < 1) {
      return mostrarResultado("result-consultar", "⚠️ Informe um ID válido.", "warn");
    }

    log(`⏳ Consultando apólice #${id}…`, "info");

    // .call() → leitura — retorna struct como objeto no Web3.js v4
    const a = await contract.methods.consultarApolice(id).call();

    // Consulta também o saldo disponível
    const saldo = await contract.methods.saldoDisponivel(id).call();

    // Preenche a tabela
    document.getElementById("d-id").textContent           = a.id.toString();
    document.getElementById("d-proprietario").textContent = a.proprietario;
    document.getElementById("d-modelo").textContent       = a.modelo;
    document.getElementById("d-placa").textContent        = a.placa;
    document.getElementById("d-ano").textContent          = a.ano.toString();
    document.getElementById("d-valor-segurado").textContent =
      web3.utils.fromWei(a.valorSegurado.toString(), "ether") + " ETH";
    document.getElementById("d-franquia").textContent =
      web3.utils.fromWei(a.franquia.toString(), "ether") + " ETH";

    const inicio = new Date(Number(a.dataInicio) * 1000).toLocaleDateString("pt-BR");
    const fim    = new Date(Number(a.dataFim)    * 1000).toLocaleDateString("pt-BR");
    document.getElementById("d-vigencia").textContent = `${inicio} → ${fim}`;

    // Coberturas: array bool[3]
    const nomes = ["Colisão", "Roubo", "Incêndio"];
    const cobAtivas = a.coberturas
      .map((c, i) => c ? nomes[i] : null)
      .filter(Boolean)
      .join(", ") || "Nenhuma";
    document.getElementById("d-coberturas").textContent = cobAtivas;

    document.getElementById("d-comprometido").textContent =
      web3.utils.fromWei(a.valorComprometido.toString(), "ether") + " ETH";
    document.getElementById("d-saldo").textContent =
      web3.utils.fromWei(saldo.toString(), "ether") + " ETH";

    // Status com badge colorido
    const statusNomes = ["PENDENTE", "ATIVA", "CANCELADA", "EXPIRADA"];
    const statusClasses = ["badge-yellow", "badge-green", "badge-red", "badge-gray"];
    const statusIdx = Number(a.status);
    document.getElementById("d-status").innerHTML =
      `<span class="badge ${statusClasses[statusIdx]}">${statusNomes[statusIdx]}</span>`;

    document.getElementById("result-consultar").classList.remove("hidden");
    log(`✅ Apólice #${id} carregada.`, "success");

  } catch (err) {
    const msg = err.message || String(err);
    mostrarResultado("result-consultar", "❌ Erro: " + msg, "error");
    log("❌ Erro ao consultar apólice: " + msg, "error");
  }
}

// =============================================================
// SEÇÃO 4 · REGISTRAR SINISTRO (segurado)
// =============================================================

/**
 * Registra um novo sinistro para a apólice informada.
 * Apenas o proprietário da apólice pode chamar esta função.
 */
async function registrarSinistro() {
  if (!verificarPronto("result-sinistro")) return;

  try {
    const apoliceId     = parseInt(document.getElementById("s-apolice-id").value);
    const tipo          = parseInt(document.getElementById("s-tipo").value);
    const valorEth      = document.getElementById("s-valor").value.trim();
    const dataStr       = document.getElementById("s-data").value;

    if (!apoliceId || !valorEth || !dataStr) {
      return mostrarResultado("result-sinistro", "⚠️ Preencha todos os campos.", "warn");
    }

    const valorWei = web3.utils.toWei(valorEth, "ether");
    const dataTs   = Math.floor(new Date(dataStr).getTime() / 1000);

    log(`⏳ Aguardando confirmação no MetaMask para registrar sinistro…`, "info");

    const receipt = await contract.methods
      .registrarSinistro(apoliceId, tipo, valorWei, dataTs)
      .send({ from: conta });

    const evento  = receipt.events?.SinistroRegistrado;
    const novoId  = evento?.returnValues?.id ?? "N/A";

    mostrarResultado(
      "result-sinistro",
      `✅ Sinistro #${novoId} registrado com sucesso!<br>
       Status: EM ANÁLISE<br>
       Tx: <a href="https://sepolia.etherscan.io/tx/${receipt.transactionHash}" target="_blank">${receipt.transactionHash}</a>`,
      "success"
    );
    log(`✅ Sinistro #${novoId} registrado. Tx: ${receipt.transactionHash}`, "success");

  } catch (err) {
    const msg = err.message || String(err);
    mostrarResultado("result-sinistro", "❌ Erro: " + msg, "error");
    log("❌ Erro ao registrar sinistro: " + msg, "error");
  }
}

// =============================================================
// SEÇÃO 5 · ANALISAR SINISTRO (owner)
// =============================================================

/**
 * Aciona a análise automática de um sinistro pelo contrato.
 * As regras de negócio (vigência, cobertura, franquia, saldo) são
 * verificadas on-chain. O resultado é capturado pelo evento SinistroAnalisado.
 */
async function analisarSinistro() {
  if (!verificarPronto("result-analisar")) return;

  try {
    const id = parseInt(document.getElementById("a-sinistro-id").value);
    if (!id || id < 1) {
      return mostrarResultado("result-analisar", "⚠️ Informe um ID válido.", "warn");
    }

    log(`⏳ Aguardando confirmação no MetaMask para analisar sinistro #${id}…`, "info");

    // analisarSinistro() é uma função de escrita (muda estado) que também
    // retorna valores. No Web3.js v4 usamos .send() e capturamos o evento.
    const receipt = await contract.methods
      .analisarSinistro(id)
      .send({ from: conta });

    // Captura os dados do evento SinistroAnalisado emitido pelo contrato
    const evento = receipt.events?.SinistroAnalisado;
    if (evento) {
      const rv            = evento.returnValues;
      const aprovado      = rv.aprovado;
      const franquia      = web3.utils.fromWei(rv.franquiaAplicada.toString(), "ether");
      const indenizacao   = web3.utils.fromWei(rv.valorIndenizacao.toString(), "ether");
      const motivo        = rv.motivo;

      const classe = aprovado ? "result-approved" : "result-rejected";
      const icone  = aprovado ? "✅" : "❌";

      mostrarResultado(
        "result-analisar",
        `<div class="${classe}">
          <strong>${icone} ${aprovado ? "APROVADO" : "REJEITADO"}</strong><br>
          Motivo: ${motivo}<br>
          Franquia Aplicada: ${franquia} ETH<br>
          Valor de Indenização: ${indenizacao} ETH
        </div>
        Tx: <a href="https://sepolia.etherscan.io/tx/${receipt.transactionHash}" target="_blank">${receipt.transactionHash}</a>`,
        aprovado ? "success" : "error"
      );
      log(`${icone} Sinistro #${id} ${aprovado ? "APROVADO" : "REJEITADO"}: ${motivo}`, aprovado ? "success" : "error");
    } else {
      mostrarResultado("result-analisar", "✅ Análise concluída. Verifique os eventos na transação.", "success");
    }

  } catch (err) {
    const msg = err.message || String(err);
    mostrarResultado("result-analisar", "❌ Erro: " + msg, "error");
    log("❌ Erro ao analisar sinistro: " + msg, "error");
  }
}

// =============================================================
// SEÇÃO 6 · PAGAR SINISTRO (owner)
// =============================================================

/**
 * Registra o pagamento de um sinistro aprovado.
 * Apenas o owner pode chamar esta função.
 */
async function pagarSinistro() {
  if (!verificarPronto("result-pagar")) return;

  try {
    const id = parseInt(document.getElementById("p-sinistro-id").value);
    if (!id || id < 1) {
      return mostrarResultado("result-pagar", "⚠️ Informe um ID válido.", "warn");
    }

    log(`⏳ Aguardando confirmação no MetaMask para registrar pagamento do sinistro #${id}…`, "info");

    const receipt = await contract.methods
      .pagarSinistro(id)
      .send({ from: conta });

    const evento = receipt.events?.SinistroPago;
    const valor  = evento
      ? web3.utils.fromWei(evento.returnValues.valorPago.toString(), "ether")
      : "N/A";

    mostrarResultado(
      "result-pagar",
      `✅ Pagamento do sinistro #${id} registrado!<br>
       Valor: ${valor} ETH<br>
       Tx: <a href="https://sepolia.etherscan.io/tx/${receipt.transactionHash}" target="_blank">${receipt.transactionHash}</a>`,
      "success"
    );
    log(`✅ Sinistro #${id} pago (${valor} ETH). Tx: ${receipt.transactionHash}`, "success");

  } catch (err) {
    const msg = err.message || String(err);
    mostrarResultado("result-pagar", "❌ Erro: " + msg, "error");
    log("❌ Erro ao pagar sinistro: " + msg, "error");
  }
}

// =============================================================
// UTILITÁRIOS
// =============================================================

/**
 * Verifica se o Web3, o contrato e a conta estão prontos para uso.
 * Exibe mensagem de erro no elemento indicado se algo estiver faltando.
 * @param {string} resultElId ID do elemento de resultado para exibir erros
 * @returns {boolean} true se tudo estiver pronto
 */
function verificarPronto(resultElId) {
  if (!web3) {
    mostrarResultado(resultElId, "❌ MetaMask não detectado.", "error");
    return false;
  }
  if (!contract) {
    mostrarResultado(resultElId, "❌ Contrato não configurado. Edite app.js com o CONTRACT_ADDRESS e ABI corretos.", "error");
    return false;
  }
  if (!conta) {
    mostrarResultado(resultElId, "⚠️ Conecte sua carteira MetaMask primeiro.", "warn");
    return false;
  }
  return true;
}

/**
 * Exibe uma mensagem de resultado em um elemento da página.
 * @param {string} elId     ID do elemento
 * @param {string} html     Conteúdo HTML da mensagem
 * @param {string} tipo     "success" | "error" | "warn" | "info"
 */
function mostrarResultado(elId, html, tipo = "info") {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = html;
  el.className = `result-box result-${tipo}`;
  el.classList.remove("hidden");
}

/**
 * Adiciona uma entrada ao log de atividade.
 * @param {string} msg  Mensagem
 * @param {string} tipo "success" | "error" | "warn" | "info"
 */
function log(msg, tipo = "info") {
  const logEl = document.getElementById("status-log");
  if (!logEl) return;

  const hora    = new Date().toLocaleTimeString("pt-BR");
  const entrada = document.createElement("p");
  entrada.className = `log-entry log-${tipo}`;
  entrada.textContent = `[${hora}] ${msg}`;

  // Insere no topo (mensagem mais recente primeiro)
  logEl.insertBefore(entrada, logEl.firstChild);
}

/** Limpa todas as entradas do log de atividade. */
function limparLog() {
  const logEl = document.getElementById("status-log");
  if (logEl) logEl.innerHTML = "";
}
