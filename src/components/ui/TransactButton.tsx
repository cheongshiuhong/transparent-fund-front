// Types
import type {
    FC,
    ReactElement,
    FormEvent,
    MouseEvent as ReactMouseEvent,
    DetailedHTMLProps,
    ButtonHTMLAttributes
} from 'react';

// Code
import Spinner from './Spinner';

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
type FormikFormOnClick = (e?: FormEvent<HTMLFormElement> | undefined) => void;
type RegularOnClick = (e?: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => Promise<void>;
type TransactButtonProps = Omit<ButtonProps, 'onClick'> & {
    isSubmitting: boolean;
    isAwaitingConfirmation: boolean;
    onClick: FormikFormOnClick | RegularOnClick;
};

/**
 * The button for transactions to show loading statuses.
 *
 * @param {TransactButtonProps} props -The extended button props with transacting states.
 * @returns {ReactElement} - The transact button component.
 */
const TransactButton: FC<TransactButtonProps> = ({
    isSubmitting,
    isAwaitingConfirmation,
    onClick,
    children,
    ...buttonProps
}: TransactButtonProps): ReactElement => {
    return (
        <button
            {...buttonProps}
            onClick={async () => {
                onClick && (await onClick());
            }}
            disabled={buttonProps.disabled || isSubmitting || isAwaitingConfirmation}
            className={`disabled:opacity-50 disabled:cursor-not-allowed ${
                buttonProps.className || ''
            }`}>
            {!isSubmitting && !isAwaitingConfirmation ? (
                children
            ) : (
                <span className="flex items-center justify-center">
                    <Spinner />
                    {isAwaitingConfirmation ? (
                        <>&nbsp;Waiting for confirmation...</>
                    ) : (
                        <>&nbsp;Sending transaction...</>
                    )}
                </span>
            )}
        </button>
    );
};

export default TransactButton;
