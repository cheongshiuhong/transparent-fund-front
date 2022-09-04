// Types
import type { FC, ReactElement } from 'react';
import type { Nullable, EnumType } from '@interfaces/general';

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
 * The minimum am,ount out input component.
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

        // amt_in * fund_token_price / token_price
        const amountOut = BigNumber.from(amountIn).mul(fundTokenPrice).div(tokenPrice);
        const adjAmountOut = adjustDecimals(
            amountOut,
            // decimals in: fundTokenDecimals + fundTokenPriceDecimals - tokenPriceDecimals
            2 * fundToken.decimals - tokenPriceDecimals,
            allowedTokens[tokenAddress.value].decimals
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
                Minimum Amount Token Out
            </label>
            <BigNumberInput
                decimals={allowedTokens[tokenAddress.value]?.decimals || 18}
                value={value}
                onChange={setValue}
                renderInput={(props) => (
                    <input
                        {...props}
                        id={name}
                        aria-label={name}
                        placeholder="The minimum amount for transaction to suceceed"
                        className="h-10 w-full px-3 border-1 rounded-lg appearance-none border focus:outline-none data-hj-allow"
                        onBlur={handleBlur}
                    />
                )}
            />
            {actualAmountOut && (
                <p className="mt-1 ml3 text-sm italic">
                    Based on {CONSERVATIVE_PCT}% of&nbsp;
                    {bigNumberToDecimalString(
                        actualAmountOut,
                        allowedTokens[tokenAddress.value]?.decimals || 18,
                        allowedTokens[tokenAddress.value]?.decimals || 18
                    )}
                    &nbsp;(computed amount)
                </p>
            )}
        </div>
    );
};

export default MinAmountOutInput;
