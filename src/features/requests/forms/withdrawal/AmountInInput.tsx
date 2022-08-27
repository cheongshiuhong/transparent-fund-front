// Types
import type { FC, ReactElement } from 'react';

// Libraries
import { useFormikContext, useField } from 'formik';
import { BigNumberInput } from 'big-number-input';

// Contexts
import { useFundContext } from '@contexts/fund';

// Code
import bigNumberToDecimalString from '@utils/numbers/bigNumberToDecimalString';

/**
 * The amount in input component.
 *
 * @returns {ReactElement} - The amount in input component.
 */
const AmountInInput: FC = (): ReactElement => {
    const {
        userFundTokenBalance,
        fundDetails: { fundToken }
    } = useFundContext();
    const { handleBlur } = useFormikContext();
    const [{ name }, { value }, { setValue }] = useField<string>('amountIn');

    return (
        <div>
            <label
                htmlFor={name}
                className="h-8 flex items-center text-sm lg:text-base font-semibold">
                Amount Fund Tokens In
            </label>
            <BigNumberInput
                decimals={fundToken.decimals}
                value={value}
                max={userFundTokenBalance.toString()}
                onChange={setValue}
                renderInput={(props) => (
                    <input
                        {...props}
                        id={name}
                        aria-label={name}
                        placeholder="The exact amount of input fund tokens"
                        className="h-10 w-full px-3 broder-1 rounded-lg appearance-none border focus:outline-none data-hj-allow"
                        onBlur={handleBlur}
                    />
                )}
            />
            <p className="mt-1 ml-3 text-sm italic">
                Max&nbsp;
                {bigNumberToDecimalString(
                    userFundTokenBalance,
                    fundToken.decimals,
                    fundToken.decimals
                )}
            </p>
        </div>
    );
};

export default AmountInInput;
