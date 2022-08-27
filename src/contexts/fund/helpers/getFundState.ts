// Types
import type { Contract } from 'ethers';
import type { IFundContext } from '../interfaces';

/**
 * Gets the fund state.
 *
 * @param {Contract} accountingContract - The accounting contract.
 * @param {Contract} fundTokenContract - The fund token contract.
 * @returns {Promise<IFundContext['fundState']>} - The fund state.
 */
export default async (
    accountingContract: Contract,
    fundTokenContract: Contract
): Promise<IFundContext['fundState']> => {
    const [[fundTokenPrice], state, actualSupply] = await Promise.all([
        accountingContract.getFundTokenPrice(),
        accountingContract.getState(),
        fundTokenContract.totalSupply()
    ]);

    return {
        aumValue: state.aumValue,
        fundTokenPrice,
        periodBeginningBlock: state.periodBeginningBlock,
        periodBeginningSupply: state.periodBeginningSupply,
        theoreticalSupply: state.theoreticalSupply,
        actualSupply
    };
};
