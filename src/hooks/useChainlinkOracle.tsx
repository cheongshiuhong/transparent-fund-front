// Types
import type { Nullable } from '@interfaces/general';

// Libraries
import { useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';

type UseChainlinkOracleReturn = {
    price: Nullable<BigNumber>;
    decimals: number;
};

/**
 * Custom hook to provide the price read from a chainlink oracle.
 *
 * @param {string} address - The address of the chainlink oracle.
 * @returns {UseChainlinkOracleReturn} - The price and its decimals.
 */
const useChainlinkOracle = (address: string): UseChainlinkOracleReturn => {
    const { readProvider, currentBlock } = useWeb3Context();
    const [price, setPrice] = useState<UseChainlinkOracleReturn['price']>(null);
    const [decimals, setDecimals] = useState<UseChainlinkOracleReturn['decimals']>(0);

    /** Effect to load the decimals only when oracle address changes */
    useEffect(() => {
        const load = async (): Promise<void> => {
            if (!address || !readProvider) {
                setPrice(null);
                return;
            }

            const chainlinkOracleContract = contracts.chainlinkOracle
                .attach(address)
                .connect(readProvider);

            setDecimals(await chainlinkOracleContract.decimals());
        };

        load();
    }, [address, readProvider]);

    /**
     * Effect to load the prices every block
     *
     * Contract might be a proxy so we don't subscribe but poll it every block.
     */
    useEffect(() => {
        const load = async (): Promise<void> => {
            if (!address || !readProvider) return;

            const chainlinkOracleContract = contracts.chainlinkOracle
                .attach(address)
                .connect(readProvider);

            setPrice(await chainlinkOracleContract.latestAnswer());
        };

        load();
    }, [address, readProvider, currentBlock]);

    return { price, decimals };
};

export default useChainlinkOracle;
