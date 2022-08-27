// Types
import type { Contract } from 'ethers';
import type { WrapperProps, DepositRequestArgs, WithdrawalRequestArgs } from '@interfaces/general';
import type { IRequestsContext } from './interfaces';

// Libraries
import { FC, ReactElement, createContext, useContext, useState, useRef, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';
import { Status } from '@constants/requests';

/** Constants */
const BATCH_SIZE = 5;

/** Context default fallback values */
const RequestsContext = createContext<IRequestsContext>({
    isLoading: false,
    isRequesting: false,
    isCancelling: false,
    isReclaimingIndex: null,
    total: BigNumber.from(0),
    requests: [],
    hasMore: false,
    loadMore: async () => console.warn('No context provided.'),
    requestDeposit: async () => console.warn('No context provided.'),
    requestWithdrawal: async () => console.warn('No context provided.'),
    cancelLatestRequest: async () => console.warn('No context provided.'),
    reclaimFromFailedRequest: async () => console.warn('No context provided.')
});

/**
 * Context hook.
 *
 * @returns {IRequestsContext} - The context object.
 */
export const useRequestsContext = (): IRequestsContext => useContext(RequestsContext);

/**
 * Requests context provider.
 *
 * @param {WrapperProps} props - The children to provide context to.
 * @returns {ReactElement} - The children with the context provided.
 */
export const RequestsContextProvider: FC<WrapperProps> = ({
    children
}: WrapperProps): ReactElement => {
    const { provider, userAddress } = useWeb3Context();
    const [isLoading, setIsLoading] = useState<IRequestsContext['isLoading']>(false);
    const [isRequesting, setIsRequesting] = useState<IRequestsContext['isRequesting']>(false);
    const [isCancelling, setIsCancelling] = useState<IRequestsContext['isCancelling']>(false);
    const [isReclaimingIndex, setIsReclaimingIndex] =
        useState<IRequestsContext['isReclaimingIndex']>(null);
    const [total, setTotal] = useState<IRequestsContext['total']>(BigNumber.from(0));
    const [requests, setRequests] = useState<IRequestsContext['requests']>([]);

    // Refs to prevent stale states in callbacks
    const totalRef = useRef<IRequestsContext['total']>();
    const requestsRef = useRef<IRequestsContext['requests']>();
    totalRef.current = total;
    requestsRef.current = requests;

    /**
     * Fetches the requests from the blockchain.
     *
     * @private
     * @param {Contract} frontOfficeContract - The front
     * @param {string} userAddress - The requests of the user to fetch.
     * @param {BigNumber[]} indexesToFetch - The indexes of the requests to fetch.
     */
    const _fetchRequests = async (
        frontOfficeContract: Contract,
        userAddress: string,
        indexesToFetch: BigNumber[]
    ): Promise<IRequestsContext['requests']> => {
        const response = await Promise.all(
            indexesToFetch.map(async (index) =>
                frontOfficeContract.getUserRequestByIndex(userAddress, index)
            )
        );
        return response.map(([accessor, request], arrayIndex) => ({
            index: indexesToFetch[arrayIndex],
            ...accessor,
            ...request
        }));
    };

    /** Effect for initial load when provider is ready */
    useEffect(() => {
        const loadInitial = async (): Promise<void> => {
            if (!provider || !userAddress) return;
            setIsLoading(true);

            const frontOfficeContract = contracts.frontOffice.connect(provider);

            // Fetch initial states
            const totalResponse: BigNumber = await frontOfficeContract.getUserRequestCount(
                userAddress
            );
            const numToFetch = totalResponse.lt(BATCH_SIZE) ? totalResponse.toNumber() : BATCH_SIZE;
            const indexesToFetch = Array.from(Array(numToFetch).keys()).map((_, i) =>
                totalResponse.sub(i + 1)
            );
            const requestsResponse = await _fetchRequests(
                frontOfficeContract,
                userAddress,
                indexesToFetch
            );

            setTotal(totalResponse);
            setRequests(requestsResponse);
            setIsLoading(false);

            // Subscribe to new requests created
            frontOfficeContract.on(
                frontOfficeContract.filters.RequestCreated(userAddress),
                async (_, accessor, createdRequest) => {
                    // Get the refs to the states
                    const total = totalRef.current;
                    const requests = requestsRef.current;
                    if (!total || !requests) return;

                    // Skip if already exist
                    if (
                        requests.some(
                            (request) =>
                                request.isDeposit === accessor.isDeposit &&
                                request.token === accessor.token &&
                                request.queueNumber.eq(accessor.queueNumber)
                        )
                    ) {
                        return;
                    }

                    setTotal(total.add(1));
                    setRequests([{ index: total, ...accessor, ...createdRequest }, ...requests]);
                }
            );

            // Subscribe to latest request being cancelled
            frontOfficeContract.on(
                frontOfficeContract.filters.RequestCancelled(userAddress),
                async (_, accessor, metaData) => {
                    // Get the refs to the states
                    const requests = requestsRef.current;
                    if (!requests) return;

                    // Skip if not the latest pending request
                    if (
                        accessor.isDeposit !== requests[0].isDeposit ||
                        accessor.token !== requests[0].token ||
                        !accessor.queueNumber.eq(requests[0].queueNumber)
                    ) {
                        console.log(
                            accessor.queueNumber,
                            'Not the latest request.. returning here'
                        );
                        return;
                    }

                    setRequests([
                        {
                            ...requests[0],
                            status: Status.CANCELLED,
                            blockUpdated: metaData.blockNumber
                        },
                        ...requests.slice(1)
                    ]);
                }
            );

            // Subscribe to reclaiming of tokens
            frontOfficeContract.on(
                frontOfficeContract.filters.RequestReclaimed(userAddress),
                async (_, accessor) => {
                    // Get the refs to the states
                    const requests = requestsRef.current;
                    if (!requests) return;

                    for (let i = 0; i < requests.length; i++) {
                        if (
                            requests[i].isDeposit === accessor.isDeposit &&
                            requests[i].token === accessor.token &&
                            requests[i].queueNumber.eq(accessor.queueNumber)
                        ) {
                            setRequests([
                                ...requests.slice(0, i),
                                { ...requests[i], isReclaimed: true },
                                ...requests.slice(i + 1)
                            ]);
                            return;
                        }
                    }
                }
            );
        };

        loadInitial();

        return () => {
            if (!provider || !userAddress) return;
            contracts.frontOffice.connect(provider).removeAllListeners();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider, userAddress]);

    /** Loads more requests */
    const loadMore = async (): Promise<void> => {
        if (!provider || !userAddress || total.lte(requests.length)) return;
        setIsLoading(true);

        const frontOfficeContract = contracts.frontOffice.connect(provider);

        const numRemaining = total.sub(requests.length);
        const numToFetch = numRemaining.lt(10) ? numRemaining.toNumber() : 10;
        const indexesToFetch = Array.from(Array(numToFetch).keys()).map((_, i) =>
            total.sub(requests.length + i + 1)
        );
        const requestsResponse = await _fetchRequests(
            frontOfficeContract,
            userAddress,
            indexesToFetch
        );

        setRequests([...requests, ...requestsResponse]);
        setIsLoading(false);
    };

    /**
     * Makes a request for deposit to the blockchain.
     *
     * @param {DepositRequestArgs} args - The arguments to submit.
     */
    const requestDeposit = async (args: DepositRequestArgs): Promise<void> => {
        if (!provider) return;
        try {
            setIsRequesting(true);
            const frontOfficeContract = contracts.frontOffice.connect(provider.getSigner());
            await frontOfficeContract.requestDeposit(
                args.tokenAddress,
                args.amountIn,
                args.minAmountOut,
                args.blockDeadline,
                args.incentiveAddress
            );
        } finally {
            setIsRequesting(false);
        }
    };

    /**
     * Makes a request for withdrawal to the blockchain.
     *
     * @param {WithdrawalRequestArgs} args - The arguments to submit.
     */
    const requestWithdrawal = async (args: WithdrawalRequestArgs): Promise<void> => {
        if (!provider) return;
        try {
            setIsRequesting(true);
            const frontOfficeContract = contracts.frontOffice.connect(provider.getSigner());
            await frontOfficeContract.requestWithdrawal(
                args.tokenAddress,
                args.amountIn,
                args.minAmountOut,
                args.blockDeadline
            );
        } finally {
            setIsRequesting(false);
        }
    };

    /** Cancels the user's latest pending request */
    const cancelLatestRequest = async (): Promise<void> => {
        if (!provider) return;
        try {
            setIsCancelling(true);
            const frontOfficeContract = contracts.frontOffice.connect(provider.getSigner());
            await frontOfficeContract.cancelLatestRequest();
        } finally {
            setIsCancelling(false);
        }
    };

    /**
     * Reclaims the locked tokens in a failed request.
     *
     * @param {BigNumber} index - The index of the request to reclaim from.
     */
    const reclaimFromFailedRequest = async (index: BigNumber): Promise<void> => {
        if (!provider) return;
        try {
            setIsReclaimingIndex(index);
            const frontOfficeContract = contracts.frontOffice.connect(provider.getSigner());
            await frontOfficeContract.reclaimFromFailedRequest(index);
        } finally {
            setIsReclaimingIndex(null);
        }
    };

    return (
        <RequestsContext.Provider
            value={{
                isLoading,
                isRequesting,
                isCancelling,
                isReclaimingIndex,
                total,
                requests,
                hasMore: total.gt(requests.length),
                loadMore,
                requestDeposit,
                requestWithdrawal,
                cancelLatestRequest,
                reclaimFromFailedRequest
            }}>
            {children}
        </RequestsContext.Provider>
    );
};
