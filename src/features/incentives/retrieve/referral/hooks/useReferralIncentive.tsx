// Types
import { Nullable } from '@interfaces/general';

// Libraries
import { useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';

type UseReferralIncentiveReturn = {
    isTransacting: boolean;
    isAwaitingConfirmation: boolean;
    isUserRegistered: Nullable<boolean>;
    userDetails: Nullable<{ referrer: string; referees: string[] }>;
    userBalance: BigNumber;
    register: (referrer: string) => Promise<void>;
    deposit: (amount: BigNumber) => Promise<void>;
    withdraw: (amount: BigNumber) => Promise<void>;
};

const useReferralIncentive = (): UseReferralIncentiveReturn => {
    const { readProvider, writeProvider, userAddress } = useWeb3Context();
    const [isTransacting, setIsTransacting] =
        useState<UseReferralIncentiveReturn['isTransacting']>(false);
    const [isAwaitingConfirmation, setIsAwaitingConfirmation] =
        useState<UseReferralIncentiveReturn['isAwaitingConfirmation']>(false);
    const [isUserRegistered, setIsUserRegistered] =
        useState<UseReferralIncentiveReturn['isUserRegistered']>(null);
    const [userDetails, setUserDetails] = useState<UseReferralIncentiveReturn['userDetails']>(null);
    const [userBalance, setUserBalance] = useState<UseReferralIncentiveReturn['userBalance']>(
        BigNumber.from(0)
    );

    /** Effect to load the user's registration status when provider is ready */
    useEffect(() => {
        const load = async (): Promise<void> => {
            if (!readProvider || !userAddress) return;

            const referralIncentiveContract = contracts.referralIncentive.connect(readProvider);

            // Initial fetching of state
            const [isUserRegisteredResponse, userDetailsResponse, userBalanceResponse] =
                await Promise.all([
                    referralIncentiveContract.checkUserQualifies(userAddress),
                    referralIncentiveContract.getUser(userAddress),
                    referralIncentiveContract.getBalance(userAddress)
                ]);
            setIsUserRegistered(isUserRegisteredResponse);
            setUserDetails(userDetailsResponse);
            setUserBalance(userBalanceResponse);

            // Subscribe to registered status update if not registered
            // if (!isUserRegisteredResponse) {
            //     const registeredFilter =
            //         referralIncentiveContract.filters.UserQualified(userAddress);
            //     referralIncentiveContract.once(registeredFilter, async () =>
            //         setIsUserRegistered(true)
            //     );
            // }
        };

        load();

        return () => {
            if (!readProvider || !userAddress) return;
            contracts.referralIncentive.connect(readProvider).removeAllListeners();
        };
    }, [readProvider, userAddress]);

    /**
     * Registers the user in the referral incentive contract.
     *
     * @param {string} referrer - The referrer to register under.
     */
    const register = async (referrer: string): Promise<void> => {
        if (!writeProvider || !userAddress) return;
        try {
            setIsTransacting(true);
            const referralIncentiveContract = contracts.referralIncentive.connect(
                writeProvider.getSigner()
            );
            const txn = await referralIncentiveContract.register(referrer);
            setIsAwaitingConfirmation(true);
            await txn.wait();
            setIsUserRegistered(true);
        } finally {
            setIsTransacting(false);
            setIsAwaitingConfirmation(false);
        }
    };

    const deposit = async (amount: BigNumber): Promise<void> => {
        if (!writeProvider) return;

        try {
            setIsTransacting(true);
            const referralIncentiveContract = contracts.referralIncentive.connect(
                writeProvider.getSigner()
            );
            const txn = await referralIncentiveContract.deposit(amount);
            setIsAwaitingConfirmation(true);
            await txn.wait();
            setUserBalance(userBalance.add(amount));
        } finally {
            setIsTransacting(false);
            setIsAwaitingConfirmation(false);
        }
    };

    const withdraw = async (amount: BigNumber): Promise<void> => {
        if (!writeProvider) return;

        try {
            setIsTransacting(true);
            const referralIncentiveContract = contracts.referralIncentive.connect(
                writeProvider.getSigner()
            );
            const txn = await referralIncentiveContract.withdraw(amount);
            setIsAwaitingConfirmation(true);
            await txn.wait();
            setUserBalance(userBalance.sub(amount));
        } finally {
            setIsTransacting(false);
            setIsAwaitingConfirmation(false);
        }
    };

    return {
        isTransacting,
        isAwaitingConfirmation,
        isUserRegistered,
        userDetails,
        userBalance,
        register,
        deposit,
        withdraw
    };
};

export default useReferralIncentive;
