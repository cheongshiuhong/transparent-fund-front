// Types
import type { FC, ReactElement } from 'react';

// Libraries
import { useEffect } from 'react';
import { useFormikContext, useField } from 'formik';
import { BigNumberInput } from 'big-number-input';

// Contexts
import { useWeb3Context } from '@contexts/web3';

const DURATION = (2 * 24 * 60 * 60) / 3; // 2 days (@ 3 secs/block)

/**
 * The block deadline input component.
 *
 * @returns {ReactElement} - THe block deadline input component.
 */
const BlockDeadlineInput: FC = (): ReactElement => {
    const { currentBlock } = useWeb3Context();
    const { handleBlur } = useFormikContext();
    const [{ name }, { value }, { setValue }] = useField<string>('blockDeadline');

    /** Effect to update the deadline based on the current block */
    useEffect(() => {
        // Skip if input is set and is not based on the previous block
        // i.e., manually set by user
        if (value.length && Number(value) - DURATION !== currentBlock - 1) return;

        setValue(String(currentBlock + DURATION));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentBlock]);

    return (
        <div>
            <label
                htmlFor={name}
                className="h-8 flex items-center text-sm lg:text-base font-semibold">
                Block Deadline
            </label>
            <BigNumberInput
                decimals={0}
                value={value}
                onChange={setValue}
                renderInput={(props) => (
                    <input
                        {...props}
                        id={name}
                        aria-label={name}
                        placeholder="0"
                        className="h-10 w-full px-3 border-1 rounded-lg appearance-none border focus:outline-none data-hj-allow"
                        onBlur={handleBlur}
                    />
                )}
            />
            <p className="mt-1 ml-3 text-sm italic">Current block: {currentBlock}</p>
        </div>
    );
};

export default BlockDeadlineInput;
