// Types
import type { Contract } from 'ethers';
import type { IFundContext } from '../interfaces';

// Code
import timeout from '@utils/timeout';

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
    // Split into two batches of calls
    const [
        managementFee,
        evaluationPeriodBlocks,
        allowedTokensAddresses,
        maxSingleWithdrawalFundTokenAmount,
        incentivesAddresses
    ] = await Promise.all([
        accountingContract.getManagementFee(),
        accountingContract.getEvaluationPeriodBlocks(),
        frontOfficeParametersContract.getAllowedTokens(),
        frontOfficeParametersContract.getMaxSingleWithdrawalFundTokenAmount(),
        incentivesManagerContract.getIncentives()
    ]);

    await timeout(500);

    const [fundTokenName, fundTokenSymbol, fundTokenDecimals] = await Promise.all([
        fundTokenContract.name(),
        fundTokenContract.symbol(),
        fundTokenContract.decimals()
    ]);

    await timeout(500);

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

    await timeout(500);

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
