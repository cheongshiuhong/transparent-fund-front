// Types
import { Nullable } from '@interfaces/general';

// Libraries
import { useState, useEffect } from 'react';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';

type UseReferralIncentiveReturn = {
    isRegistering: boolean;
    isUserRegistered: Nullable<boolean>;
    userDetails: Nullable<{ referrer: string; referees: string[] }>;
    register: (referrer: string) => Promise<void>;
};

const useReferralIncentive = (): UseReferralIncentiveReturn => {
    const { provider, userAddress } = useWeb3Context();
    const [isRegistering, setIsRegistering] =
        useState<UseReferralIncentiveReturn['isRegistering']>(false);
    const [isUserRegistered, setIsUserRegistered] =
        useState<UseReferralIncentiveReturn['isUserRegistered']>(null);
    const [userDetails, setUserDetails] = useState<UseReferralIncentiveReturn['userDetails']>(null);

    /** Effect to load the user's registration status when provider is ready */
    useEffect(() => {
        const load = async (): Promise<void> => {
            if (!provider || !userAddress) return;

            const referralIncentiveContract = contracts.referralIncentive.connect(provider);

            // Initial fetching of state
            const isUserRegisteredResponse = await referralIncentiveContract.checkUserQualifies(
                userAddress
            );
            const userDetails = await referralIncentiveContract.getUser(userAddress);
            setIsUserRegistered(isUserRegisteredResponse);
            setUserDetails(userDetails);

            // Subscribe to registered status update if not registered
            if (!isUserRegisteredResponse) {
                const registeredFilter =
                    referralIncentiveContract.filters.UserQualified(userAddress);
                referralIncentiveContract.once(registeredFilter, async () =>
                    setIsUserRegistered(true)
                );
            }
        };

        load();

        return () => {
            if (!provider || !userAddress) return;
            contracts.referralIncentive.connect(provider).removeAllListeners();
        };
    }, [provider, userAddress]);

    /**
     * Registers the user in the referral incentive contract.
     *
     * @param {string} referrer - The referrer to register under.
     */
    const register = async (referrer: string): Promise<void> => {
        if (!provider || !userAddress) return;
        try {
            setIsRegistering(true);
            const referralIncentiveContract = contracts.referralIncentive.connect(
                provider.getSigner()
            );
            await referralIncentiveContract.register(referrer);
        } finally {
            setIsRegistering(false);
        }
    };

    return {
        isRegistering,
        isUserRegistered,
        userDetails,
        register
    };
};

export default useReferralIncentive;
