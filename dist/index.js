var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-governance-unlock-staking/assets.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let moduleDir = components_1.application.currentModuleDir;
    function fullPath(path) {
        if (path.indexOf('://') > 0)
            return path;
        return `${moduleDir}/${path}`;
    }
    exports.default = {
        fullPath
    };
});
define("@scom/scom-governance-unlock-staking/store/core.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.coreAddress = void 0;
    exports.coreAddress = {
        56: {
            GovToken: "0xb32aC3C79A94aC1eb258f3C830bBDbc676483c93",
            OAXDEX_Governance: "0x510a179AA399672e26e54Ed8Ce0e822cc9D0a98D",
        },
        97: {
            GovToken: "0x45eee762aaeA4e5ce317471BDa8782724972Ee19",
            OAXDEX_Governance: "0xDfC070E2dbDAdcf892aE2ed2E2C426aDa835c528",
        },
        137: {
            GovToken: "0x29E65d6f3e7a609E0138a1331D42D23159124B8E",
            OAXDEX_Governance: "0x5580B68478e714C02850251353Cc58B85D4033C3",
        },
        80001: {
            GovToken: "0xb0AF504638BDe5e53D6EaE1119dEd13411c35cF2",
            OAXDEX_Governance: "0x198b150E554F46aee505a7fb574F5D7895889772",
        },
        43113: {
            GovToken: "0x27eF998b96c9A66937DBAc38c405Adcd7fa5e7DB",
            OAXDEX_Governance: "0xC025b30e6D4cBe4B6978a1A71a86e6eCB9F87F92",
        },
        43114: {
            GovToken: "0x29E65d6f3e7a609E0138a1331D42D23159124B8E",
            OAXDEX_Governance: "0x845308010c3b699150cdd54dcf0e7c4b8653e6b2",
        },
        42161: {
            GovToken: "0x29E65d6f3e7a609E0138a1331D42D23159124B8E",
            OAXDEX_Governance: "0x5580B68478e714C02850251353Cc58B85D4033C3",
        },
        421613: {
            GovToken: "0x5580B68478e714C02850251353Cc58B85D4033C3",
            OAXDEX_Governance: "0x6f460B0Bf633E22503Efa460429B0Ab32d655B9D",
        },
    };
});
define("@scom/scom-governance-unlock-staking/store/utils.ts", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-network-list", "@scom/scom-token-list", "@scom/scom-governance-unlock-staking/store/core.ts"], function (require, exports, components_2, eth_wallet_1, scom_network_list_1, scom_token_list_1, core_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formatNumber = exports.getWETH = exports.isClientWalletConnected = exports.State = void 0;
    class State {
        constructor(options) {
            this.infuraId = '';
            this.networkMap = {};
            this.rpcWalletId = '';
            this.networkMap = (0, scom_network_list_1.default)();
            this.initData(options);
        }
        initData(options) {
            if (options.infuraId) {
                this.infuraId = options.infuraId;
            }
            if (options.networks) {
                this.setNetworkList(options.networks, options.infuraId);
            }
        }
        initRpcWallet(defaultChainId) {
            if (this.rpcWalletId) {
                return this.rpcWalletId;
            }
            const clientWallet = eth_wallet_1.Wallet.getClientInstance();
            const networkList = Object.values(components_2.application.store?.networkMap || []);
            const instanceId = clientWallet.initRpcWallet({
                networks: networkList,
                defaultChainId,
                infuraId: components_2.application.store?.infuraId,
                multicalls: components_2.application.store?.multicalls
            });
            this.rpcWalletId = instanceId;
            if (clientWallet.address) {
                const rpcWallet = eth_wallet_1.Wallet.getRpcWalletInstance(instanceId);
                rpcWallet.address = clientWallet.address;
            }
            return instanceId;
        }
        getRpcWallet() {
            return this.rpcWalletId ? eth_wallet_1.Wallet.getRpcWalletInstance(this.rpcWalletId) : null;
        }
        isRpcWalletConnected() {
            const wallet = this.getRpcWallet();
            return wallet?.isConnected;
        }
        getChainId() {
            const rpcWallet = this.getRpcWallet();
            return rpcWallet?.chainId;
        }
        setNetworkList(networkList, infuraId) {
            const wallet = eth_wallet_1.Wallet.getClientInstance();
            this.networkMap = {};
            const defaultNetworkList = (0, scom_network_list_1.default)();
            const defaultNetworkMap = defaultNetworkList.reduce((acc, cur) => {
                acc[cur.chainId] = cur;
                return acc;
            }, {});
            for (let network of networkList) {
                const networkInfo = defaultNetworkMap[network.chainId];
                if (!networkInfo)
                    continue;
                if (infuraId && network.rpcUrls && network.rpcUrls.length > 0) {
                    for (let i = 0; i < network.rpcUrls.length; i++) {
                        network.rpcUrls[i] = network.rpcUrls[i].replace(/{InfuraId}/g, infuraId);
                    }
                }
                this.networkMap[network.chainId] = {
                    ...networkInfo,
                    ...network
                };
                wallet.setNetworkInfo(this.networkMap[network.chainId]);
            }
        }
        async setApprovalModelAction(options) {
            const approvalOptions = {
                ...options,
                spenderAddress: ''
            };
            let wallet = this.getRpcWallet();
            this.approvalModel = new eth_wallet_1.ERC20ApprovalModel(wallet, approvalOptions);
            let approvalModelAction = this.approvalModel.getAction();
            return approvalModelAction;
        }
        getAddresses(chainId) {
            return core_1.coreAddress[chainId || this.getChainId()];
        }
        getGovToken(chainId) {
            let govToken;
            let address = this.getAddresses(chainId).GovToken;
            if (chainId == 43113 || chainId == 43114 || chainId == 42161 || chainId == 421613 || chainId == 80001 || chainId == 137) {
                govToken = { address: address, decimals: 18, symbol: "veOSWAP", name: 'Vote-escrowed OSWAP', chainId };
            }
            else {
                govToken = { address: address, decimals: 18, symbol: "OSWAP", name: 'OpenSwap', chainId };
            }
            return govToken;
        }
    }
    exports.State = State;
    function isClientWalletConnected() {
        const wallet = eth_wallet_1.Wallet.getClientInstance();
        return wallet.isConnected;
    }
    exports.isClientWalletConnected = isClientWalletConnected;
    const getWETH = (chainId) => {
        let wrappedToken = scom_token_list_1.WETHByChainId[chainId];
        return wrappedToken;
    };
    exports.getWETH = getWETH;
    function formatNumber(value, decimalFigures) {
        decimalFigures = decimalFigures || 4;
        const newValue = new eth_wallet_1.BigNumber(value).toFixed(decimalFigures);
        return components_2.FormatUtils.formatNumber(newValue, { decimalFigures: decimalFigures });
    }
    exports.formatNumber = formatNumber;
});
define("@scom/scom-governance-unlock-staking/store/index.ts", ["require", "exports", "@scom/scom-governance-unlock-staking/store/utils.ts"], function (require, exports, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-governance-unlock-staking/store/index.ts'/> 
    __exportStar(utils_1, exports);
});
define("@scom/scom-governance-unlock-staking/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("@scom/scom-governance-unlock-staking/data.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-governance-unlock-staking/data.json.ts'/> 
    exports.default = {
        "infuraId": "adc596bf88b648e2a8902bc9093930c5",
        "networks": [
            {
                "chainId": 97,
                "explorerTxUrl": "https://testnet.bscscan.com/tx/",
                "explorerAddressUrl": "https://testnet.bscscan.com/address/"
            },
            {
                "chainId": 43113,
                "explorerTxUrl": "https://testnet.snowtrace.io/tx/",
                "explorerAddressUrl": "https://testnet.snowtrace.io/address/"
            }
        ],
        "defaultBuilderData": {
            "defaultChainId": 43113,
            "networks": [
                {
                    "chainId": 43113
                },
                {
                    "chainId": 97
                }
            ],
            "wallets": [
                {
                    "name": "metamask"
                }
            ],
            "showHeader": true,
            "showFooter": true
        }
    };
});
define("@scom/scom-governance-unlock-staking/formSchema.ts", ["require", "exports", "@scom/scom-network-picker"], function (require, exports, scom_network_picker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const chainIds = [1, 56, 137, 250, 97, 80001, 43113, 43114, 42161, 421613];
    const networks = chainIds.map(v => { return { chainId: v }; });
    exports.default = {
        dataSchema: {
            type: 'object',
            properties: {
                networks: {
                    type: 'array',
                    required: true,
                    items: {
                        type: 'object',
                        properties: {
                            chainId: {
                                type: 'number',
                                enum: chainIds,
                                required: true
                            }
                        }
                    }
                },
            }
        },
        uiSchema: {
            type: 'VerticalLayout',
            elements: [
                {
                    type: 'Control',
                    scope: '#/properties/networks',
                    options: {
                        detail: {
                            type: 'VerticalLayout'
                        }
                    }
                }
            ]
        },
        customControls() {
            return {
                '#/properties/networks/properties/chainId': {
                    render: () => {
                        const networkPicker = new scom_network_picker_1.default(undefined, {
                            type: 'combobox',
                            networks
                        });
                        return networkPicker;
                    },
                    getData: (control) => {
                        return control.selectedNetwork?.chainId;
                    },
                    setData: (control, value) => {
                        control.setNetworkByChainId(value);
                    }
                }
            };
        }
    };
});
define("@scom/scom-governance-unlock-staking/api.ts", ["require", "exports", "@ijstech/eth-wallet", "@scom/oswap-openswap-contract"], function (require, exports, eth_wallet_2, oswap_openswap_contract_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.doUnlockStake = exports.getMinOaxTokenToCreateVote = exports.getGovState = exports.stakeOf = void 0;
    const govTokenDecimals = (state) => {
        const chainId = state.getChainId();
        return state.getGovToken(chainId).decimals || 18;
    };
    const stakeOf = async function (state, address) {
        const wallet = state.getRpcWallet();
        const chainId = state.getChainId();
        const gov = state.getAddresses(chainId).OAXDEX_Governance;
        const govContract = new oswap_openswap_contract_1.Contracts.OAXDEX_Governance(wallet, gov);
        let result = await govContract.stakeOf(address);
        result = eth_wallet_2.Utils.fromDecimals(result, govTokenDecimals(state));
        return result;
    };
    exports.stakeOf = stakeOf;
    const freezedStake = async function (state, address) {
        const wallet = state.getRpcWallet();
        const chainId = state.getChainId();
        const gov = state.getAddresses(chainId).OAXDEX_Governance;
        const govContract = new oswap_openswap_contract_1.Contracts.OAXDEX_Governance(wallet, gov);
        let result = await govContract.freezedStake(address);
        let minStakePeriod = await govContract.minStakePeriod();
        let newResult = {
            amount: eth_wallet_2.Utils.fromDecimals(result.amount, govTokenDecimals(state)),
            timestamp: result.timestamp.toNumber() * 1000,
            lockTill: (result.timestamp.toNumber() + minStakePeriod.toNumber()) * 1000
        };
        return newResult;
    };
    async function getGovState(state) {
        const wallet = state.getRpcWallet();
        const chainId = state.getChainId();
        const address = state.getAddresses(chainId).OAXDEX_Governance;
        if (address) {
            let freezeStakeResult = await freezedStake(state, wallet.account.address);
            const govStakeObject = {
                lockTill: freezeStakeResult.lockTill,
                freezeStakeAmount: freezeStakeResult.amount.toFixed(),
                freezeStakeTimestamp: freezeStakeResult.timestamp
            };
            return govStakeObject;
        }
        return null;
    }
    exports.getGovState = getGovState;
    async function getMinOaxTokenToCreateVote(state) {
        let result;
        const wallet = state.getRpcWallet();
        const chainId = state.getChainId();
        const address = state.getAddresses(chainId).OAXDEX_Governance;
        if (address) {
            const govContract = new oswap_openswap_contract_1.Contracts.OAXDEX_Governance(wallet, address);
            const params = await govContract.getVotingParams(eth_wallet_2.Utils.stringToBytes32('vote'));
            result = Number(eth_wallet_2.Utils.fromDecimals(params.minOaxTokenToCreateVote).toFixed());
        }
        return result;
    }
    exports.getMinOaxTokenToCreateVote = getMinOaxTokenToCreateVote;
    async function doUnlockStake(state) {
        const wallet = eth_wallet_2.Wallet.getClientInstance();
        const chainId = state.getChainId();
        const gov = state.getAddresses(chainId).OAXDEX_Governance;
        const govContract = new oswap_openswap_contract_1.Contracts.OAXDEX_Governance(wallet, gov);
        const receipt = await govContract.unlockStake();
        return receipt;
    }
    exports.doUnlockStake = doUnlockStake;
});
define("@scom/scom-governance-unlock-staking/flow/initialSetup.tsx", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-governance-unlock-staking/store/index.ts"], function (require, exports, components_3, eth_wallet_3, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_3.Styles.Theme.ThemeVars;
    let ScomGovernanceUnlockStakingFlowInitialSetup = class ScomGovernanceUnlockStakingFlowInitialSetup extends components_3.Module {
        constructor() {
            super(...arguments);
            this.walletEvents = [];
            this.handleClickStart = async () => {
                if (this.state.handleUpdateStepStatus) {
                    this.state.handleUpdateStepStatus({
                        status: "Completed",
                        color: Theme.colors.success.main
                    });
                }
                if (this.state.handleNextFlowStep)
                    this.state.handleNextFlowStep({
                        isInitialSetup: true,
                        tokenRequirements: this.tokenRequirements,
                        executionProperties: this.executionProperties
                    });
            };
        }
        get state() {
            return this._state;
        }
        set state(value) {
            this._state = value;
        }
        get rpcWallet() {
            return this.state.getRpcWallet();
        }
        get chainId() {
            return this.executionProperties.chainId || this.executionProperties.defaultChainId;
        }
        async resetRpcWallet() {
            await this.state.initRpcWallet(this.chainId);
        }
        async setData(value) {
            this.executionProperties = value.executionProperties;
            this.tokenRequirements = value.tokenRequirements;
            await this.resetRpcWallet();
            await this.initializeWidgetConfig();
        }
        async initWallet() {
            try {
                const rpcWallet = this.rpcWallet;
                await rpcWallet.init();
            }
            catch (err) {
                console.log(err);
            }
        }
        async initializeWidgetConfig() {
            const connected = (0, index_1.isClientWalletConnected)();
            this.updateConnectStatus(connected);
            await this.initWallet();
        }
        async connectWallet() {
            if (!(0, index_1.isClientWalletConnected)()) {
                if (this.mdWallet) {
                    await components_3.application.loadPackage('@scom/scom-wallet-modal', '*');
                    this.mdWallet.networks = this.executionProperties.networks;
                    this.mdWallet.wallets = this.executionProperties.wallets;
                    this.mdWallet.showModal();
                }
            }
        }
        updateConnectStatus(connected) {
            if (connected) {
                this.lblConnectedStatus.caption = 'Connected with ' + eth_wallet_3.Wallet.getClientInstance().address;
                this.btnConnectWallet.visible = false;
            }
            else {
                this.lblConnectedStatus.caption = 'Please connect your wallet first';
                this.btnConnectWallet.visible = true;
            }
        }
        registerEvents() {
            let clientWallet = eth_wallet_3.Wallet.getClientInstance();
            this.walletEvents.push(clientWallet.registerWalletEvent(this, eth_wallet_3.Constants.ClientWalletEvent.AccountsChanged, async (payload) => {
                const { account } = payload;
                let connected = !!account;
                this.updateConnectStatus(connected);
            }));
        }
        onHide() {
            let clientWallet = eth_wallet_3.Wallet.getClientInstance();
            for (let event of this.walletEvents) {
                clientWallet.unregisterWalletEvent(event);
            }
            this.walletEvents = [];
        }
        init() {
            super.init();
            this.registerEvents();
        }
        render() {
            return (this.$render("i-vstack", { gap: "1rem", padding: { top: 10, bottom: 10, left: 20, right: 20 } },
                this.$render("i-label", { caption: "Manage Stake" }),
                this.$render("i-vstack", { gap: "1rem" },
                    this.$render("i-label", { id: "lblConnectedStatus" }),
                    this.$render("i-hstack", null,
                        this.$render("i-button", { id: "btnConnectWallet", caption: 'Connect Wallet', font: { color: Theme.colors.primary.contrastText }, padding: { top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }, onClick: this.connectWallet.bind(this) })),
                    this.$render("i-hstack", { horizontalAlignment: 'center' },
                        this.$render("i-button", { id: "btnStart", caption: "Start", padding: { top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }, font: { color: Theme.colors.primary.contrastText, size: '1.5rem' }, onClick: this.handleClickStart }))),
                this.$render("i-scom-wallet-modal", { id: "mdWallet", wallets: [] })));
        }
        async handleFlowStage(target, stage, options) {
            let widget = this;
            if (!options.isWidgetConnected) {
                let properties = options.properties;
                let tokenRequirements = options.tokenRequirements;
                this.state.handleNextFlowStep = options.onNextStep;
                this.state.handleAddTransactions = options.onAddTransactions;
                this.state.handleJumpToStep = options.onJumpToStep;
                this.state.handleUpdateStepStatus = options.onUpdateStepStatus;
                await widget.setData({
                    executionProperties: properties,
                    tokenRequirements
                });
            }
            return { widget };
        }
    };
    ScomGovernanceUnlockStakingFlowInitialSetup = __decorate([
        (0, components_3.customElements)('i-scom-governance-unlock-staking-flow-initial-setup')
    ], ScomGovernanceUnlockStakingFlowInitialSetup);
    exports.default = ScomGovernanceUnlockStakingFlowInitialSetup;
});
define("@scom/scom-governance-unlock-staking", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-governance-unlock-staking/assets.ts", "@scom/scom-governance-unlock-staking/store/index.ts", "@scom/scom-governance-unlock-staking/data.json.ts", "@scom/scom-governance-unlock-staking/formSchema.ts", "@scom/scom-governance-unlock-staking/api.ts", "@scom/scom-governance-unlock-staking/flow/initialSetup.tsx"], function (require, exports, components_4, eth_wallet_4, assets_1, index_2, data_json_1, formSchema_1, api_1, initialSetup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_4.Styles.Theme.ThemeVars;
    let ScomGovernanceUnlockStaking = class ScomGovernanceUnlockStaking extends components_4.Module {
        get chainId() {
            return this.state.getChainId();
        }
        get defaultChainId() {
            return this._data.defaultChainId;
        }
        get wallets() {
            return this._data.wallets ?? [];
        }
        set wallets(value) {
            this._data.wallets = value;
        }
        get networks() {
            return this._data.networks ?? [];
        }
        set networks(value) {
            this._data.networks = value;
        }
        get showHeader() {
            return this._data.showHeader ?? true;
        }
        set showHeader(value) {
            this._data.showHeader = value;
        }
        get isUnlockVotingBalanceDisabled() {
            return new eth_wallet_4.BigNumber(this.freezedStake.amount).eq(0) || this.freezedStake.timestamp == 0 || (0, components_4.moment)(this.freezedStake.lockTill).isAfter(new Date());
        }
        constructor(parent, options) {
            super(parent, options);
            this.freezedStake = {};
            this._data = {
                networks: [],
                wallets: []
            };
            this.tag = {};
            this.initWallet = async () => {
                try {
                    await eth_wallet_4.Wallet.getClientInstance().init();
                    const rpcWallet = this.state.getRpcWallet();
                    await rpcWallet.init();
                }
                catch (err) {
                    console.log(err);
                }
            };
            this.initializeWidgetConfig = async () => {
                setTimeout(async () => {
                    await this.initWallet();
                    const connected = (0, index_2.isClientWalletConnected)();
                    if (!connected || !this.state.isRpcWalletConnected()) {
                        this.btnUnlock.caption = connected ? "Switch Network" : "Connect Wallet";
                        this.btnUnlock.enabled = true;
                    }
                    else {
                        const govState = await (0, api_1.getGovState)(this.state);
                        this.freezedStake = {
                            amount: govState.freezeStakeAmount,
                            lockTill: govState.lockTill,
                            timestamp: govState.freezeStakeTimestamp
                        };
                        this.btnUnlock.caption = "Unlock";
                        this.btnUnlock.enabled = !this.isUnlockVotingBalanceDisabled;
                        let diff = this.freezedStake.lockTill - Date.now();
                        if (new eth_wallet_4.BigNumber(this.freezedStake.amount).gt(0) && diff > 0) {
                            setTimeout(() => {
                                this.btnUnlock.enabled = true;
                            }, diff);
                        }
                        this.lblFreezedStake.caption = (0, index_2.formatNumber)(this.freezedStake.amount);
                        const availableStake = `${(0, components_4.moment)(govState.lockTill).format('DD MMM YYYY')} at ${(0, components_4.moment)(govState.lockTill).format('HH:mm')}`;
                        this.lblAvailVotingBalance.caption = !this.freezedStake || new eth_wallet_4.BigNumber(this.freezedStake.amount).eq(0) ? 'Unavailable stake' : availableStake;
                    }
                });
            };
            this.showResultMessage = (status, content) => {
                if (!this.txStatusModal)
                    return;
                let params = { status };
                if (status === 'success') {
                    params.txtHash = content;
                }
                else {
                    params.content = content;
                }
                this.txStatusModal.message = { ...params };
                this.txStatusModal.showModal();
            };
            this.connectWallet = async () => {
                if (!(0, index_2.isClientWalletConnected)()) {
                    if (this.mdWallet) {
                        await components_4.application.loadPackage('@scom/scom-wallet-modal', '*');
                        this.mdWallet.networks = this.networks;
                        this.mdWallet.wallets = this.wallets;
                        this.mdWallet.showModal();
                    }
                    return;
                }
                if (!this.state.isRpcWalletConnected()) {
                    const clientWallet = eth_wallet_4.Wallet.getClientInstance();
                    await clientWallet.switchNetwork(this.chainId);
                }
            };
            this.state = new index_2.State(data_json_1.default);
        }
        removeRpcWalletEvents() {
            const rpcWallet = this.state.getRpcWallet();
            if (rpcWallet)
                rpcWallet.unregisterAllWalletEvents();
        }
        onHide() {
            this.dappContainer.onHide();
            this.removeRpcWalletEvents();
        }
        isEmptyData(value) {
            return !value || !value.networks || value.networks.length === 0;
        }
        async init() {
            this.isReadyCallbackQueued = true;
            super.init();
            const lazyLoad = this.getAttribute('lazyLoad', true, false);
            if (!lazyLoad) {
                const networks = this.getAttribute('networks', true);
                const wallets = this.getAttribute('wallets', true);
                const defaultChainId = this.getAttribute('defaultChainId', true);
                const showHeader = this.getAttribute('showHeader', true);
                const data = {
                    networks,
                    wallets,
                    defaultChainId,
                    showHeader
                };
                if (!this.isEmptyData(data)) {
                    await this.setData(data);
                }
            }
            this.loadingElm.visible = false;
            this.isReadyCallbackQueued = false;
            this.executeReadyCallback();
        }
        _getActions(category) {
            const actions = [];
            if (category && category !== 'offers') {
                actions.push({
                    name: 'Edit',
                    icon: 'edit',
                    command: (builder, userInputData) => {
                        let oldData = {
                            wallets: [],
                            networks: []
                        };
                        let oldTag = {};
                        return {
                            execute: () => {
                                oldData = JSON.parse(JSON.stringify(this._data));
                                const { networks } = userInputData;
                                const themeSettings = {};
                                ;
                                this._data.networks = networks;
                                this._data.defaultChainId = this._data.networks[0].chainId;
                                this.resetRpcWallet();
                                this.refreshUI();
                                if (builder?.setData)
                                    builder.setData(this._data);
                                oldTag = JSON.parse(JSON.stringify(this.tag));
                                if (builder?.setTag)
                                    builder.setTag(themeSettings);
                                else
                                    this.setTag(themeSettings);
                                if (this.dappContainer)
                                    this.dappContainer.setTag(themeSettings);
                            },
                            undo: () => {
                                this._data = JSON.parse(JSON.stringify(oldData));
                                this.refreshUI();
                                if (builder?.setData)
                                    builder.setData(this._data);
                                this.tag = JSON.parse(JSON.stringify(oldTag));
                                if (builder?.setTag)
                                    builder.setTag(this.tag);
                                else
                                    this.setTag(this.tag);
                                if (this.dappContainer)
                                    this.dappContainer.setTag(this.tag);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: formSchema_1.default.dataSchema,
                    userInputUISchema: formSchema_1.default.uiSchema,
                    customControls: formSchema_1.default.customControls()
                });
            }
            return actions;
        }
        getProjectOwnerActions() {
            const actions = [
                {
                    name: 'Settings',
                    userInputDataSchema: formSchema_1.default.dataSchema,
                    userInputUISchema: formSchema_1.default.uiSchema,
                    customControls: formSchema_1.default.customControls()
                }
            ];
            return actions;
        }
        getConfigurators() {
            return [
                {
                    name: 'Project Owner Configurator',
                    target: 'Project Owners',
                    getProxySelectors: async (chainId) => {
                        return [];
                    },
                    getActions: () => {
                        return this.getProjectOwnerActions();
                    },
                    getData: this.getData.bind(this),
                    setData: async (data) => {
                        await this.setData(data);
                    },
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                },
                {
                    name: 'Builder Configurator',
                    target: 'Builders',
                    getActions: this._getActions.bind(this),
                    getData: this.getData.bind(this),
                    setData: async (data) => {
                        const defaultData = data_json_1.default.defaultBuilderData;
                        await this.setData({ ...defaultData, ...data });
                    },
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                },
                {
                    name: 'Embedder Configurator',
                    target: 'Embedders',
                    getData: async () => {
                        return { ...this._data };
                    },
                    setData: async (properties, linkParams) => {
                        let resultingData = {
                            ...properties
                        };
                        if (!properties.defaultChainId && properties.networks?.length) {
                            resultingData.defaultChainId = properties.networks[0].chainId;
                        }
                        await this.setData(resultingData);
                    },
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                }
            ];
        }
        getData() {
            return this._data;
        }
        async setData(data) {
            this._data = data;
            this.resetRpcWallet();
            await this.refreshUI();
        }
        async getTag() {
            return this.tag;
        }
        updateTag(type, value) {
            this.tag[type] = this.tag[type] ?? {};
            for (let prop in value) {
                if (value.hasOwnProperty(prop))
                    this.tag[type][prop] = value[prop];
            }
        }
        setTag(value) {
            const newValue = value || {};
            for (let prop in newValue) {
                if (newValue.hasOwnProperty(prop)) {
                    if (prop === 'light' || prop === 'dark')
                        this.updateTag(prop, newValue[prop]);
                    else
                        this.tag[prop] = newValue[prop];
                }
            }
            if (this.dappContainer)
                this.dappContainer.setTag(this.tag);
        }
        resetRpcWallet() {
            this.removeRpcWalletEvents();
            const rpcWalletId = this.state.initRpcWallet(this.defaultChainId);
            const rpcWallet = this.state.getRpcWallet();
            const chainChangedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_4.Constants.RpcWalletEvent.ChainChanged, async (chainId) => {
                this.refreshUI();
            });
            const connectedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_4.Constants.RpcWalletEvent.Connected, async (connected) => {
                this.refreshUI();
            });
            const data = {
                defaultChainId: this.defaultChainId,
                wallets: this.wallets,
                networks: this.networks,
                showHeader: this.showHeader,
                rpcWalletId: rpcWallet.instanceId
            };
            if (this.dappContainer?.setData)
                this.dappContainer.setData(data);
        }
        async refreshUI() {
            await this.initializeWidgetConfig();
        }
        getAddVoteBalanceErrMsg(err) {
            const processError = (err) => {
                if (err) {
                    if (!err.code) {
                        try {
                            return JSON.parse(err.message.substr(err.message.indexOf('{')));
                        }
                        catch (moreErr) {
                            err = { code: 777, message: "Unknown Error" };
                        }
                    }
                    else {
                        return err;
                    }
                }
                else {
                    return { code: 778, message: "Error is Empty" };
                }
            };
            let errorContent = '';
            err = processError(err);
            switch (err.message) {
                case 'Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!':
                    console.log('@Implement: A proper way handling this error');
                    break;
                case 'Govenence: Nothing to stake':
                    errorContent = 'You have nothing to stake';
                    break;
                case 'execution reverted: Governance: Freezed period not passed':
                    errorContent = 'Freezed period not passed';
                    break;
                case 'execution reverted: Governance: insufficient balance':
                    errorContent = 'Insufficient balance';
                    break;
                default:
                    switch (err.code) {
                        case 4001:
                            errorContent = 'Transaction rejected by the user.';
                            break;
                        case 3:
                            errorContent = 'Unlock value exceed locked fund';
                            break;
                        case 778: //custom error code: error is empty
                        case 777: //custom error code: err.code is undefined AND went error again while JSON.parse
                    }
            }
            return errorContent;
        }
        async onAddVotingBalance() {
            try {
                if (this.isUnlockVotingBalanceDisabled)
                    return;
                if (!this.state.isRpcWalletConnected()) {
                    this.connectWallet();
                    return;
                }
                this.btnUnlock.rightIcon.spin = true;
                this.btnUnlock.rightIcon.visible = true;
                const token = this.state.getGovToken(this.chainId);
                const amount = eth_wallet_4.Utils.toDecimals(this.freezedStake.amount, token.decimals).toString();
                const wallet = this.state.getRpcWallet();
                const receipt = await (0, api_1.doUnlockStake)(this.state);
                if (receipt) {
                    const minThreshold = await (0, api_1.getMinOaxTokenToCreateVote)(this.state);
                    const votingBalance = (await (0, api_1.stakeOf)(this.state, wallet.account.address)).toNumber();
                    if (this.state.handleUpdateStepStatus) {
                        const data = votingBalance >= minThreshold ?
                            {
                                status: "Completed",
                                color: Theme.colors.success.main
                            }
                            :
                                {
                                    status: "Pending to stake",
                                    color: Theme.colors.warning.main
                                };
                        this.state.handleUpdateStepStatus(data);
                    }
                    if (this.state.handleAddTransactions) {
                        const timestamp = await wallet.getBlockTimestamp(receipt.blockNumber.toString());
                        const transactionsInfoArr = [
                            {
                                desc: `Unlock ${token.symbol}`,
                                fromToken: token,
                                toToken: null,
                                fromTokenAmount: amount,
                                toTokenAmount: '-',
                                hash: receipt.transactionHash,
                                timestamp
                            }
                        ];
                        this.state.handleAddTransactions({
                            list: transactionsInfoArr
                        });
                    }
                    else {
                        this.showResultMessage('success', receipt.transactionHash);
                    }
                    if (votingBalance >= minThreshold && this.state.handleJumpToStep) {
                        this.state.handleJumpToStep({
                            widgetName: 'scom-governance-proposal',
                            executionProperties: {
                                fromToken: this._data.fromToken,
                                toToken: this._data.toToken,
                                isFlow: true
                            }
                        });
                    }
                }
                this.refreshUI();
            }
            catch (err) {
                console.error('unlockStake', err);
                let errMsg = this.getAddVoteBalanceErrMsg(err);
                this.showResultMessage('error', errMsg);
            }
            this.btnUnlock.rightIcon.spin = false;
            this.btnUnlock.rightIcon.visible = false;
        }
        render() {
            return (this.$render("i-scom-dapp-container", { id: "dappContainer" },
                this.$render("i-panel", { background: { color: Theme.background.main } },
                    this.$render("i-panel", null,
                        this.$render("i-vstack", { id: "loadingElm", class: "i-loading-overlay" },
                            this.$render("i-vstack", { class: "i-loading-spinner", horizontalAlignment: "center", verticalAlignment: "center" },
                                this.$render("i-icon", { class: "i-loading-spinner_icon", image: { url: assets_1.default.fullPath('img/loading.svg'), width: 36, height: 36 } }),
                                this.$render("i-label", { caption: "Loading...", font: { color: '#FD4A4C', size: '1.5em' }, class: "i-loading-spinner_text" }))),
                        this.$render("i-vstack", { width: "100%", height: "100%", maxWidth: 440, padding: { top: "1rem", bottom: "1rem", left: "1rem", right: "1rem" }, margin: { left: "auto", right: "auto" }, gap: "1rem" },
                            this.$render("i-hstack", { width: "100%", horizontalAlignment: "center", margin: { top: "1rem", bottom: "1rem" } },
                                this.$render("i-label", { caption: "Unlock Your Voting Balance", font: { size: "1rem", bold: true, color: Theme.text.third } })),
                            this.$render("i-vstack", { gap: "1rem" },
                                this.$render("i-hstack", { verticalAlignment: "center", horizontalAlignment: "space-between", gap: "0.5rem" },
                                    this.$render("i-label", { caption: "Staked Balance Available to Add", font: { size: "0.875rem" } }),
                                    this.$render("i-label", { id: "lblFreezedStake", caption: "-", font: { size: "0.875rem" }, textOverflow: "ellipsis", overflow: "hidden" }))),
                            this.$render("i-hstack", { verticalAlignment: "center", horizontalAlignment: "space-between", gap: "0.5rem" },
                                this.$render("i-label", { caption: "Voting Balance Available", font: { size: '0.875rem' } }),
                                this.$render("i-label", { id: "lblAvailVotingBalance", caption: "-", font: { size: '0.875rem' } })),
                            this.$render("i-hstack", { horizontalAlignment: "center", verticalAlignment: "center", margin: { top: "1rem" } },
                                this.$render("i-button", { id: "btnUnlock", width: 150, caption: "Unlock", font: { size: '1rem', weight: 600, color: '#ffff' }, lineHeight: 1.5, background: { color: Theme.background.gradient }, padding: { top: '0.5rem', bottom: '0.5rem', left: '0.75rem', right: '0.75rem' }, border: { radius: '0.65rem' }, enabled: false, onClick: this.onAddVotingBalance.bind(this) })))),
                    this.$render("i-scom-tx-status-modal", { id: "txStatusModal" }),
                    this.$render("i-scom-wallet-modal", { id: "mdWallet", wallets: [] }))));
        }
        async handleFlowStage(target, stage, options) {
            let widget;
            if (stage === 'initialSetup') {
                widget = new initialSetup_1.default();
                target.appendChild(widget);
                await widget.ready();
                widget.state = this.state;
                await widget.handleFlowStage(target, stage, options);
            }
            else {
                widget = this;
                if (!options.isWidgetConnected) {
                    target.appendChild(widget);
                    await widget.ready();
                }
                let properties = options.properties;
                let tag = options.tag;
                this.state.handleNextFlowStep = options.onNextStep;
                this.state.handleAddTransactions = options.onAddTransactions;
                this.state.handleJumpToStep = options.onJumpToStep;
                this.state.handleUpdateStepStatus = options.onUpdateStepStatus;
                await this.setData(properties);
                if (tag) {
                    this.setTag(tag);
                }
            }
            return { widget };
        }
    };
    ScomGovernanceUnlockStaking = __decorate([
        (0, components_4.customElements)('i-scom-governance-unlock-staking')
    ], ScomGovernanceUnlockStaking);
    exports.default = ScomGovernanceUnlockStaking;
});
