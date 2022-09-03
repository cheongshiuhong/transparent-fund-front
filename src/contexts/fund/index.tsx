// Types
import type { WrapperProps } from '@interfaces/general';
import type { IFundContext } from './interfaces';

// Libraries
import { FC, ReactElement, createContext, useContext, useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import addresses from '@constants/addresses';
import contracts from '@constants/contracts';
import getFundDetails from './helpers/getFundDetails';
import getFundState from './helpers/getFundState';
import useTokenBalance from '@hooks/useTokenBalance';

/** Context default fallback values */
const DEFAULT_DETAILS = {
    managementFee: BigNumber.from(0),
    evaluationPeriodBlocks: BigNumber.from(0),
    allowedTokens: {},
    maxSingleWithdrawalFundTokenAmount: BigNumber.from(0),
    incentives: {},
    fundToken: {
        address: addresses.fundToken,
        name: 'Fund Token',
        symbol: 'FTKN',
        decimals: 18
    }
};
const DEFAULT_STATE = {
    aumValue: null,
    fundTokenPrice: null,
    periodBeginningBlock: BigNumber.from(0),
    periodBeginningSupply: BigNumber.from(0),
    theoreticalSupply: BigNumber.from(0),
    actualSupply: BigNumber.from(0)
};
const FundContext = createContext<IFundContext>({
    isLoading: false,
    fundDetails: DEFAULT_DETAILS,
    fundState: DEFAULT_STATE,
    userFundTokenBalance: BigNumber.from(0)
});

/**
 * Context hook.
 *
 * @returns {IFundContext} - The context object.
 */
export const useFundContext = (): IFundContext => useContext(FundContext);

/**
 * Fund context provider.
 *
 * @param {WrapperProps} props - The children to provide context to.
 * @returns {ReactElement} - The children with the context provided.
 */
export const FundContextProvider: FC<WrapperProps> = ({ children }: WrapperProps): ReactElement => {
    const { readProvider } = useWeb3Context();
    const [isLoading, setIsLoading] = useState<IFundContext['isLoading']>(false);
    const [fundDetails, setFundDetails] = useState<IFundContext['fundDetails']>(DEFAULT_DETAILS);
    const [fundState, setFundState] = useState<IFundContext['fundState']>(DEFAULT_STATE);
    const { balance: userFundTokenBalance } = useTokenBalance(addresses.fundToken);

    /** Effect for initial load when provider is ready */
    useEffect(() => {
        const loadInitial = async (): Promise<void> => {
            if (!readProvider) return;
            setIsLoading(true);

            const accountingContract = contracts.accounting.connect(readProvider);
            const frontOfficeParametersContract =
                contracts.frontOfficeParameters.connect(readProvider);
            const erc20Contract = contracts.erc20.connect(readProvider);
            const incentivesManagerContract = contracts.incentivesManager.connect(readProvider);
            const iIncentiveContract = contracts.iIncentive.connect(readProvider);
            const fundTokenContract = contracts.fundToken.connect(readProvider);

            const [fundDetailsResponse, fundStateResponse] = await Promise.all([
                getFundDetails(
                    accountingContract,
                    frontOfficeParametersContract,
                    erc20Contract,
                    incentivesManagerContract,
                    iIncentiveContract,
                    fundTokenContract
                ),
                getFundState(accountingContract, fundTokenContract)
            ]);

            setFundDetails(fundDetailsResponse);
            setFundState(fundStateResponse);
            setIsLoading(false);
        };

        loadInitial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readProvider]);

    return (
        <FundContext.Provider
            value={{
                isLoading,
                fundDetails,
                fundState,
                userFundTokenBalance
            }}>
            {children}
        </FundContext.Provider>
    );
};
