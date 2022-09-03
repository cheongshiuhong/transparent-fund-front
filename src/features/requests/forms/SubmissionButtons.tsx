// Types
import type { FC, ReactElement } from 'react';

// Libraries
import { useState } from 'react';
import { useFormikContext } from 'formik';

// Contexts
import { useRequestsContext } from '@contexts/requests';

// Code
import addresses from '@constants/addresses';
import TransactButton from '@components/ui/TransactButton';
import useTokenApproval from '@hooks/useTokenApproval';

type SubmissionButtonsProps = {
    approvalToken: string;
};

/**
 * The submission buttons to ensure user has approved before submitting the form.
 *
 * @param {SubmissionButtonsProps} props - The approval token.
 * @returns {ReactElement} - The submission buttons components.
 */
const SubmissionButtons: FC<SubmissionButtonsProps> = ({
    approvalToken
}: SubmissionButtonsProps): ReactElement => {
    const { isRequesting, isAwaitingConfirmation: isAwaitingRequestConfirmation } =
        useRequestsContext();
    const { errors, submitForm } = useFormikContext();
    const {
        isApproving,
        isAwaitingConfirmation: isAwaitingApprovalConfirmation,
        isAllowanceSufficient,
        approve
    } = useTokenApproval(approvalToken, addresses.frontOffice);
    const [approvalError, setApprovalError] = useState<string>('');

    /** Submits the approval transaction */
    const onSubmitApproval = async (): Promise<void> => {
        setApprovalError('');

        try {
            await approve();
        } catch (err) {
            setApprovalError(`Error: ${err.message}`);
        }
    };

    // Only allow submit if allowance is enough
    if (isAllowanceSufficient) {
        return (
            <TransactButton
                type="button"
                className="px-3 py-2 h-10 w-full bg-green-600 text-white rounded-xl"
                onClick={submitForm}
                disabled={!!Object.keys(errors).length}
                isSubmitting={isRequesting}
                isAwaitingConfirmation={isAwaitingRequestConfirmation}>
                Submit
            </TransactButton>
        );
    }

    return (
        <div className="w-full">
            <TransactButton
                type="button"
                className="px-3 py-2 h-10 w-full bg-green-600 text-white rounded-xl
                disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onSubmitApproval}
                disabled={!!Object.keys(errors).length}
                isSubmitting={isApproving}
                isAwaitingConfirmation={isAwaitingApprovalConfirmation}>
                Approve
            </TransactButton>
            <p className="py-2 text-center text-xs md:text-sm italic">
                Approval required before request submission
            </p>
            <p className="w-full text-center text-sm lg:text-base  text-red-500 italic">
                {approvalError}
            </p>
        </div>
    );
};

export default SubmissionButtons;
