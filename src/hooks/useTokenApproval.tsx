// Types
import type { Nullable } from '@interfaces/general';

// Libraries
import { useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';

/** Constants */
// User must have approved a sufficiently large amount (MIN_ALLOWANCE)
// to guarantee succeessful txn, else we re-approve to the max (UINT256_MAX)
const MIN_ALLOWANCE = BigNumber.from('1000000000000000000000000000'); // 1 billion
const UINT256_MAX = BigNumber.from(
    '115792089237316195423570985008687907853269984665640564039457584007913129639935'
); // 2^256 - 1

type UseTokenApprovalReturn = {
    isApproving: boolean;
    isAwaitingConfirmation: boolean;
    allowance: Nullable<BigNumber>;
    isAllowanceSufficient: boolean;
    approve: () => Promise<void>;
};

/**
 * Custom hook to check the token allowance and provide the approval function.
 *
 * @param {string} tokenAddress - The address of the token.
 * @param {string} spenderAddress - The address of the spender.
 * @returns {UseTokenApprovalReturn} - The allowance and approval function.
 */
const useTokenApproval = (tokenAddress: string, spenderAddress: string): UseTokenApprovalReturn => {
    const { readProvider, writeProvider, userAddress } = useWeb3Context();
    const [isApproving, setIsApproving] = useState<UseTokenApprovalReturn['isApproving']>(false);
    const [isAwaitingConfirmation, setIsAwaitingConfirmation] =
        useState<UseTokenApprovalReturn['isAwaitingConfirmation']>(false);
    const [allowance, setAllowance] = useState<UseTokenApprovalReturn['allowance']>(null);

    /** Effect to load the allowance when token address or user address changes */
    useEffect(() => {
        const load = async (): Promise<void> => {
            if (!tokenAddress || !readProvider || !userAddress) {
                setAllowance(null);
                return;
            }

            const erc20Contract = contracts.erc20.attach(tokenAddress).connect(readProvider);

            // Initial fetching of allowance
            setAllowance(await erc20Contract.allowance(userAddress, spenderAddress));

            // Subscribe to new approvals
            const approvalFilter = erc20Contract.filters.Approval(userAddress);
            erc20Contract.on(
                approvalFilter,
                async (_owner: string, spender: string, value: BigNumber) => {
                    // Ignore approvals not to the front office
                    if (spender !== spenderAddress) return;
                    setAllowance(value);
                }
            );
        };

        load();

        return () => {
            if (!readProvider || !tokenAddress) return;
            contracts.erc20.attach(tokenAddress).connect(readProvider).removeAllListeners();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenAddress, readProvider, userAddress]);

    /** Makes the transaction to approve the front office to spend user's tokens */
    const approve = async (): Promise<void> => {
        if (!tokenAddress || !writeProvider) return;
        try {
            setIsApproving(true);
            const erc20Contract = contracts.erc20
                .attach(tokenAddress)
                .connect(writeProvider.getSigner());
            const txn = await erc20Contract.approve(spenderAddress, UINT256_MAX);
            setIsAwaitingConfirmation(true);
            await txn.wait();
        } finally {
            setIsApproving(false);
            setIsAwaitingConfirmation(false);
        }
    };

    return {
        isApproving,
        isAwaitingConfirmation,
        allowance,
        isAllowanceSufficient: allowance?.gte(MIN_ALLOWANCE) || false,
        approve
    };
};

export default useTokenApproval;
