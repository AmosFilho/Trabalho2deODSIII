// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SeguroChain
/// @author Trabalho 2 — ODS III
/// @notice Contrato de seguro veicular descentralizado na rede Ethereum Sepolia.
///         A seguradora é o endereço que faz o deploy (owner). Os segurados
///         interagem por meio de carteiras MetaMask.
/// @dev    Solidity 0.8.20 — sem overflow, sem SafeMath necessário.
contract SeguroChain {

    // =========================================================
    // ENUMERAÇÕES
    // =========================================================

    /// @notice Tipos de cobertura disponíveis no seguro
    enum TipoCobertura { COLISAO, ROUBO, INCENDIO }

    /// @notice Ciclo de vida de uma apólice
    enum StatusApolice { PENDENTE, ATIVA, CANCELADA, EXPIRADA }

    /// @notice Ciclo de vida de um sinistro
    enum StatusSinistro { EM_ANALISE, APROVADO, REJEITADO, PAGO }

    // =========================================================
    // STRUCTS
    // =========================================================

    /// @notice Representa uma apólice de seguro veicular
    struct Apolice {
        uint256 id;
        address proprietario;       // carteira do segurado
        string  modelo;             // modelo/identificação do veículo
        string  placa;              // placa do veículo
        uint256 ano;                // ano de fabricação do veículo
        uint256 valorSegurado;      // valor máximo de indenização (em wei)
        uint256 franquia;           // valor da franquia (em wei)
        uint256 dataInicio;         // timestamp de início da vigência
        uint256 dataFim;            // timestamp de fim   da vigência
        bool[3] coberturas;         // [0]=COLISAO, [1]=ROUBO, [2]=INCENDIO
        uint256 valorComprometido;  // soma das indenizações aprovadas/pagas
        StatusApolice status;
    }

    /// @notice Representa um sinistro registrado contra uma apólice
    struct Sinistro {
        uint256 id;
        uint256 apoliceId;
        TipoCobertura  tipo;
        uint256 valorSolicitado;    // valor bruto pedido pelo segurado (em wei)
        uint256 data;               // timestamp do evento (sinistro)
        StatusSinistro status;
        string  motivo;             // motivo da decisão da análise
        uint256 franquiaAplicada;   // franquia descontada (pode ser 0)
        uint256 valorIndenizacao;   // valor líquido a pagar (valorSolicitado - franquia)
    }

    // =========================================================
    // VARIÁVEIS DE ESTADO
    // =========================================================

    /// @notice Endereço da seguradora (deployer)
    address public owner;

    /// @notice Contador de apólices emitidas (também serve de próximo ID)
    uint256 public totalApolices;

    /// @notice Contador de sinistros registrados (também serve de próximo ID)
    uint256 public totalSinistros;

    /// @notice Mapeamento ID → Apólice
    mapping(uint256 => Apolice) public apolices;

    /// @notice Mapeamento ID → Sinistro
    mapping(uint256 => Sinistro) public sinistros;

    /// @notice IDs de sinistros vinculados a cada apólice
    mapping(uint256 => uint256[]) public sinistrosDaApolice;

    /// @notice IDs de apólices vinculados a cada carteira
    mapping(address => uint256[]) public apolicesDoProprietario;

    // =========================================================
    // CONSTANTES DE REGRA DE NEGÓCIO
    // =========================================================

    /// @notice Percentual máximo da franquia em relação ao valor segurado (20%)
    uint256 public constant PERCENTUAL_MAXIMO_FRANQUIA = 20;

    /// @notice Percentual do valor segurado que caracteriza perda total (75%)
    uint256 public constant PERCENTUAL_PERDA_TOTAL = 75;

    // =========================================================
    // EVENTOS
    // =========================================================

    /// @notice Disparado quando uma nova apólice é emitida
    event ApoliceEmitida(
        uint256 indexed id,
        address indexed proprietario,
        string  modelo,
        string  placa,
        uint256 ano,
        uint256 valorSegurado,
        uint256 franquia,
        uint256 dataInicio,
        uint256 dataFim,
        bool[3] coberturas
    );

    /// @notice Disparado quando uma apólice muda para status ATIVA
    event ApoliceAtivada(uint256 indexed id);

    /// @notice Disparado quando uma apólice é cancelada
    event ApoliceCancelada(uint256 indexed id);

    /// @notice Disparado quando um sinistro é registrado pelo segurado
    event SinistroRegistrado(
        uint256 indexed id,
        uint256 indexed apoliceId,
        TipoCobertura   tipo,
        uint256 valorSolicitado,
        uint256 data
    );

    /// @notice Disparado quando a seguradora conclui a análise de um sinistro
    event SinistroAnalisado(
        uint256 indexed id,
        uint256 indexed apoliceId,
        bool    aprovado,
        uint256 franquiaAplicada,
        uint256 valorIndenizacao,
        string  motivo
    );

    /// @notice Disparado quando a indenização de um sinistro é paga
    event SinistroPago(
        uint256 indexed id,
        uint256 indexed apoliceId,
        uint256 valorPago,
        address indexed proprietario
    );

    // =========================================================
    // MODIFIERS
    // =========================================================

    /// @dev Restringe a chamada ao endereço da seguradora (owner)
    modifier apenasOwner() {
        require(msg.sender == owner, "Apenas a seguradora pode executar esta acao");
        _;
    }

    /// @dev Verifica se uma apólice com o ID fornecido existe
    modifier apoliceExiste(uint256 _id) {
        require(_id > 0 && _id <= totalApolices, "Apolice nao existe");
        _;
    }

    /// @dev Verifica se um sinistro com o ID fornecido existe
    modifier sinistroExiste(uint256 _id) {
        require(_id > 0 && _id <= totalSinistros, "Sinistro nao existe");
        _;
    }

    /// @dev Restringe a chamada ao proprietário da apólice informada
    modifier apenasDono(uint256 _apoliceId) {
        require(
            msg.sender == apolices[_apoliceId].proprietario,
            "Apenas o proprietario da apolice pode executar esta acao"
        );
        _;
    }

    // =========================================================
    // CONSTRUTOR
    // =========================================================

    /// @notice Inicializa o contrato definindo o deployer como seguradora (owner)
    constructor() {
        owner = msg.sender;
    }

    // =========================================================
    // FUNÇÕES DA SEGURADORA — APÓLICES
    // =========================================================

    /// @notice Emite uma nova apólice de seguro veicular.
    ///         Apenas a seguradora (owner) pode chamar esta função.
    /// @param _proprietario  Endereço da carteira do segurado
    /// @param _modelo        Modelo/identificação do veículo
    /// @param _placa         Placa do veículo
    /// @param _ano           Ano de fabricação do veículo
    /// @param _valorSegurado Valor máximo de indenização (em wei)
    /// @param _franquia      Valor da franquia (em wei)
    /// @param _dataInicio    Timestamp de início da vigência
    /// @param _dataFim       Timestamp de fim da vigência
    /// @param _coberturas    Array de coberturas: [COLISAO, ROUBO, INCENDIO]
    /// @return               ID da apólice criada
    function emitirApolice(
        address _proprietario,
        string  calldata _modelo,
        string  calldata _placa,
        uint256 _ano,
        uint256 _valorSegurado,
        uint256 _franquia,
        uint256 _dataInicio,
        uint256 _dataFim,
        bool[3] calldata _coberturas
    )
        external
        apenasOwner
        returns (uint256)
    {
        // --- Validações básicas ---
        require(_proprietario != address(0),          "Proprietario invalido");
        require(bytes(_modelo).length > 0,            "Modelo obrigatorio");
        require(bytes(_placa).length > 0,             "Placa obrigatoria");
        require(_ano > 1900 && _ano <= 2100,          "Ano invalido");
        require(_valorSegurado > 0,                   "Valor segurado deve ser maior que zero");
        require(_dataFim > _dataInicio,               "Data fim deve ser posterior a data inicio");
        require(_dataInicio >= block.timestamp,       "Data inicio nao pode ser no passado");

        // --- Regra: franquia não pode exceder PERCENTUAL_MAXIMO_FRANQUIA% do valor segurado ---
        uint256 franquiaMaxima = (_valorSegurado * PERCENTUAL_MAXIMO_FRANQUIA) / 100;
        require(_franquia <= franquiaMaxima, "Franquia excede o limite de 20% do valor segurado");

        // --- Pelo menos uma cobertura deve ser contratada ---
        require(
            _coberturas[0] || _coberturas[1] || _coberturas[2],
            "Ao menos uma cobertura deve ser selecionada"
        );

        // --- Criação ---
        uint256 novoId = totalApolices + 1;
        totalApolices  = novoId;

        apolices[novoId] = Apolice({
            id:               novoId,
            proprietario:     _proprietario,
            modelo:           _modelo,
            placa:            _placa,
            ano:              _ano,
            valorSegurado:    _valorSegurado,
            franquia:         _franquia,
            dataInicio:       _dataInicio,
            dataFim:          _dataFim,
            coberturas:       _coberturas,
            valorComprometido: 0,
            status:           StatusApolice.ATIVA
        });

        apolicesDoProprietario[_proprietario].push(novoId);

        emit ApoliceEmitida(
            novoId,
            _proprietario,
            _modelo,
            _placa,
            _ano,
            _valorSegurado,
            _franquia,
            _dataInicio,
            _dataFim,
            _coberturas
        );

        return novoId;
    }

    /// @notice Ativa uma apólice que estava pendente.
    /// @param _id ID da apólice
    function ativarApolice(uint256 _id)
        external
        apenasOwner
        apoliceExiste(_id)
    {
        require(
            apolices[_id].status == StatusApolice.PENDENTE,
            "Apenas apolices PENDENTE podem ser ativadas"
        );
        apolices[_id].status = StatusApolice.ATIVA;
        emit ApoliceAtivada(_id);
    }

    /// @notice Cancela uma apólice ativa ou pendente.
    /// @param _id ID da apólice
    function cancelarApolice(uint256 _id)
        external
        apenasOwner
        apoliceExiste(_id)
    {
        require(
            apolices[_id].status == StatusApolice.ATIVA ||
            apolices[_id].status == StatusApolice.PENDENTE,
            "Apolice nao pode ser cancelada neste estado"
        );
        apolices[_id].status = StatusApolice.CANCELADA;
        emit ApoliceCancelada(_id);
    }

    // =========================================================
    // FUNÇÕES DE CONSULTA — APÓLICES
    // =========================================================

    /// @notice Retorna todos os dados de uma apólice.
    /// @param _id ID da apólice
    /// @return Struct Apolice completa
    function consultarApolice(uint256 _id)
        external
        view
        apoliceExiste(_id)
        returns (Apolice memory)
    {
        return apolices[_id];
    }

    /// @notice Retorna o saldo disponível para novas indenizações na apólice.
    ///         saldo = valorSegurado - valorComprometido
    /// @param _id ID da apólice
    /// @return Saldo em wei (0 se esgotado)
    function saldoDisponivel(uint256 _id)
        external
        view
        apoliceExiste(_id)
        returns (uint256)
    {
        Apolice storage a = apolices[_id];
        if (a.valorComprometido >= a.valorSegurado) {
            return 0;
        }
        return a.valorSegurado - a.valorComprometido;
    }

    /// @notice Verifica se uma apólice está vigente em determinada data.
    ///         Vigente = status ATIVA e data dentro do intervalo [dataInicio, dataFim].
    /// @param _id   ID da apólice
    /// @param _data Timestamp a verificar
    /// @return true se vigente, false caso contrário
    function estaVigente(uint256 _id, uint256 _data)
        public
        view
        apoliceExiste(_id)
        returns (bool)
    {
        Apolice storage a = apolices[_id];
        return (
            a.status == StatusApolice.ATIVA &&
            _data >= a.dataInicio &&
            _data <= a.dataFim
        );
    }

    /// @notice Lista os IDs de todas as apólices de um proprietário.
    /// @param _wallet Endereço da carteira do segurado
    /// @return Array de IDs
    function listarApolicesProprietario(address _wallet)
        external
        view
        returns (uint256[] memory)
    {
        return apolicesDoProprietario[_wallet];
    }

    // =========================================================
    // FUNÇÕES DO SEGURADO — SINISTROS
    // =========================================================

    /// @notice Registra um sinistro contra uma apólice.
    ///         Apenas o proprietário da apólice pode chamar esta função.
    /// @param _apoliceId       ID da apólice
    /// @param _tipo            Tipo de cobertura (TipoCobertura)
    /// @param _valorSolicitado Valor bruto do dano alegado (em wei)
    /// @param _data            Timestamp do evento/sinistro
    /// @return                 ID do sinistro criado
    function registrarSinistro(
        uint256 _apoliceId,
        TipoCobertura _tipo,
        uint256 _valorSolicitado,
        uint256 _data
    )
        external
        apenasDono(_apoliceId)
        apoliceExiste(_apoliceId)
        returns (uint256)
    {
        require(_valorSolicitado > 0, "Valor solicitado deve ser maior que zero");
        require(_data > 0,            "Data do sinistro invalida");

        uint256 novoId     = totalSinistros + 1;
        totalSinistros     = novoId;

        sinistros[novoId] = Sinistro({
            id:               novoId,
            apoliceId:        _apoliceId,
            tipo:             _tipo,
            valorSolicitado:  _valorSolicitado,
            data:             _data,
            status:           StatusSinistro.EM_ANALISE,
            motivo:           "",
            franquiaAplicada: 0,
            valorIndenizacao: 0
        });

        sinistrosDaApolice[_apoliceId].push(novoId);

        emit SinistroRegistrado(novoId, _apoliceId, _tipo, _valorSolicitado, _data);

        return novoId;
    }

    // =========================================================
    // FUNÇÕES DA SEGURADORA — SINISTROS
    // =========================================================

    /// @notice Analisa um sinistro aplicando as regras de negócio.
    ///         Apenas a seguradora (owner) pode chamar esta função.
    ///
    ///         Regras de negócio:
    ///         1. A apólice deve estar vigente na data do sinistro.
    ///         2. O tipo de sinistro deve ter cobertura contratada.
    ///         3. Franquia é ZERO nos casos:
    ///            a) Tipo ROUBO
    ///            b) Perda total (valorSolicitado >= 75% do valorSegurado)
    ///            Nos demais casos aplica-se a franquia contratada.
    ///         4. O valor solicitado deve ser superior à franquia (quando > 0).
    ///         5. O valor da indenização não pode exceder o saldo disponível.
    ///
    /// @param _id ID do sinistro
    /// @return aprovado          true se aprovado
    /// @return franquiaAplicada  Valor da franquia descontada
    /// @return valorIndenizacao  Valor líquido a ser pago
    /// @return motivo            Descrição textual da decisão
    function analisarSinistro(uint256 _id)
        external
        apenasOwner
        sinistroExiste(_id)
        returns (
            bool    aprovado,
            uint256 franquiaAplicada,
            uint256 valorIndenizacao,
            string memory motivo
        )
    {
        Sinistro storage s = sinistros[_id];
        require(s.status == StatusSinistro.EM_ANALISE, "Sinistro ja foi analisado");

        Apolice storage a = apolices[s.apoliceId];

        // --- Regra 1: vigência ---
        if (!estaVigente(s.apoliceId, s.data)) {
            motivo            = "Apolice nao estava vigente na data do sinistro";
            aprovado          = false;
            franquiaAplicada  = 0;
            valorIndenizacao  = 0;
            s.status          = StatusSinistro.REJEITADO;
            s.motivo          = motivo;
            emit SinistroAnalisado(_id, s.apoliceId, false, 0, 0, motivo);
            return (aprovado, franquiaAplicada, valorIndenizacao, motivo);
        }

        // --- Regra 2: cobertura ---
        uint256 tipoIdx = uint256(s.tipo);
        if (!a.coberturas[tipoIdx]) {
            motivo            = string(abi.encodePacked(
                "Cobertura do tipo ", _toString(tipoIdx), " nao contratada"
            ));
            aprovado          = false;
            franquiaAplicada  = 0;
            valorIndenizacao  = 0;
            s.status          = StatusSinistro.REJEITADO;
            s.motivo          = motivo;
            emit SinistroAnalisado(_id, s.apoliceId, false, 0, 0, motivo);
            return (aprovado, franquiaAplicada, valorIndenizacao, motivo);
        }

        // --- Regra 3: calcular franquia ---
        bool perdaTotal = (s.valorSolicitado * 100) >= (a.valorSegurado * PERCENTUAL_PERDA_TOTAL);
        bool isRoubo    = (s.tipo == TipoCobertura.ROUBO);

        if (isRoubo || perdaTotal) {
            franquiaAplicada = 0;   // sem franquia para roubo ou perda total
        } else {
            franquiaAplicada = a.franquia;
        }

        // --- Regra 4: valor solicitado deve superar a franquia ---
        if (franquiaAplicada > 0 && s.valorSolicitado <= franquiaAplicada) {
            motivo = string(abi.encodePacked(
                "Valor solicitado (",
                _toString(s.valorSolicitado),
                " wei) nao supera a franquia (",
                _toString(franquiaAplicada),
                " wei)"
            ));
            aprovado         = false;
            valorIndenizacao = 0;
            s.status         = StatusSinistro.REJEITADO;
            s.motivo         = motivo;
            s.franquiaAplicada = franquiaAplicada;
            emit SinistroAnalisado(_id, s.apoliceId, false, franquiaAplicada, 0, motivo);
            return (aprovado, franquiaAplicada, valorIndenizacao, motivo);
        }

        // --- Calcular indenização líquida ---
        valorIndenizacao = s.valorSolicitado - franquiaAplicada;

        // --- Regra 5: saldo disponível ---
        uint256 saldo = a.valorSegurado > a.valorComprometido
            ? a.valorSegurado - a.valorComprometido
            : 0;

        if (valorIndenizacao > saldo) {
            motivo = string(abi.encodePacked(
                "Indenizacao (",
                _toString(valorIndenizacao),
                " wei) excede o saldo disponivel (",
                _toString(saldo),
                " wei)"
            ));
            aprovado         = false;
            valorIndenizacao = 0;
            s.status         = StatusSinistro.REJEITADO;
            s.motivo         = motivo;
            s.franquiaAplicada = franquiaAplicada;
            emit SinistroAnalisado(_id, s.apoliceId, false, franquiaAplicada, 0, motivo);
            return (aprovado, franquiaAplicada, valorIndenizacao, motivo);
        }

        // --- Aprovado ---
        aprovado = true;
        motivo   = perdaTotal
            ? "Aprovado — perda total (franquia zerada)"
            : isRoubo
                ? "Aprovado — roubo (franquia zerada)"
                : "Aprovado";

        s.status            = StatusSinistro.APROVADO;
        s.motivo            = motivo;
        s.franquiaAplicada  = franquiaAplicada;
        s.valorIndenizacao  = valorIndenizacao;
        a.valorComprometido += valorIndenizacao;

        emit SinistroAnalisado(_id, s.apoliceId, true, franquiaAplicada, valorIndenizacao, motivo);
        return (aprovado, franquiaAplicada, valorIndenizacao, motivo);
    }

    /// @notice Registra o pagamento de um sinistro aprovado.
    ///         Apenas a seguradora (owner) pode chamar esta função.
    ///         Nota: o pagamento real (transferência de ETH) é feito off-chain
    ///         ou via sistema da seguradora — este contrato apenas registra o estado.
    /// @param _id ID do sinistro
    function pagarSinistro(uint256 _id)
        external
        apenasOwner
        sinistroExiste(_id)
    {
        Sinistro storage s = sinistros[_id];
        require(s.status == StatusSinistro.APROVADO, "Sinistro deve estar APROVADO para ser pago");

        s.status = StatusSinistro.PAGO;

        address proprietario = apolices[s.apoliceId].proprietario;

        emit SinistroPago(_id, s.apoliceId, s.valorIndenizacao, proprietario);
    }

    // =========================================================
    // FUNÇÕES DE CONSULTA — SINISTROS
    // =========================================================

    /// @notice Lista os IDs de todos os sinistros de uma apólice.
    /// @param _apoliceId ID da apólice
    /// @return Array de IDs de sinistros
    function listarSinistrosApolice(uint256 _apoliceId)
        external
        view
        apoliceExiste(_apoliceId)
        returns (uint256[] memory)
    {
        return sinistrosDaApolice[_apoliceId];
    }

    // =========================================================
    // FUNÇÕES INTERNAS / AUXILIARES
    // =========================================================

    /// @dev Converte um uint256 para sua representação em string decimal.
    ///      Usado internamente para compor mensagens de motivo.
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";

        uint256 temp   = value;
        uint256 digits = 0;

        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);

        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(buffer);
    }
}
