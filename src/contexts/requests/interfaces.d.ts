import { BigNumber } from '@ethersproject/bignumber';
import { Nullable, Request, DepositRequestArgs, WithdrawalRequestArgs } from '@interfaces/general';

export interface IRequestsContext {
    isLoading: boolean;
    isRequesting: boolean;
    isCancelling: boolean;
    isReclaimingIndex: Nullable<BigNumber>;
    total: BigNumber;
    requests: Request[];
    hasMore: boolean;
    loadMore: () => Promise<void>;
    requestDeposit: (args: DepositRequestArgs) => Promise<void>;
    requestWithdrawal: (args: WithdrawalRequestArgs) => Promise<void>;
    cancelLatestRequest: () => Promise<void>;
    reclaimFromFailedRequest: (index: BigNumber) => Promise<void>;
}
