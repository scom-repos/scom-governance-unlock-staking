/// <reference path="@scom/scom-dapp-container/@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@ijstech/eth-contract/index.d.ts" />
/// <amd-module name="@scom/scom-governance-unlock-staking/assets.ts" />
declare module "@scom/scom-governance-unlock-staking/assets.ts" {
    function fullPath(path: string): string;
    const _default: {
        fullPath: typeof fullPath;
    };
    export default _default;
}
/// <amd-module name="@scom/scom-governance-unlock-staking/store/core.ts" />
declare module "@scom/scom-governance-unlock-staking/store/core.ts" {
    export interface CoreAddress {
        GovToken: string;
        OAXDEX_Governance: string;
    }
    export const coreAddress: {
        [chainId: number]: CoreAddress;
    };
}
/// <amd-module name="@scom/scom-governance-unlock-staking/store/utils.ts" />
declare module "@scom/scom-governance-unlock-staking/store/utils.ts" {
    import { ERC20ApprovalModel, IERC20ApprovalEventOptions, INetwork } from "@ijstech/eth-wallet";
    import { ITokenObject } from "@scom/scom-token-list";
    export class State {
        infuraId: string;
        networkMap: {
            [key: number]: INetwork;
        };
        rpcWalletId: string;
        approvalModel: ERC20ApprovalModel;
        handleNextFlowStep: (data: any) => Promise<void>;
        handleAddTransactions: (data: any) => Promise<void>;
        handleJumpToStep: (data: any) => Promise<void>;
        handleUpdateStepStatus: (data: any) => Promise<void>;
        constructor(options: any);
        private initData;
        initRpcWallet(defaultChainId: number): string;
        getRpcWallet(): import("@ijstech/eth-wallet").IRpcWallet;
        isRpcWalletConnected(): boolean;
        getChainId(): number;
        private setNetworkList;
        setApprovalModelAction(options: IERC20ApprovalEventOptions): Promise<import("@ijstech/eth-wallet").IERC20ApprovalAction>;
        getAddresses(chainId?: number): import("@scom/scom-governance-unlock-staking/store/core.ts").CoreAddress;
        getGovToken(chainId: number): ITokenObject;
    }
    export function isClientWalletConnected(): boolean;
    export const getWETH: (chainId: number) => ITokenObject;
    export function formatNumber(value: number | string, decimalFigures?: number): string;
}
/// <amd-module name="@scom/scom-governance-unlock-staking/store/index.ts" />
declare module "@scom/scom-governance-unlock-staking/store/index.ts" {
    export * from "@scom/scom-governance-unlock-staking/store/utils.ts";
}
/// <amd-module name="@scom/scom-governance-unlock-staking/interface.ts" />
declare module "@scom/scom-governance-unlock-staking/interface.ts" {
    import { INetworkConfig } from "@scom/scom-network-picker";
    import { IWalletPlugin } from "@scom/scom-wallet-modal";
    export interface IGovernanceUnlockStaking extends IGovernanceUnlockStakingFlow {
        wallets: IWalletPlugin[];
        networks: INetworkConfig[];
        defaultChainId?: number;
        showHeader?: boolean;
    }
    interface IGovernanceUnlockStakingFlow {
        isFlow?: boolean;
        fromToken?: string;
        toToken?: string;
    }
}
/// <amd-module name="@scom/scom-governance-unlock-staking/data.json.ts" />
declare module "@scom/scom-governance-unlock-staking/data.json.ts" {
    const _default_1: {
        infuraId: string;
        networks: {
            chainId: number;
            explorerTxUrl: string;
            explorerAddressUrl: string;
        }[];
        defaultBuilderData: {
            defaultChainId: number;
            networks: {
                chainId: number;
            }[];
            wallets: {
                name: string;
            }[];
            showHeader: boolean;
            showFooter: boolean;
        };
    };
    export default _default_1;
}
/// <amd-module name="@scom/scom-governance-unlock-staking/formSchema.ts" />
declare module "@scom/scom-governance-unlock-staking/formSchema.ts" {
    import ScomNetworkPicker from '@scom/scom-network-picker';
    const _default_2: {
        dataSchema: {
            type: string;
            properties: {
                networks: {
                    type: string;
                    required: boolean;
                    items: {
                        type: string;
                        properties: {
                            chainId: {
                                type: string;
                                enum: number[];
                                required: boolean;
                            };
                        };
                    };
                };
            };
        };
        uiSchema: {
            type: string;
            elements: {
                type: string;
                scope: string;
                options: {
                    detail: {
                        type: string;
                    };
                };
            }[];
        };
        customControls(): {
            '#/properties/networks/properties/chainId': {
                render: () => ScomNetworkPicker;
                getData: (control: ScomNetworkPicker) => number;
                setData: (control: ScomNetworkPicker, value: number) => void;
            };
        };
    };
    export default _default_2;
}
/// <amd-module name="@scom/scom-governance-unlock-staking/api.ts" />
declare module "@scom/scom-governance-unlock-staking/api.ts" {
    import { BigNumber } from "@ijstech/eth-wallet";
    import { State } from "@scom/scom-governance-unlock-staking/store/index.ts";
    export const stakeOf: (state: State, address: string) => Promise<BigNumber>;
    export function getGovState(state: State): Promise<{
        lockTill: number;
        freezeStakeAmount: string;
        freezeStakeTimestamp: number;
    }>;
    export function getMinOaxTokenToCreateVote(state: State): Promise<number>;
    export function doUnlockStake(state: State): Promise<import("@ijstech/eth-contract").TransactionReceipt>;
}
/// <amd-module name="@scom/scom-governance-unlock-staking" />
declare module "@scom/scom-governance-unlock-staking" {
    import { ControlElement, Module, Container } from '@ijstech/components';
    import { INetworkConfig } from '@scom/scom-network-picker';
    import { IWalletPlugin } from '@scom/scom-wallet-modal';
    import { IGovernanceUnlockStaking } from "@scom/scom-governance-unlock-staking/interface.ts";
    interface ScomGovernanceUnlockStakingElement extends ControlElement {
        lazyLoad?: boolean;
        networks: INetworkConfig[];
        wallets: IWalletPlugin[];
        defaultChainId?: number;
        showHeader?: boolean;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-governance-unlock-staking']: ScomGovernanceUnlockStakingElement;
            }
        }
    }
    export default class ScomGovernanceUnlockStaking extends Module {
        private dappContainer;
        private loadingElm;
        private lblFreezedStake;
        private lblAvailVotingBalance;
        private btnUnlock;
        private txStatusModal;
        private mdWallet;
        private freezedStake;
        private state;
        private _data;
        tag: any;
        private get chainId();
        get defaultChainId(): number;
        get wallets(): IWalletPlugin[];
        set wallets(value: IWalletPlugin[]);
        get networks(): INetworkConfig[];
        set networks(value: INetworkConfig[]);
        get showHeader(): boolean;
        set showHeader(value: boolean);
        private get isUnlockVotingBalanceDisabled();
        constructor(parent?: Container, options?: ControlElement);
        removeRpcWalletEvents(): void;
        onHide(): void;
        isEmptyData(value: IGovernanceUnlockStaking): boolean;
        init(): Promise<void>;
        private _getActions;
        private getProjectOwnerActions;
        getConfigurators(): ({
            name: string;
            target: string;
            getProxySelectors: (chainId: number) => Promise<any[]>;
            getActions: () => any[];
            getData: any;
            setData: (data: any) => Promise<void>;
            getTag: any;
            setTag: any;
        } | {
            name: string;
            target: string;
            getActions: any;
            getData: any;
            setData: (data: any) => Promise<void>;
            getTag: any;
            setTag: any;
            getProxySelectors?: undefined;
        } | {
            name: string;
            target: string;
            getData: () => Promise<{
                wallets: IWalletPlugin[];
                networks: INetworkConfig[];
                defaultChainId?: number;
                showHeader?: boolean;
                isFlow?: boolean;
                fromToken?: string;
                toToken?: string;
            }>;
            setData: (properties: IGovernanceUnlockStaking, linkParams?: Record<string, any>) => Promise<void>;
            getTag: any;
            setTag: any;
            getProxySelectors?: undefined;
            getActions?: undefined;
        })[];
        private getData;
        private setData;
        getTag(): Promise<any>;
        private updateTag;
        private setTag;
        private resetRpcWallet;
        private refreshUI;
        private initWallet;
        private initializeWidgetConfig;
        private showResultMessage;
        private connectWallet;
        private onAddVotingBalance;
        render(): any;
    }
}
