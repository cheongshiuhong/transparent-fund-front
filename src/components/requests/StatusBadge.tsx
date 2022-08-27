// Types
import type { FC, ReactElement } from 'react';

// Code
import { Status } from '@constants/requests';

type StatusBadgeProps = {
    statusCode: number;
    blockUpdated: string;
};

const options: Record<number, { colorClass: string; label: string }> = {
    [Status.UNINITIALIZED]: { colorClass: 'bg-yellow-500', label: 'Uninitialized' },
    [Status.PENDING]: { colorClass: 'bg-yellow-500', label: 'Pending' },
    [Status.CANCELLED]: { colorClass: 'bg-orange-500', label: 'Cancelled' },
    [Status.SUCCESSFUL]: { colorClass: 'bg-green-600', label: 'Successful' },
    [Status.FAILED_AMOUNT_TOO_LARGE]: {
        colorClass: 'bg-red-500',
        label: 'Failed: amount too large'
    },
    [Status.FAILED_EXPIRED]: { colorClass: 'bg-red-500', label: 'Failed: expired' },
    [Status.FAILED_INSUFFICIENT_OUTPUT]: {
        colorClass: 'bg-red-500',
        label: 'Failed: insufficient output'
    },
    [Status.FAILED_INCENTIVE_NOT_FOUND]: {
        colorClass: 'bg-red-500',
        label: 'Failed: incentive not found'
    },
    [Status.FAILED_INCENTIVE_NOT_QUALIFIED]: {
        colorClass: 'bg-red-500',
        label: 'Failed: incentive not qualified'
    },
    [Status.FAILED_UNHANDLED]: { colorClass: 'bg-red-500', label: 'Failed: unhandled' }
};

/**
 * Formats a proposal's status into a badge component.
 *
 * @param {number} statusCode - The status code of a proposal.
 * @returns {ReactElement} - The status badge component.
 */
const StatusBadge: FC<StatusBadgeProps> = ({
    statusCode,
    blockUpdated
}: StatusBadgeProps): ReactElement => {
    const option = options[statusCode];

    return (
        <span className={`px-1.5 py-0.5 text-xs ${option.colorClass} text-white rounded-md`}>
            {option.label}
            {blockUpdated !== '0' && <>&nbsp;(Block {blockUpdated})</>}
        </span>
    );
};

export default StatusBadge;
