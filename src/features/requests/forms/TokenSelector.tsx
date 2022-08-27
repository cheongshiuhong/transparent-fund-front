// Types
import type { FC, ReactElement } from 'react';
import type { EnumType } from '@interfaces/general';

// Libraries
import { useState, useEffect } from 'react';
import Select from 'react-select';
import { useField } from 'formik';

// Contexts
import { useFundContext } from '@contexts/fund';

// Code
import selectStyles from '@components/config/selectStyles';
// import { calls } from '@utils/abis';

/**
 * The token selector component.
 *
 * @returns {ReactElement} - The token selector component.
 */
const TokenSelector: FC = (): ReactElement => {
    const {
        fundDetails: { allowedTokens }
    } = useFundContext();
    const [{ name }, { value }, { setValue }] = useField<EnumType<string>>('tokenAddress');
    const [options, setOptions] = useState<EnumType<string>[]>([]);

    /** Effect to set the options when allowedTokens changes */
    useEffect(() => {
        const options = Object.entries(allowedTokens).map(([address, { name, symbol }]) => ({
            label: `${name} (${symbol})`,
            value: address
        }));

        if (!options.length) return;

        setValue(options[0]);
        setOptions(options);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allowedTokens]);

    return (
        <div>
            <label
                htmlFor={name}
                className="h-8 flex items-center text-sm lg:text-base font-semibold">
                Token
            </label>
            <Select
                id={name}
                aria-label={name}
                placeholder="Token"
                name={name}
                options={options}
                value={value}
                onChange={(value) => setValue(value as EnumType<string>)}
                styles={selectStyles}
                closeMenuOnSelect
                isClearable={false}
            />
        </div>
    );
};

export default TokenSelector;
