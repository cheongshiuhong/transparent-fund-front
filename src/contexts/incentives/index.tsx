// Types
import type { Contract } from 'ethers';
import type { WrapperProps } from '@interfaces/general';
import type { IIncentivesContext } from './interfaces';

// Libraries
import { FC, ReactElement, createContext, useContext, useState, useRef, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';
import { useFundContext } from '@contexts/fund';

// Code
import contracts from '@constants/contracts';

/** Context default fallback values */
const IncentivesContext = createContext<IIncentivesContext>({
    isLoading: false,
    incentivesDetails: {}
});

/**
 * Context hook.
 *
 * @returns {IIncentivesContext} - The context object.
 */
export const useIncentivesContext = (): IIncentivesContext => useContext(IncentivesContext);

/**
 * Incentives context provider.
 *
 * @param {WrapperProps} props - The children to provide context to.
 * @returns {ReactElement} - The children with the context provided.
 */
export const IncentivesContextProvider: FC<WrapperProps> = ({ children }): ReactElement => {
    const { readProvider, userAddress } = useWeb3Context();
    const {
        fundDetails: { incentives }
    } = useFundContext();
    const [isLoading, setIsLoading] = useState<IIncentivesContext['isLoading']>(false);
    const [incentivesDetails, setIncentivesDetails] = useState<
        IIncentivesContext['incentivesDetails']
    >({});

    /** Effect for initial load when provider is ready */
    useEffect(() => {
        const loadInitial = async (): Promise<void> => {
            if (!readProvider || !userAddress || !Object.keys(incentives).length) return;
            setIsLoading(true);

            const iIncentiveContract = contracts.iIncentive.connect(readProvider);

            // Load the incentives qualifications
            const incentivesDetailsResponse = await Object.values(incentives).reduce(
                async (current, { address, name }) => {
                    const incentiveContract = iIncentiveContract.attach(address);
                    return {
                        ...(await current),
                        [name]: {
                            isUserQualified: incentiveContract.checkUserQualifies(userAddress)
                        }
                    };
                },
                Promise.resolve({}) as Promise<IIncentivesContext['incentivesDetails']>
            );

            setIncentivesDetails(incentivesDetailsResponse);
            setIsLoading(false);
        };

        loadInitial();

        return () => {
            if (!readProvider || !userAddress) return;
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readProvider, userAddress, incentives]);

    return (
        <IncentivesContext.Provider
            value={{
                isLoading,
                incentivesDetails
            }}>
            {children}
        </IncentivesContext.Provider>
    );
};
