// Types
import type {
    FC,
    ReactElement,
    FormEvent,
    MouseEvent as ReactMouseEvent,
    DetailedHTMLProps,
    ButtonHTMLAttributes
} from 'react';

// Libraries
import { useState } from 'react';

// Code
import Spinner from './Spinner';

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
type FormikFormOnClick = (e?: FormEvent<HTMLFormElement> | undefined) => void;
type RegularOnClick = (e?: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => Promise<void>;
type TransactButtonProps = Omit<ButtonProps, 'onClick'> & {
    isSubmitting: boolean;
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
    onClick,
    children,
    ...buttonProps
}: TransactButtonProps): ReactElement => {
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    // Typical lifecycle:
    // User clicks --> Wallet signature prompt (Sending transaction)
    // User signs --> Submits to the chain (Waiting for confirmation)
    // Confirmed --> Conditional rendering unrenders button/parent component

    return (
        <button
            {...buttonProps}
            onClick={async () => {
                onClick && (await onClick());
                setIsSubmitted(true);
            }}
            disabled={buttonProps.disabled || isSubmitting || isSubmitted}
            className={`disabled:opacity-50 disabled:cursor-not-allowed ${
                buttonProps.className || ''
            }`}>
            {!isSubmitting && !isSubmitted ? (
                children
            ) : (
                <span className="flex items-center justify-center">
                    <Spinner />
                    {isSubmitting ? (
                        <>&nbsp;Sending transaction...</>
                    ) : (
                        <>&nbsp;Waiting for confirmation...</>
                    )}
                </span>
            )}
        </button>
    );
};

export default TransactButton;
