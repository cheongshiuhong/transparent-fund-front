// Types
import type { FC, ReactElement } from 'react';
import type { EnumType, Nullable } from '@interfaces/general';

// Libraries
import { useState, useEffect } from 'react';
import { useFormikContext, useField } from 'formik';
import { BigNumber } from '@ethersproject/bignumber';
import { BigNumberInput } from 'big-number-input';

// Contexts
import { useFundContext } from '@contexts/fund';

// Code
import useChainlinkOracle from '@hooks/useChainlinkOracle';
import bigNumberToDecimalString from '@utils/numbers/bigNumberToDecimalString';
import adjustDecimals from '@utils/numbers/adjustDecimals';

const CONSERVATIVE_PCT = 95;

/**
 * The minimum amount out input component.
 *
 * @returns {ReactElement} - The minimum amount out input component.
 */
const MinAmountOutInput: FC = (): ReactElement => {
    const {
        fundDetails: { allowedTokens, fundToken },
        fundState: { fundTokenPrice }
    } = useFundContext();
    const { handleBlur } = useFormikContext();
    const [_tokenField, { value: tokenAddress }] = useField<EnumType<string>>('tokenAddress');
    const { price: tokenPrice, decimals: tokenPriceDecimals } = useChainlinkOracle(
        allowedTokens[tokenAddress.value]?.oracle || ''
    );
    const [_amountInField, { value: amountIn }] = useField<string>('amountIn');
    const [{ name }, { value }, { setValue }] = useField<string>('minAmountOut');
    const [actualAmountOut, setActualAmountOut] = useState<Nullable<BigNumber>>(null);

    useEffect(() => {
        if (!tokenPrice || !fundTokenPrice || !allowedTokens[tokenAddress.value]) return;
        if (!amountIn) {
            setValue('');
            return;
        }

        // amt_in * token_price / fund_token_price
        const amountOut = BigNumber.from(amountIn).mul(tokenPrice).div(fundTokenPrice);
        const adjAmountOut = adjustDecimals(
            amountOut,
            // decimals in: tokenDecimals + tokenPriceDecimals - fundTokenPriceDecimals
            allowedTokens[tokenAddress.value].decimals + tokenPriceDecimals - fundToken.decimals,
            fundToken.decimals
        );

        setActualAmountOut(adjAmountOut);

        // Display CONSERVATIVE_PCT of actual computed amount
        const conservativeAmountOut = adjAmountOut.mul(CONSERVATIVE_PCT).div(100);
        setValue(conservativeAmountOut.toString());

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenAddress.value, amountIn, tokenPrice, fundTokenPrice]);

    return (
        <div>
            <label
                htmlFor={name}
                className="h-8 flex items-center text-sm lg:text-base font-semibold">
                Minimum Amount Fund Token Out
            </label>
            <BigNumberInput
                decimals={fundToken.decimals}
                value={value}
                onChange={setValue}
                renderInput={(props) => (
                    <input
                        {...props}
                        id={name}
                        aria-label={name}
                        placeholder="The minimum amount for transaction to succeed"
                        className="h-10 w-full px-3 border-1 rounded-lg appearance-none border focus:outline-none data-hj-allow"
                        onBlur={handleBlur}
                    />
                )}
            />
            {actualAmountOut && (
                <p className="mt-1 ml-3 text-sm italic">
                    Based on {CONSERVATIVE_PCT}% of&nbsp;
                    {bigNumberToDecimalString(
                        actualAmountOut,
                        fundToken.decimals,
                        fundToken.decimals
                    )}
                    &nbsp;(computed amount)
                </p>
            )}
        </div>
    );
};

export default MinAmountOutInput;
