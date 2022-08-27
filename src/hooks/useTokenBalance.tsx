// Libraries
import { useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';

type UseTokenBalanceReturn = {
    balance: BigNumber;
    decimals: number;
};

/**
 * Custom hook to retrieve a user's balance
 *
 * @param {string} address - The address of the token.
 * @returns {UseTokenBalanceReturn} - The balance and its decimals.
 */
const useTokenBalance = (address: string): UseTokenBalanceReturn => {
    const { provider, userAddress } = useWeb3Context();
    const [balance, setBalance] = useState<UseTokenBalanceReturn['balance']>(BigNumber.from(0));
    const [decimals, setDecimals] = useState<UseTokenBalanceReturn['decimals']>(0);

    /** Effect to load the balance when input address changes */
    useEffect(() => {
        const load = async (): Promise<void> => {
            if (!address || !provider || !userAddress) {
                setBalance(BigNumber.from(0));
                return;
            }

            const tokenContract = contracts.erc20.attach(address).connect(provider);

            setBalance(await tokenContract.balanceOf(userAddress));
            setDecimals(await tokenContract.decimals());

            // Subscribe to new transfers
            const transferOutFilter = tokenContract.filters.Transfer(userAddress);
            const transferInFilter = tokenContract.filters.Transfer(null, userAddress);
            tokenContract.on(transferOutFilter, async (_from, _to, amount: BigNumber) =>
                setBalance((balance) => balance.sub(amount))
            );
            tokenContract.on(transferInFilter, async (_from, _to, amount: BigNumber) =>
                setBalance((balance) => balance.add(amount))
            );
        };

        load();

        return () => {
            if (!provider || !address) return;
            contracts.erc20.attach(address).connect(provider).removeAllListeners();
        };
    }, [address, provider, userAddress]);

    return { balance, decimals };
};

export default useTokenBalance;
