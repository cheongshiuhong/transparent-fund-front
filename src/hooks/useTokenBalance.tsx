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
    const { readProvider, userAddress, currentBlock } = useWeb3Context();
    const [balance, setBalance] = useState<UseTokenBalanceReturn['balance']>(BigNumber.from(0));
    const [decimals, setDecimals] = useState<UseTokenBalanceReturn['decimals']>(0);

    const load = async (): Promise<void> => {
        if (!address || !readProvider || !userAddress) {
            setBalance(BigNumber.from(0));
            return;
        }

        const tokenContract = contracts.erc20.attach(address).connect(readProvider);

        setBalance(await tokenContract.balanceOf(userAddress));
        setDecimals(await tokenContract.decimals());
    };

    /** Effect to load the balance when input address changes */
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, readProvider, userAddress]);

    /** Reload every 5 blocks (15 seconds) */
    useEffect(() => {
        if (currentBlock % 5 === 0) load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentBlock]);

    return { balance, decimals };
};

export default useTokenBalance;
