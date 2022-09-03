// Types
import type { FC, ReactElement } from 'react';

// Libraries
import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { BigNumber } from '@ethersproject/bignumber';
import { BigNumberInput } from 'big-number-input';

// Contexts
import { useFundContext } from '@contexts/fund';

// Code
import TransactButton from '@components/ui/TransactButton';
import bigNumberToDecimalString from '@utils/numbers/bigNumberToDecimalString';

type WithdrawalFormProps = {
    withdraw: (amount: BigNumber) => Promise<void>;
    isWithdrawing: boolean;
    isAwaitingConfirmation: boolean;
    withdrawableAmount: BigNumber;
    onDone: () => void;
};
type WithdrawalFormInputs = {
    amount: string;
};

/**
 * The referral incentive withdrawal form.
 *
 * @param {WithdrawalFormProps} props - The form props.
 * @returns {ReactElement} - The withdrawal form.
 */
const WithdrawalForm: FC<WithdrawalFormProps> = ({
    withdraw,
    isWithdrawing,
    isAwaitingConfirmation,
    withdrawableAmount,
    onDone
}: WithdrawalFormProps): ReactElement => {
    const {
        fundDetails: { fundToken }
    } = useFundContext();
    const [withdrawalError, setWithdrawalError] = useState<string>('');

    /**
     * Submits the form
     *
     * @param {WithdrawalFormInputs} values - The form input values.
     */
    const submitWithdrawal = async (values: WithdrawalFormInputs): Promise<void> => {
        setWithdrawalError('');

        try {
            await withdraw(BigNumber.from(values.amount));
            onDone();
        } catch (err) {
            setWithdrawalError(`Error: ${err.message}`);
        }
    };

    return (
        <Formik
            initialValues={{ amount: '' }}
            validationSchema={Yup.object().shape({
                amount: Yup.string().required('Required')
            })}
            onSubmit={submitWithdrawal}>
            {({ values, setValues, errors, handleBlur, submitForm }) => (
                <Form>
                    <p className="h-10 text-lg font-bold">Withdrawal Form</p>
                    <label
                        htmlFor="amount"
                        className="h-8 flex items-center text-sm lg:text-base font-semibold">
                        Fund Token Amount
                    </label>
                    <BigNumberInput
                        decimals={fundToken.decimals}
                        value={values.amount}
                        max={withdrawableAmount.toString()}
                        onChange={(value) => setValues({ ...values, amount: value })}
                        renderInput={(props) => (
                            <input
                                {...props}
                                id="amount"
                                aria-label="amount"
                                placeholder="The exact amount of input fund tokens"
                                className="h-10 w-full px-3 broder-1 rounded-lg appearance-none border focus:outline-none data-hj-allow"
                                onBlur={handleBlur}
                            />
                        )}
                    />
                    <p className="mt-1 ml-3 text-sm italic">
                        Max&nbsp;
                        {bigNumberToDecimalString(
                            withdrawableAmount,
                            fundToken.decimals,
                            fundToken.decimals
                        )}
                    </p>
                    <p className="mt-1 ml-3 text-sm text-red-500 italic">{errors.amount}</p>
                    <div className="h-4"></div>
                    <TransactButton
                        type="button"
                        className="px-3 py-2 h-10 w-full bg-green-600 text-white rounded-xl"
                        onClick={submitForm}
                        disabled={!!Object.keys(errors).length}
                        isSubmitting={isWithdrawing}
                        isAwaitingConfirmation={isAwaitingConfirmation}>
                        Submit
                    </TransactButton>
                    <p className="mt-1 ml-3 text-sm text-red-500 italic">{withdrawalError}</p>
                </Form>
            )}
        </Formik>
    );
};

export default WithdrawalForm;
