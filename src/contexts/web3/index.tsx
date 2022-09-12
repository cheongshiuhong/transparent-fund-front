// Types
import type { Web3Provider, JsonRpcProvider } from '@ethersproject/providers';
import type { WrapperProps, Nullable } from '@interfaces/general';

// Libraries
import { FC, ReactElement, createContext, useContext, useState, useEffect } from 'react';
import { providers } from 'ethers';
import Web3Modal from 'web3modal';

// Code
import uris from '@constants/uris';
import providerOptions from './providerOptions';

// Constants
enum DisclaimerState {
    NOT_DISCLAIMED = 0,
    DISCLAIMING = 1,
    DISCLAIMED = 2
}

interface IWeb3Context {
    isLoading: boolean;
    isDisclaiming: boolean;
    readProvider: JsonRpcProvider;
    writeProvider: Nullable<Web3Provider>;
    chainId: number;
    currentBlock: number;
    userAddress: Nullable<string>;
    connectWallet: () => Promise<void>;
    setDisclaimed: () => void;
}

/** Context default fallback values */
const DEFAULT_CHAIN_ID: IWeb3Context['chainId'] = -1;
const Web3Context = createContext<IWeb3Context>({
    isLoading: false,
    isDisclaiming: false,
    readProvider: new providers.JsonRpcProvider(uris.bscRpcUri),
    writeProvider: null,
    chainId: DEFAULT_CHAIN_ID,
    currentBlock: 0,
    userAddress: null,
    connectWallet: async () => console.warn('No context provided.'),
    setDisclaimed: () => console.warn('No context provided.')
});

/**
 * Context hook.
 *
 * @returns {IWeb3Context} - The context object.
 */
export const useWeb3Context = (): IWeb3Context => useContext(Web3Context);

/**
 * Web3 context provider.
 *
 * @param {WrapperProps} props - The children to provide context to.
 * @returns {ReactElement} - The children with the context provided.
 */
export const Web3ContextProvider: FC<WrapperProps> = ({ children }: WrapperProps): ReactElement => {
    const [isLoading, setIsLoading] = useState<IWeb3Context['isLoading']>(false);
    const [disclaimerState, setDisclaimerState] = useState<DisclaimerState>(
        DisclaimerState.NOT_DISCLAIMED
    );
    const [readProvider, _setReadProvider] = useState<IWeb3Context['readProvider']>(
        new providers.JsonRpcProvider(uris.bscRpcUri)
    );
    const [web3Modal, setWeb3Modal] = useState<Nullable<Web3Modal>>(null);
    const [writeProvider, setWriteProvider] = useState<IWeb3Context['writeProvider']>(null);
    const [chainId, setChainId] = useState<IWeb3Context['chainId']>(DEFAULT_CHAIN_ID);
    const [currentBlock, setCurrentBlock] = useState<IWeb3Context['currentBlock']>(0);
    const [userAddress, setUserAddress] = useState<IWeb3Context['userAddress']>(null);

    /** Effect to setup the web3 modal */
    useEffect(() => {
        /** Web3 provider setup */
        setWeb3Modal(
            new Web3Modal({
                cacheProvider: true,
                providerOptions
            })
        );
    }, []);

    /** Effect to check for cached users */
    useEffect(() => {
        if (web3Modal && web3Modal.cachedProvider) connectWallet();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [web3Modal]);

    /** Effect to check for user when provider changes */
    useEffect(() => {
        if (!writeProvider) return;
        const onAccountsChanged = async (): Promise<void> => {
            const accounts = await writeProvider.listAccounts();

            // Unset the account if no accounts
            if (accounts.length === 0) {
                setUserAddress(null);
                localStorage.removeItem('userAddress');
                return;
            }

            localStorage.setItem('userAddress', accounts[0]);
            setUserAddress(accounts[0]);
        };

        const onChainChanged = async (): Promise<void> => {
            const { chainId } = await writeProvider.getNetwork();
            setChainId(chainId);
        };

        window.ethereum && window.ethereum.on('accountsChanged', onAccountsChanged);
        writeProvider.addListener('network', onChainChanged);
        writeProvider.addListener('block', setCurrentBlock);

        return () => {
            window.ethereum.removeAllListeners();
            writeProvider.removeAllListeners();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [writeProvider]);

    /** Effect to update the user state and allowed routes whenever user address changes */
    useEffect(() => {
        const fetchUserState = async (): Promise<void> => {
            if (!userAddress || !writeProvider) return;

            setIsLoading(true);

            // Just reload chain if still not loaded (workaround for glitchy behaviour)
            if (chainId === -1) {
                const { chainId } = await writeProvider.getNetwork();
                setChainId(chainId);
            }

            setIsLoading(false);
        };

        fetchUserState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userAddress, chainId]);

    /** Connects the wallet */
    const connectWallet = async (): Promise<void> => {
        if (!web3Modal) return;

        if (
            !localStorage.getItem('userAddress') &&
            disclaimerState === DisclaimerState.NOT_DISCLAIMED
        ) {
            setDisclaimerState(DisclaimerState.DISCLAIMING);
            return;
        }

        try {
            const instance = await web3Modal.connect();
            const provider = new providers.Web3Provider(instance);
            const userAddress = await provider.getSigner().getAddress();
            localStorage.setItem('userAddress', userAddress);

            setWriteProvider(provider);
            setUserAddress(userAddress);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Web3Context.Provider
            value={{
                isLoading,
                isDisclaiming: disclaimerState === DisclaimerState.DISCLAIMING,
                readProvider,
                writeProvider,
                chainId,
                currentBlock,
                userAddress,
                connectWallet,
                setDisclaimed: () => setDisclaimerState(DisclaimerState.DISCLAIMED)
            }}>
            {children}
        </Web3Context.Provider>
    );
};
