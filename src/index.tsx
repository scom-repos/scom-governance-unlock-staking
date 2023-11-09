import {
    application,
    Button,
    ControlElement,
    customElements,
    Label,
    Module,
    Panel,
    Styles,
    moment,
    Container,
    Control,
    FormatUtils
} from '@ijstech/components';
import ScomDappContainer from '@scom/scom-dapp-container';
import { INetworkConfig } from '@scom/scom-network-picker';
import ScomWalletModal, { IWalletPlugin } from '@scom/scom-wallet-modal';
import ScomTxStatusModal from '@scom/scom-tx-status-modal';
import { BigNumber, Constants, Utils, Wallet } from '@ijstech/eth-wallet';
import Assets from './assets';
import { formatNumber, isClientWalletConnected, State } from './store/index';
import { IGovernanceUnlockStaking } from './interface';
import configData from './data.json';
import formSchema from './formSchema';
import { doUnlockStake, getGovState, getMinOaxTokenToCreateVote, stakeOf } from './api';
import ScomGovernanceUnlockStakingFlowInitialSetup from './flow/initialSetup';

const Theme = Styles.Theme.ThemeVars;

interface ScomGovernanceUnlockStakingElement extends ControlElement {
    lazyLoad?: boolean;
    networks: INetworkConfig[];
    wallets: IWalletPlugin[];
    defaultChainId?: number;
    showHeader?: boolean;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-governance-unlock-staking']: ScomGovernanceUnlockStakingElement;
        }
    }
}

@customElements('i-scom-governance-unlock-staking')
export default class ScomGovernanceUnlockStaking extends Module {
    private dappContainer: ScomDappContainer;
    private loadingElm: Panel;
    private lblFreezedStake: Label;
    private lblAvailVotingBalance: Label;
    private btnUnlock: Button;
    private txStatusModal: ScomTxStatusModal;
    private mdWallet: ScomWalletModal;
    private freezedStake: any = {};
    private state: State;
    private _data: IGovernanceUnlockStaking = {
        networks: [],
        wallets: []
    };
    tag: any = {};

    private get chainId() {
        return this.state.getChainId();
    }

    get defaultChainId() {
        return this._data.defaultChainId;
    }

    get wallets() {
        return this._data.wallets ?? [];
    }
    set wallets(value: IWalletPlugin[]) {
        this._data.wallets = value;
    }

    get networks() {
        return this._data.networks ?? [];
    }
    set networks(value: INetworkConfig[]) {
        this._data.networks = value;
    }

    get showHeader() {
        return this._data.showHeader ?? true;
    }
    set showHeader(value: boolean) {
        this._data.showHeader = value;
    }

    private get isUnlockVotingBalanceDisabled() {
        return new BigNumber(this.freezedStake.amount).eq(0) || this.freezedStake.timestamp == 0 || moment(this.freezedStake.lockTill).isAfter(new Date());
    }

    constructor(parent?: Container, options?: ControlElement) {
        super(parent, options);
        this.state = new State(configData);
    }

    removeRpcWalletEvents() {
        const rpcWallet = this.state.getRpcWallet();
        if (rpcWallet) rpcWallet.unregisterAllWalletEvents();
    }

    onHide() {
        this.dappContainer.onHide();
        this.removeRpcWalletEvents();
    }

    isEmptyData(value: IGovernanceUnlockStaking) {
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
            const data: IGovernanceUnlockStaking = {
                networks,
                wallets,
                defaultChainId,
                showHeader
            }
            if (!this.isEmptyData(data)) {
                await this.setData(data);
            }
        }
        this.loadingElm.visible = false;
        this.isReadyCallbackQueued = false;
        this.executeReadyCallback();
    }

    private _getActions(category?: string) {
        const actions: any[] = [];
        if (category && category !== 'offers') {
            actions.push({
                name: 'Edit',
                icon: 'edit',
                command: (builder: any, userInputData: any) => {
                    let oldData: IGovernanceUnlockStaking = {
                        wallets: [],
                        networks: []
                    };
                    let oldTag = {};
                    return {
                        execute: () => {
                            oldData = JSON.parse(JSON.stringify(this._data));
                            const { networks } = userInputData;
                            const themeSettings = {};;
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
                    }
                },
                userInputDataSchema: formSchema.dataSchema,
                userInputUISchema: formSchema.uiSchema,
                customControls: formSchema.customControls()
            });
        }
        return actions;
    }

    private getProjectOwnerActions() {
        const actions: any[] = [
            {
                name: 'Settings',
                userInputDataSchema: formSchema.dataSchema,
                userInputUISchema: formSchema.uiSchema,
                customControls: formSchema.customControls()
            }
        ];
        return actions;
    }

    getConfigurators() {
        return [
            {
                name: 'Project Owner Configurator',
                target: 'Project Owners',
                getProxySelectors: async (chainId: number) => {
                    return [];
                },
                getActions: () => {
                    return this.getProjectOwnerActions();
                },
                getData: this.getData.bind(this),
                setData: async (data: any) => {
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
                setData: async (data: any) => {
                    const defaultData = configData.defaultBuilderData;
                    await this.setData({ ...defaultData, ...data });
                },
                getTag: this.getTag.bind(this),
                setTag: this.setTag.bind(this)
            },
            {
                name: 'Embedder Configurator',
                target: 'Embedders',
                getData: async () => {
                    return { ...this._data }
                },
                setData: async (properties: IGovernanceUnlockStaking, linkParams?: Record<string, any>) => {
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

    private getData() {
        return this._data;
    }

    private async setData(data: IGovernanceUnlockStaking) {
        this._data = data;
        this.resetRpcWallet();
        await this.refreshUI();
    }

    async getTag() {
        return this.tag;
    }

    private updateTag(type: 'light' | 'dark', value: any) {
        this.tag[type] = this.tag[type] ?? {};
        for (let prop in value) {
            if (value.hasOwnProperty(prop))
                this.tag[type][prop] = value[prop];
        }
    }

    private setTag(value: any) {
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

    private resetRpcWallet() {
        this.removeRpcWalletEvents();
        const rpcWalletId = this.state.initRpcWallet(this.defaultChainId);
        const rpcWallet = this.state.getRpcWallet();
        const chainChangedEvent = rpcWallet.registerWalletEvent(this, Constants.RpcWalletEvent.ChainChanged, async (chainId: number) => {
            this.refreshUI();
        });
        const connectedEvent = rpcWallet.registerWalletEvent(this, Constants.RpcWalletEvent.Connected, async (connected: boolean) => {
            this.refreshUI();
        });
        const data: any = {
            defaultChainId: this.defaultChainId,
            wallets: this.wallets,
            networks: this.networks,
            showHeader: this.showHeader,
            rpcWalletId: rpcWallet.instanceId
        };
        if (this.dappContainer?.setData) this.dappContainer.setData(data);
    }

    private async refreshUI() {
        await this.initializeWidgetConfig();
    }

    private initWallet = async () => {
        try {
            await Wallet.getClientInstance().init();
            const rpcWallet = this.state.getRpcWallet();
            await rpcWallet.init();
        } catch (err) {
            console.log(err);
        }
    }

    private initializeWidgetConfig = async () => {
        setTimeout(async () => {
            await this.initWallet();
            const connected = isClientWalletConnected();
            if (!connected || !this.state.isRpcWalletConnected()) {
                this.btnUnlock.caption = connected ? "Switch Network" : "Connect Wallet";
                this.btnUnlock.enabled = true;
            } else {
                const govState = await getGovState(this.state);
                this.freezedStake = {
                    amount: govState.freezeStakeAmount,
                    lockTill: govState.lockTill,
                    timestamp: govState.freezeStakeTimestamp
                };
                this.btnUnlock.caption = "Unlock";
                this.btnUnlock.enabled = !this.isUnlockVotingBalanceDisabled;
                let diff = this.freezedStake.lockTill - Date.now();
                if (new BigNumber(this.freezedStake.amount).gt(0) && diff > 0) {
                    setTimeout(() => {
                        this.btnUnlock.enabled = true;
                    }, diff);
                }
                this.lblFreezedStake.caption = formatNumber(this.freezedStake.amount);
                const availableStake = `${moment(govState.lockTill).format('DD MMM YYYY')} at ${moment(govState.lockTill).format(
                    'HH:mm',
                )}`;
                this.lblAvailVotingBalance.caption = !this.freezedStake || new BigNumber(this.freezedStake.amount).eq(0) ? 'Unavailable stake' : availableStake;
            }
        });
    }

    private showResultMessage = (status: 'warning' | 'success' | 'error', content?: string | Error) => {
        if (!this.txStatusModal) return;
        let params: any = { status };
        if (status === 'success') {
            params.txtHash = content;
        } else {
            params.content = content;
        }
        this.txStatusModal.message = { ...params };
        this.txStatusModal.showModal();
    }

    private connectWallet = async () => {
        if (!isClientWalletConnected()) {
            if (this.mdWallet) {
                await application.loadPackage('@scom/scom-wallet-modal', '*');
                this.mdWallet.networks = this.networks;
                this.mdWallet.wallets = this.wallets;
                this.mdWallet.showModal();
            }
            return;
        }
        if (!this.state.isRpcWalletConnected()) {
            const clientWallet = Wallet.getClientInstance();
            await clientWallet.switchNetwork(this.chainId);
        }
    }

    private getAddVoteBalanceErrMsg(err: any) {
        const processError = (err: any) => {
            if (err) {
                if (!err.code) {
                    try {
                        return JSON.parse(err.message.substr(err.message.indexOf('{')));
                    } catch (moreErr) {
                        err = { code: 777, message: "Unknown Error" };
                    }
                } else {
                    return err;
                }
            } else {
                return { code: 778, message: "Error is Empty" };
            }
        }
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
    
    private async onAddVotingBalance() {
        try {
            if (this.isUnlockVotingBalanceDisabled) return;
            if (!this.state.isRpcWalletConnected()) {
                this.connectWallet();
                return;
            }
            this.btnUnlock.rightIcon.spin = true;
            this.btnUnlock.rightIcon.visible = true;
            const token = this.state.getGovToken(this.chainId);
            const amount = Utils.toDecimals(this.freezedStake.amount, token.decimals).toString();
            const wallet = this.state.getRpcWallet();
            const receipt = await doUnlockStake(this.state);
            if (receipt) {
                if (this.state.handleUpdateStepStatus) {
                    this.state.handleUpdateStepStatus({
                        status: "Completed",
                        color: Theme.colors.success.main
                    });
                }
                if (this.state.handleAddTransactions) {
                    const timestamp = await wallet.getBlockTimestamp(receipt.blockNumber.toString());
                    const tokenAmount = FormatUtils.formatNumber(Utils.fromDecimals(amount, token.decimals).toFixed(), {
                        decimalFigures: 4
                    });
                    const transactionsInfoArr = [
                        {
                            desc: `Unlock ${token.symbol}`,
                            chainId: this.chainId,
                            fromToken: token,
                            toToken: null,
                            fromTokenAmount: amount,
                            toTokenAmount: '-',
                            hash: receipt.transactionHash,
                            timestamp,
                            value: `${tokenAmount} ${token.symbol}`
                        }
                    ];
                    this.state.handleAddTransactions({
                        list: transactionsInfoArr
                    });
                } else {
                    this.showResultMessage('success', receipt.transactionHash);
                }
                if (this.state.handleJumpToStep) {
                    this.state.handleJumpToStep({
                        widgetName: 'scom-governance-proposal',
                        executionProperties: {
                            fromToken: this._data.fromToken,
                            toToken: this._data.toToken,
                            customTokens: this._data.customTokens,
                            isFlow: true
                        }
                    })
                }
            }
            this.refreshUI();
        } catch (err) {
            console.error('unlockStake', err);
            let errMsg = this.getAddVoteBalanceErrMsg(err);
            this.showResultMessage('error', errMsg);
        }
        this.btnUnlock.rightIcon.spin = false;
        this.btnUnlock.rightIcon.visible = false;
    }

    render() {
        return (
            <i-scom-dapp-container id="dappContainer">
                <i-panel background={{ color: Theme.background.main }}>
                    <i-panel>
                        <i-vstack id="loadingElm" class="i-loading-overlay">
                            <i-vstack class="i-loading-spinner" horizontalAlignment="center" verticalAlignment="center">
                                <i-icon
                                    class="i-loading-spinner_icon"
                                    image={{ url: Assets.fullPath('img/loading.svg'), width: 36, height: 36 }}
                                />
                                <i-label
                                    caption="Loading..." font={{ color: '#FD4A4C', size: '1.5em' }}
                                    class="i-loading-spinner_text"
                                />
                            </i-vstack>
                        </i-vstack>
                        <i-vstack
                            width="100%"
                            height="100%"
                            maxWidth={440}
                            padding={{ top: "1rem", bottom: "1rem", left: "1rem", right: "1rem" }}
                            margin={{ left: "auto", right: "auto" }}
                            gap="1rem"
                        >
                            <i-hstack width="100%" horizontalAlignment="center" margin={{ top: "1rem", bottom: "1rem" }}>
                                <i-label caption="Unlock Your Voting Balance" font={{ size: "1rem", bold: true, color: Theme.text.third }}></i-label>
                            </i-hstack>
                            <i-vstack gap="1rem">
                                <i-hstack verticalAlignment="center" horizontalAlignment="space-between" gap="0.5rem">
                                    <i-label caption="Staked Balance Available to Add" font={{ size: "0.875rem" }}></i-label>
                                    <i-label
                                        id="lblFreezedStake"
                                        caption="-"
                                        font={{ size: "0.875rem" }}
                                        textOverflow="ellipsis" 
                                        overflow="hidden"
                                    ></i-label>
                                </i-hstack>
                            </i-vstack>
                            <i-hstack verticalAlignment="center" horizontalAlignment="space-between" gap="0.5rem">
                                <i-label caption="Voting Balance Available" font={{ size: '0.875rem' }}></i-label>
                                <i-label id="lblAvailVotingBalance" caption="-" font={{ size: '0.875rem' }}></i-label>
                            </i-hstack>
                            <i-hstack horizontalAlignment="center" verticalAlignment="center" margin={{ top: "1rem" }}>
                                <i-button
                                    id="btnUnlock"
                                    width={150}
                                    caption="Unlock"
                                    font={{ size: '1rem', weight: 600, color: '#ffff' }}
                                    lineHeight={1.5}
                                    background={{ color: Theme.background.gradient }}
                                    padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.75rem', right: '0.75rem' }}
                                    border={{ radius: '0.65rem' }}
                                    enabled={false}
                                    onClick={this.onAddVotingBalance.bind(this)}
                                ></i-button>
                            </i-hstack>
                        </i-vstack>
                    </i-panel>
                    <i-scom-tx-status-modal id="txStatusModal"></i-scom-tx-status-modal>
                    <i-scom-wallet-modal id="mdWallet" wallets={[]}></i-scom-wallet-modal>
                </i-panel>
            </i-scom-dapp-container>
        )
    }

    async handleFlowStage(target: Control, stage: string, options: any) {
        let widget;
        if (stage === 'initialSetup') {
            widget = new ScomGovernanceUnlockStakingFlowInitialSetup();
            target.appendChild(widget);
            await widget.ready();
            widget.state = this.state;
            await widget.handleFlowStage(target, stage, options);
        } else {
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

        return { widget }
    }
}