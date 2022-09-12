// Types
import type { Contract } from 'ethers';
import type { WrapperProps, DepositRequestArgs, WithdrawalRequestArgs } from '@interfaces/general';
import type { IRequestsContext } from './interfaces';

// Libraries
import { FC, ReactElement, createContext, useContext, useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';
import { Status } from '@constants/requests';

/** Constants */
const BATCH_SIZE = 5;
const DEFAULT_REQUEST_FIELDS = {
    incentive: ethers.constants.AddressZero,
    status: Status.PENDING,
    blockUpdated: BigNumber.from(0),
    computedAmountOut: BigNumber.from(0),
    isReclaimed: false
};

/** Context default fallback values */
const RequestsContext = createContext<IRequestsContext>({
    isLoading: false,
    isRequesting: false,
    isCancelling: false,
    isReclaimingIndex: null,
    isAwaitingConfirmation: false,
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
    const { readProvider, writeProvider, userAddress } = useWeb3Context();
    const [isLoading, setIsLoading] = useState<IRequestsContext['isLoading']>(false);
    const [isRequesting, setIsRequesting] = useState<IRequestsContext['isRequesting']>(false);
    const [isCancelling, setIsCancelling] = useState<IRequestsContext['isCancelling']>(false);
    const [isReclaimingIndex, setIsReclaimingIndex] =
        useState<IRequestsContext['isReclaimingIndex']>(null);
    const [isAwaitingConfirmation, setIsAwaitingConfirmation] =
        useState<IRequestsContext['isAwaitingConfirmation']>(false);
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
            if (!readProvider || !userAddress) return;
            setIsLoading(true);

            const frontOfficeContract = contracts.frontOffice.connect(readProvider);

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
        };

        loadInitial();

        return () => {
            if (!readProvider || !userAddress) return;
            contracts.frontOffice.connect(readProvider).removeAllListeners();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readProvider, userAddress]);

    /** Loads more requests */
    const loadMore = async (): Promise<void> => {
        if (!readProvider || !userAddress || total.lte(requests.length)) return;
        setIsLoading(true);

        const frontOfficeContract = contracts.frontOffice.connect(readProvider);

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
        if (!writeProvider) return;
        try {
            setIsRequesting(true);
            const signer = writeProvider.getSigner();
            const frontOfficeContract = contracts.frontOffice.connect(signer);
            const txn = await frontOfficeContract.requestDeposit(
                args.tokenAddress,
                args.amountIn,
                args.minAmountOut,
                args.blockDeadline,
                args.incentiveAddress
            );
            setIsAwaitingConfirmation(true);

            const confirmation = await txn.wait();
            const requestCreatedEvent = confirmation.events.filter(
                (event: { event: string }) => event.event === 'RequestCreated'
            )[0];
            const decodedEventData = frontOfficeContract.interface.decodeEventLog(
                'RequestCreated',
                requestCreatedEvent.data,
                requestCreatedEvent.topics
            );

            setTotal(total.add(1));
            setRequests([
                {
                    index: total,
                    ...decodedEventData.accessor,
                    user: decodedEventData.userAddress,
                    ...DEFAULT_REQUEST_FIELDS,
                    ...args
                },
                ...requests
            ]);
        } finally {
            setIsRequesting(false);
            setIsAwaitingConfirmation(false);
        }
    };

    /**
     * Makes a request for withdrawal to the blockchain.
     *
     * @param {WithdrawalRequestArgs} args - The arguments to submit.
     */
    const requestWithdrawal = async (args: WithdrawalRequestArgs): Promise<void> => {
        if (!writeProvider) return;
        try {
            setIsRequesting(true);
            const signer = writeProvider.getSigner();
            const frontOfficeContract = contracts.frontOffice.connect(signer);
            const txn = await frontOfficeContract.requestWithdrawal(
                args.tokenAddress,
                args.amountIn,
                args.minAmountOut,
                args.blockDeadline
            );
            setIsAwaitingConfirmation(true);

            const confirmation = await txn.wait();
            const requestCreatedEvent = confirmation.events.filter(
                (event: { event: string }) => event.event === 'RequestCreated'
            )[0];
            const decodedEventData = frontOfficeContract.interface.decodeEventLog(
                'RequestCreated',
                requestCreatedEvent.data,
                requestCreatedEvent.topics
            );

            setTotal(total.add(1));
            setRequests([
                {
                    index: total,
                    ...decodedEventData.accessor,
                    user: decodedEventData.userAddress,
                    ...DEFAULT_REQUEST_FIELDS,
                    ...args
                },
                ...requests
            ]);
        } finally {
            setIsRequesting(false);
            setIsAwaitingConfirmation(false);
        }
    };

    /** Cancels the user's latest pending request */
    const cancelLatestRequest = async (): Promise<void> => {
        if (!writeProvider) return;
        try {
            setIsCancelling(true);
            const frontOfficeContract = contracts.frontOffice.connect(writeProvider.getSigner());
            const txn = await frontOfficeContract.cancelLatestRequest();
            setIsAwaitingConfirmation(true);
            const confirmation = await txn.wait();
            setRequests([
                {
                    ...requests[0],
                    status: Status.CANCELLED,
                    blockUpdated: confirmation.blockNumber
                },
                ...requests.slice(1)
            ]);
        } finally {
            setIsCancelling(false);
            setIsAwaitingConfirmation(false);
        }
    };

    /**
     * Reclaims the locked tokens in a failed request.
     *
     * @param {BigNumber} index - The index of the request to reclaim from.
     */
    const reclaimFromFailedRequest = async (index: BigNumber): Promise<void> => {
        if (!writeProvider) return;
        try {
            setIsReclaimingIndex(index);
            const frontOfficeContract = contracts.frontOffice.connect(writeProvider.getSigner());
            const txn = await frontOfficeContract.reclaimFromFailedRequest(index);
            setIsAwaitingConfirmation(true);

            await txn.wait();

            for (let i = 0; i < requests.length; i++) {
                if (requests[i].index === index) {
                    setRequests([
                        ...requests.slice(0, i),
                        { ...requests[i], isReclaimed: true },
                        ...requests.slice(i + 1)
                    ]);
                }
            }
        } finally {
            setIsReclaimingIndex(null);
            setIsAwaitingConfirmation(false);
        }
    };

    return (
        <RequestsContext.Provider
            value={{
                isLoading,
                isRequesting,
                isCancelling,
                isReclaimingIndex,
                isAwaitingConfirmation,
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
