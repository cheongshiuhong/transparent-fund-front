// Types
import type { FC, ReactElement } from 'react';
import type { Optional, Token, Request } from '@interfaces/general';

// Contexts
import { useFundContext } from '@contexts/fund';
import { useRequestsContext } from '@contexts/requests';

// Code
import { Status } from '@constants/requests';
import Spinner from '@components/ui/Spinner';
import bigNumberToDecimalString from '@utils/numbers/bigNumberToDecimalString';
import StatusBadge from '@components/requests/StatusBadge';
import TransactButton from '@components/ui/TransactButton';

/** Constants */
const DISPLAY_DECIMALS = 6;

type RequestDisplayProps = {
    request: Request;
};

/**
 * The single request display component.
 *
 * @param {RequestDisplayProps} props - The request object to display.
 * @returns {ReactElement} - The request display component.
 */
const RequestDisplay: FC<RequestDisplayProps> = ({
    request
}: RequestDisplayProps): ReactElement => {
    const {
        fundDetails: { allowedTokens, fundToken }
    } = useFundContext();
    const { isReclaimingIndex, reclaimFromFailedRequest } = useRequestsContext();
    const requestToken: Optional<Token> = allowedTokens[request.token];

    // Hold off rendering until token details are loaded
    // Potential area for bug if requests' token is not found
    // Only possible if an old request's token was removed from allowed tokens.
    // TODO: Fetch token if not found
    if (!requestToken) return <Spinner />;

    return (
        <div className="w-full px-6 py-4 space-y-3 bg-white rounded-md shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between space-x-3 space-y-2">
                <span className="text-base sm:text-lg font-semibold">
                    #{request.index.add(1).toString()}&nbsp;
                    {request.isDeposit ? 'Deposit' : 'Withdrawal'}&nbsp;Request
                </span>
                <StatusBadge
                    statusCode={request.status}
                    blockUpdated={request.blockUpdated.toString()}
                />
            </div>
            <div className="px-2 py-1 bg-gray-200 text-sm md:text-base">
                <p>
                    <span className="font-semibold">Token:&nbsp;</span>
                    <span>
                        {requestToken.name}&nbsp;({requestToken.symbol})
                    </span>
                </p>
                <p>
                    <span className="font-semibold">Amount&nbsp;In:&nbsp;</span>
                    <span>
                        {bigNumberToDecimalString(
                            request.amountIn,
                            request.isDeposit ? requestToken.decimals : fundToken.decimals,
                            DISPLAY_DECIMALS
                        )}
                        &nbsp;{request.isDeposit ? requestToken.symbol : fundToken.symbol}
                    </span>
                </p>
                <p>
                    <span className="font-semibold">Min&nbsp;Amount&nbsp;Out:&nbsp;</span>
                    <span>
                        {bigNumberToDecimalString(
                            request.minAmountOut,
                            request.isDeposit ? fundToken.decimals : requestToken.decimals,
                            DISPLAY_DECIMALS
                        )}
                        &nbsp;{request.isDeposit ? fundToken.symbol : requestToken.symbol}
                    </span>
                </p>
                <p>
                    <span className="font-semibold">Block&nbsp;Deadline:&nbsp;</span>
                    <span>{request.blockDeadline.toString()}</span>
                </p>
                <p>
                    <span className="font-semibold">Computed&nbsp;Amount&nbsp;Out:&nbsp;</span>
                    <span>
                        {bigNumberToDecimalString(
                            request.computedAmountOut,
                            request.isDeposit ? fundToken.decimals : requestToken.decimals,
                            DISPLAY_DECIMALS
                        )}
                        &nbsp;{request.isDeposit ? fundToken.symbol : requestToken.symbol}
                    </span>
                </p>
            </div>
            {request.status > Status.SUCCESSFUL && !request.isReclaimed && (
                <div className="w-full flex items-center justify-end">
                    <TransactButton
                        className="w-full px-2 py-1 bg-yellow-400 rounded-md shadow-md-md"
                        onClick={() => reclaimFromFailedRequest(request.index)}
                        disabled={isReclaimingIndex === request.index}
                        isSubmitting={isReclaimingIndex === request.index}>
                        Reclaim&nbsp;
                        {bigNumberToDecimalString(
                            request.amountIn,
                            request.isDeposit ? requestToken.decimals : fundToken.decimals,
                            DISPLAY_DECIMALS
                        )}
                        &nbsp;{request.isDeposit ? fundToken.symbol : requestToken.symbol}
                    </TransactButton>
                </div>
            )}
        </div>
    );
};

export default RequestDisplay;
