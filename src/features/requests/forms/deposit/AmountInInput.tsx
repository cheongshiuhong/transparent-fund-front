// Types
import type { FC, ReactElement } from 'react';
import type { EnumType } from '@interfaces/general';

// Libraries
import { useFormikContext, useField } from 'formik';
import { BigNumberInput } from 'big-number-input';

// Contexts
import { useFundContext } from '@contexts/fund';

// Code
import bigNumberToDecimalString from '@utils/numbers/bigNumberToDecimalString';
import useTokenBalance from '@hooks/useTokenBalance';

/**
 * The amount in input component.
 *
 * @returns {ReactElement} - THe amount in input component.
 */
const AmountInInput: FC = (): ReactElement => {
    const {
        fundDetails: { allowedTokens }
    } = useFundContext();
    const { handleBlur } = useFormikContext();
    const [_tokenField, { value: tokenAddress }] = useField<EnumType<string>>('tokenAddress');
    const [{ name }, { value }, { setValue }] = useField<string>('amountIn');
    const { balance, decimals } = useTokenBalance(tokenAddress.value);

    return (
        <div>
            <label
                htmlFor={name}
                className="h-8 flex items-center text-sm lg:text-base font-semibold">
                Amount Tokens In
            </label>
            <BigNumberInput
                decimals={allowedTokens[tokenAddress.value]?.decimals || 18}
                value={value}
                max={balance.toString()}
                onChange={setValue}
                renderInput={(props) => (
                    <input
                        {...props}
                        id={name}
                        aria-label={name}
                        placeholder="The exact amount of input tokens"
                        className="h-10 w-full px-3 border-1 rounded-lg appearance-none border focus:outline-none data-hj-allow"
                        onBlur={handleBlur}
                    />
                )}
            />
            <p className="mt-1 ml-3 text-sm italic">
                Max&nbsp;{bigNumberToDecimalString(balance, decimals, decimals)}
            </p>
        </div>
    );
};

export default AmountInInput;
