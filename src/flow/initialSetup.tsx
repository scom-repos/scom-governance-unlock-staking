import {
    application,
    Button,
    Control,
    ControlElement,
    customElements,
    Label,
    Module,
    Styles
} from "@ijstech/components";
import { Constants, IEventBusRegistry, Wallet } from "@ijstech/eth-wallet";
import ScomWalletModal from "@scom/scom-wallet-modal";
import { isClientWalletConnected, State } from "../store/index";

const Theme = Styles.Theme.ThemeVars;

interface ScomGovernanceStakingFlowInitialSetupElement extends ControlElement {
    data?: any;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-governance-unlock-staking-flow-initial-setup']: ScomGovernanceStakingFlowInitialSetupElement;
        }
    }
}

@customElements('i-scom-governance-unlock-staking-flow-initial-setup')
export default class ScomGovernanceUnlockStakingFlowInitialSetup extends Module {
    private lblConnectedStatus: Label;
    private btnConnectWallet: Button;
    private mdWallet: ScomWalletModal;
    private _state: State;
    private tokenRequirements: any;
    private executionProperties: any;
    private walletEvents: IEventBusRegistry[] = [];

    get state(): State {
        return this._state;
    }
    set state(value: State) {
        this._state = value;
    }
    private get rpcWallet() {
        return this.state.getRpcWallet();
    }
    private get chainId() {
        return this.executionProperties.chainId || this.executionProperties.defaultChainId;
    }
    private async resetRpcWallet() {
        await this.state.initRpcWallet(this.chainId);
    }
    async setData(value: any) {
        this.executionProperties = value.executionProperties;
        this.tokenRequirements = value.tokenRequirements;
        await this.resetRpcWallet();
        await this.initializeWidgetConfig();
    }
    private async initWallet() {
        try {
            const rpcWallet = this.rpcWallet;
            await rpcWallet.init();
        } catch (err) {
            console.log(err);
        }
    }
    private async initializeWidgetConfig() {
        const connected = isClientWalletConnected();
        this.updateConnectStatus(connected);
        await this.initWallet();
    }
    async connectWallet() {
        if (!isClientWalletConnected()) {
            if (this.mdWallet) {
                await application.loadPackage('@scom/scom-wallet-modal', '*');
                this.mdWallet.networks = this.executionProperties.networks;
                this.mdWallet.wallets = this.executionProperties.wallets;
                this.mdWallet.showModal();
            }
        }
    }
    private updateConnectStatus(connected: boolean) {
        if (connected) {
            this.lblConnectedStatus.caption = 'Connected with ' + Wallet.getClientInstance().address;
            this.btnConnectWallet.visible = false;
        } else {
            this.lblConnectedStatus.caption = 'Please connect your wallet first';
            this.btnConnectWallet.visible = true;
        }
    }
    private registerEvents() {
        let clientWallet = Wallet.getClientInstance();
        this.walletEvents.push(clientWallet.registerWalletEvent(this, Constants.ClientWalletEvent.AccountsChanged, async (payload: Record<string, any>) => {
            const { account } = payload;
            let connected = !!account;
            this.updateConnectStatus(connected);
        }));
    }
    onHide() {
        let clientWallet = Wallet.getClientInstance();
        for (let event of this.walletEvents) {
            clientWallet.unregisterWalletEvent(event);
        }
        this.walletEvents = [];
    }
    init() {
        super.init();
        this.registerEvents();
    }
    private handleClickStart = async () => {
        if (this.state.handleUpdateStepStatus) {
            this.state.handleUpdateStepStatus({
                caption: "Completed",
                color: Theme.colors.success.main
            });
        }
        if (this.state.handleNextFlowStep)
            this.state.handleNextFlowStep({
                isInitialSetup: true,
                tokenRequirements: this.tokenRequirements,
                executionProperties: this.executionProperties
            });
    }
    render() {
        return (
            <i-vstack gap="1rem" padding={{ top: 10, bottom: 10, left: 20, right: 20 }}>
                <i-label caption="Manage Stake"></i-label>

                <i-vstack gap="1rem">
                    <i-label id="lblConnectedStatus"></i-label>
                    <i-hstack>
                        <i-button
                            id="btnConnectWallet"
                            caption='Connect Wallet'
                            font={{ color: Theme.colors.primary.contrastText }}
                            padding={{ top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }}
                            onClick={this.connectWallet.bind(this)}
                        ></i-button>
                    </i-hstack>
                    <i-hstack horizontalAlignment='center'>
                        <i-button
                            id="btnStart"
                            caption="Start"
                            padding={{ top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }}
                            font={{ color: Theme.colors.primary.contrastText, size: '1.5rem' }}
                            onClick={this.handleClickStart}
                        ></i-button>
                    </i-hstack>
                </i-vstack>
                <i-scom-wallet-modal id="mdWallet" wallets={[]} />
            </i-vstack>
        )
    }
    async handleFlowStage(target: Control, stage: string, options: any) {
        let widget: ScomGovernanceUnlockStakingFlowInitialSetup = this;
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
        return { widget }
    }
}