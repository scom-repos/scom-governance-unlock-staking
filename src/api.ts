import { BigNumber, Utils, Wallet } from "@ijstech/eth-wallet";
import { Contracts } from "@scom/oswap-openswap-contract";
import { State } from "./store/index";

const govTokenDecimals = (state: State) => {
    const chainId = state.getChainId();
    return state.getGovToken(chainId).decimals || 18
}

export const stakeOf = async function (state: State, address: string) {
    const wallet = state.getRpcWallet();
    const chainId = state.getChainId();
    const gov = state.getAddresses(chainId).OAXDEX_Governance;
    const govContract = new Contracts.OAXDEX_Governance(wallet, gov);
    let result = await govContract.stakeOf(address);
    result = Utils.fromDecimals(result, govTokenDecimals(state));
    return result;
}

const freezedStake = async function (state: State, address: string) {
    const wallet = state.getRpcWallet();
    const chainId = state.getChainId();
    const gov = state.getAddresses(chainId).OAXDEX_Governance;
    const govContract = new Contracts.OAXDEX_Governance(wallet, gov);
    let result = await govContract.freezedStake(address);
    let minStakePeriod = await govContract.minStakePeriod();
    let newResult = {
        amount: Utils.fromDecimals(result.amount, govTokenDecimals(state)),
        timestamp: result.timestamp.toNumber() * 1000,
        lockTill: (result.timestamp.toNumber() + minStakePeriod.toNumber()) * 1000
    };
    return newResult;
}

export async function getGovState(state: State) {
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

export async function getMinOaxTokenToCreateVote(state: State) {
    let result: number;
    const wallet = state.getRpcWallet();
    const chainId = state.getChainId();
    const address = state.getAddresses(chainId).OAXDEX_Governance;
    if (address) {
        const govContract = new Contracts.OAXDEX_Governance(wallet, address);
        const params = await govContract.getVotingParams(Utils.stringToBytes32('vote') as string);
        result = Number(Utils.fromDecimals(params.minOaxTokenToCreateVote).toFixed());
    }
    return result;
}

export async function doUnlockStake(state: State) {
    const wallet = Wallet.getClientInstance();
    const chainId = state.getChainId();
    const gov = state.getAddresses(chainId).OAXDEX_Governance;
    const govContract = new Contracts.OAXDEX_Governance(wallet, gov);
    const receipt = await govContract.unlockStake();
    return receipt;
}