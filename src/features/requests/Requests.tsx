// Types
import type { FC, ReactElement } from 'react';

// Libraries
import { useState } from 'react';

// Contexts
import { useRequestsContext } from '@contexts/requests';

// Code
import { Status } from '@constants/requests';
import Modal from '@components/ui/Modal';
import TransactButton from '@components/ui/TransactButton';
import RequestDisplay from './RequestDisplay';
import RequestDepositForm from './forms/deposit/RequestDepositForm';
import RequestWithdrawalForm from './forms/withdrawal/RequestWithdrawalForm';

// Icons
import { AiFillCaretDown } from 'react-icons/ai';

/**
 * The requests component.
 *
 * @returns {ReactElement} - The requests component.
 */
const Requests: FC = (): ReactElement => {
    const {
        total,
        requests,
        hasMore,
        loadMore,
        isCancelling,
        cancelLatestRequest,
        isAwaitingConfirmation
    } = useRequestsContext();
    const [isDepositFormOpen, setIsDepositFormOpen] = useState<boolean>(false);
    const [isWithdrawalFormOpen, setIsWithdrawalFormOpen] = useState<boolean>(false);

    return (
        <div className="h-full w-full max-w-[640px] mx-auto">
            {/* Buttons */}
            <div className="w-full flex items-center justify-end">
                <div>
                    {requests.length && requests[0].status === 1 ? (
                        <TransactButton
                            className="px-3 py-1.5 border-2 border-red-500 text-red-500 rounded-md shadow-md"
                            onClick={cancelLatestRequest}
                            isSubmitting={isCancelling}
                            isAwaitingConfirmation={isAwaitingConfirmation}>
                            Cancel Latest Request
                        </TransactButton>
                    ) : (
                        <div className="space-x-4">
                            <button
                                className="px-3 py-1.5 border-2 border-red-500 text-red-500 rounded-md shadow-md"
                                onClick={() => setIsWithdrawalFormOpen(true)}>
                                Request Withdrawal
                            </button>
                            <button
                                className="px-3 py-1.5 bg-green-600 text-white rounded-md shadow-md"
                                onClick={() => setIsDepositFormOpen(true)}>
                                Request Deposit
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Requests Display */}
            <div className="mt-6 space-y-4">
                <p className="w-full text-right">
                    Showing {requests.length} of {total.toString()}
                </p>
                {requests.map((request) => (
                    <RequestDisplay key={`request-${request.index}`} request={request} />
                ))}
                {hasMore && (
                    <div className="pt-2 w-full">
                        <button
                            className="px-2 py-1 w-full bg-gray-300 hover:bg-gray-400 rounded-md hover:shadow-md"
                            onClick={loadMore}>
                            <span className="flex items-center justify-center">
                                <AiFillCaretDown />
                                &nbsp;Load More ({total.sub(requests.length).toString()} left)
                            </span>
                        </button>
                    </div>
                )}
                <div className="h-8"></div>
            </div>

            {/*
                Forms as modals:
                Only openeable when first request is not pending.
                This will close the modal when a request is
                confirmed to have been created on the chain.
            */}
            <Modal
                isOpen={requests[0]?.status !== Status.PENDING && isDepositFormOpen}
                onClose={() => setIsDepositFormOpen(false)}>
                <RequestDepositForm />
            </Modal>
            <Modal
                isOpen={requests[0]?.status !== Status.PENDING && isWithdrawalFormOpen}
                onClose={() => setIsWithdrawalFormOpen(false)}>
                <RequestWithdrawalForm />
            </Modal>
        </div>
    );
};

export default Requests;
