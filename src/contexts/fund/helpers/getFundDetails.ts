// Types
import type { Contract } from 'ethers';
import type { IFundContext } from '../interfaces';

/**
 * Sets timeout.
 *
 * @param {number} ms - The ms to sleep.
 * @returns {Promise<void>} - The timer.
 */
function timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gets the fund details.
 *
 * @param {Contract} accountingContract - The accouting contract.
 * @param {Contract} frontOfficeParametersContract - The frontOffice parameters contract.
 * @param {Contract} erc20Contract - The non-address specific erc20 contract.
 * @param {Contract} incentivesManagerContract - The incentives manager contract.
 * @param {Contract} iIncentiveContract - The incentive interface contract.
 * @param {Contract} fundTokenContract - The fund token contract.
 * @returns {Promise<IFundContext['fundDetails']>} - THe fund parameters.
 */
export default async (
    accountingContract: Contract,
    frontOfficeParametersContract: Contract,
    erc20Contract: Contract,
    incentivesManagerContract: Contract,
    iIncentiveContract: Contract,
    fundTokenContract: Contract
): Promise<IFundContext['fundDetails']> => {
    const managementFee = await accountingContract.getManagementFee();
    await timeout(1000);
    const evaluationPeriodBlocks = await accountingContract.getEvaluationPeriodBlocks();
    await timeout(1000);
    const allowedTokensAddresses = await frontOfficeParametersContract.getAllowedTokens();
    await timeout(1000);
    const maxSingleWithdrawalFundTokenAmount =
        await frontOfficeParametersContract.getMaxSingleWithdrawalFundTokenAmount();
    await timeout(1000);
    const incentivesAddresses = await incentivesManagerContract.getIncentives();
    await timeout(1000);
    const fundTokenName = await fundTokenContract.name();
    await timeout(1000);
    const fundTokenSymbol = await fundTokenContract.symbol();
    await timeout(1000);
    const fundTokenDecimals = await fundTokenContract.decimals();
    // const [
    //     managementFee,
    //     evaluationPeriodBlocks,
    //     allowedTokensAddresses,
    //     maxSingleWithdrawalFundTokenAmount,
    //     incentivesAddresses,
    //     fundTokenName,
    //     fundTokenSymbol,
    //     fundTokenDecimals
    // ] = await Promise.all([
    //     accountingContract.getManagementFee(),
    //     accountingContract.getEvaluationPeriodBlocks(),
    //     frontOfficeParametersContract.getAllowedTokens(),
    //     frontOfficeParametersContract.getMaxSingleWithdrawalFundTokenAmount(),
    //     incentivesManagerContract.getIncentives(),
    //     fundTokenContract.name(),
    //     fundTokenContract.symbol(),
    //     fundTokenContract.decimals()
    // ]);

    const allowedTokens = await (allowedTokensAddresses as string[]).reduce(
        async (current, address) => {
            const tokenContract = erc20Contract.attach(address);
            const [name, symbol, decimals, oracle] = await Promise.all([
                tokenContract.name(),
                tokenContract.symbol(),
                tokenContract.decimals(),
                frontOfficeParametersContract.getAllowedTokenOracle(address)
            ]);
            return { ...(await current), [address]: { address, name, symbol, decimals, oracle } };
        },
        Promise.resolve({}) as Promise<IFundContext['fundDetails']['allowedTokens']>
    );

    const incentives = await (incentivesAddresses as string[]).reduce(async (current, address) => {
        const name = await iIncentiveContract.attach(address).getName();
        return { ...(await current), [address]: { address, name } };
    }, Promise.resolve({}) as Promise<IFundContext['fundDetails']['incentives']>);

    return {
        managementFee,
        evaluationPeriodBlocks,
        allowedTokens,
        maxSingleWithdrawalFundTokenAmount,
        incentives,
        fundToken: {
            address: fundTokenContract.address,
            name: fundTokenName,
            symbol: fundTokenSymbol,
            decimals: fundTokenDecimals
        }
    };
};
