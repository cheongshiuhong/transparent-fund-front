// Types
import type { Nullable } from '@interfaces/general';

// Libraries
import { useState, useEffect } from 'react';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';

type UseIncentiveQualificationReturn = {
    isUserQualified: Nullable<boolean>;
};

/**
 * Custom hook to check if the user qualifies for an incentive.
 *
 * @param {string} address - The address of the incentive.
 * @returns {UseIncentiveQualificationReturn} - The incentive details
 */
const useIncentiveQualification = (address: string): UseIncentiveQualificationReturn => {
    const { readProvider, userAddress } = useWeb3Context();
    const [isUserQualified, setIsUserQualified] =
        useState<UseIncentiveQualificationReturn['isUserQualified']>(null);

    /** Effect to load when the incentive address or user address changes */
    useEffect(() => {
        const load = async (): Promise<void> => {
            if (!address || !readProvider || !userAddress) {
                setIsUserQualified(null);
                return;
            }

            const incentiveContract = contracts.iIncentive.attach(address).connect(readProvider);

            setIsUserQualified(await incentiveContract.checkUserQualifies(userAddress));

            // Subscribe to qualification status update
            const qualificationFilter = incentiveContract.filters.UserQualified(userAddress);
            incentiveContract.once(qualificationFilter, async () => setIsUserQualified(true));
        };

        load();

        return () => {
            if (!address || !readProvider) return;
            contracts.iIncentive.attach(address).connect(readProvider).removeAllListeners();
        };
    }, [address, readProvider, userAddress]);

    return { isUserQualified };
};

export default useIncentiveQualification;
