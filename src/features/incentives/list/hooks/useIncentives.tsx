// Libraries
import { useState, useEffect } from 'react';

// Contexts
import { useWeb3Context } from '@contexts/web3';
import { useFundContext } from '@contexts/fund';

// Code
import contracts from '@constants/contracts';

type IncentiveDetails = {
    isUserQualified: boolean;
};
type UseIncentivesReturn = {
    incentivesDetails: Record<string, IncentiveDetails>;
};

/**
 * Custom hook to get the incentives details.
 *
 * @returns {UseIncentivesReturn} - The incentive details
 */
const useIncentives = (): UseIncentivesReturn => {
    const { readProvider, userAddress } = useWeb3Context();
    const {
        fundDetails: { incentives }
    } = useFundContext();
    const [incentivesDetails, setIncentivesDetails] = useState<
        UseIncentivesReturn['incentivesDetails']
    >({});

    /** Effect to load when the incentive address or user address changes */
    useEffect(() => {
        const load = async (): Promise<void> => {
            if (!readProvider || !userAddress) {
                setIncentivesDetails({});
                return;
            }

            const iIncentiveContract = contracts.iIncentive.connect(readProvider);

            // Load the incentives qualifications
            const incentivesDetailsResponse = await Object.values(incentives).reduce(
                async (current, { address }) => {
                    const incentiveContract = iIncentiveContract.attach(address);
                    return {
                        ...(await current),
                        [address]: {
                            isUserQualified: await incentiveContract.checkUserQualifies(userAddress)
                        }
                    };
                },
                Promise.resolve({}) as Promise<UseIncentivesReturn['incentivesDetails']>
            );
            setIncentivesDetails(incentivesDetailsResponse);
        };

        load();
    }, [readProvider, userAddress, incentives]);

    return { incentivesDetails };
};

export default useIncentives;
