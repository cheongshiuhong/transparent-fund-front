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
import useIncentiveQualification from '../../hooks/useIncentiveQualification';

/**
 * The incentive selector component.
 *
 * @returns {ReactElement} - The incentive selector component.
 */
const IncentiveSelector: FC = (): ReactElement => {
    const {
        fundDetails: { incentives }
    } = useFundContext();
    const [{ name }, { value }, { setValue, setError }] =
        useField<EnumType<string>>('incentiveAddress');
    const [options, setOptions] = useState<EnumType<string>[]>([]);
    const { isUserQualified } = useIncentiveQualification(value.value);

    /** Effect to set the options when incentives available changes */
    useEffect(() => {
        const options = [
            { label: 'None', value: '' },
            ...Object.entries(incentives).map(([address, { name }]) => ({
                label: name,
                value: address
            }))
        ];

        if (!options.length) return;

        setValue(options[0]);
        setOptions(options);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** Effect to validate and add an error to prevent submission */
    useEffect(() => {
        if (isUserQualified === false) {
            setError('error');
            return;
        }

        // null/true - set undefined to remove from errors object
        setError(undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isUserQualified]);

    return (
        <div>
            <label
                htmlFor={name}
                className="h-8 flex items-center text-sm lg:text-base font-semibold">
                Incentive
            </label>
            <Select
                id={name}
                aria-label={name}
                placeholder="Incentive"
                name={name}
                options={options}
                value={value}
                onChange={(value) => setValue(value as EnumType<string>)}
                styles={selectStyles}
                closeMenuOnSelect
                isClearable={false}
            />
            {/* Custom message to reroute to incentives if error */}
            {isUserQualified === false && (
                <p className="mt-1 ml-3 text-sm">
                    <span className="text-red-500 italic cursor-pointer">
                        You do not qualify for this incentive.&nbsp;
                    </span>
                    <a
                        href={`/incentives/${value.value}`}
                        target="_blank"
                        rel="noopener noreferrer">
                        <span className="text-blue-700 underline cursor-pointer">
                            Please first register here
                        </span>
                    </a>
                    .
                </p>
            )}
        </div>
    );
};

export default IncentiveSelector;
