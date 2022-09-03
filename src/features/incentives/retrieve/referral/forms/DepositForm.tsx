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
import addresses from '@constants/addresses';
import TransactButton from '@components/ui/TransactButton';
import bigNumberToDecimalString from '@utils/numbers/bigNumberToDecimalString';
import useTokenApproval from '@hooks/useTokenApproval';

type DepositFormProps = {
    deposit: (amount: BigNumber) => Promise<void>;
    isDepositing: boolean;
    isAwaitingConfirmation: boolean;
    onDone: () => void;
};
type DepositFormInputs = {
    amount: string;
};

/**
 * The referral incentive deposit form.
 *
 * @param {DepositFormProps} props - The form props.
 * @returns {ReactElement} - The deposit form.
 */
const DepositForm: FC<DepositFormProps> = ({
    deposit,
    isDepositing,
    isAwaitingConfirmation,
    onDone
}: DepositFormProps): ReactElement => {
    const {
        userFundTokenBalance,
        fundDetails: { fundToken }
    } = useFundContext();
    const {
        isApproving,
        isAwaitingConfirmation: isAwaitingApprovalConfirmation,
        isAllowanceSufficient,
        approve
    } = useTokenApproval(fundToken.address, addresses.referralIncentive);
    const [approvalError, setApprovalError] = useState<string>('');
    const [depositError, setDepositError] = useState<string>('');

    /** Submits the approval */
    const submitApproval = async (): Promise<void> => {
        setApprovalError('');

        try {
            await approve();
        } catch (err) {
            setApprovalError(`Error: ${err.message}`);
        }
    };

    /**
     * Submits the form
     *
     * @param {DepositFormInputs} values - The form input values.
     */
    const submitDeposit = async (values: DepositFormInputs): Promise<void> => {
        setDepositError('');

        try {
            await deposit(BigNumber.from(values.amount));
            onDone();
        } catch (err) {
            setDepositError(`Error: ${err.message}`);
        }
    };

    return (
        <Formik
            initialValues={{ amount: '' }}
            validationSchema={Yup.object().shape({
                amount: Yup.string().required('Required')
            })}
            onSubmit={submitDeposit}>
            {({ values, setValues, errors, handleBlur, submitForm }) => (
                <Form>
                    <p className="h-10 text-lg font-bold">Deposit Form</p>
                    <label
                        htmlFor="amount"
                        className="h-8 flex items-center text-sm lg:text-base font-semibold">
                        Fund Token Amount
                    </label>
                    <BigNumberInput
                        decimals={fundToken.decimals}
                        value={values.amount}
                        max={userFundTokenBalance.toString()}
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
                            userFundTokenBalance,
                            fundToken.decimals,
                            fundToken.decimals
                        )}
                    </p>
                    <p className="mt-1 ml-3 text-sm text-red-500 italic">{errors.amount}</p>
                    <div className="h-4"></div>
                    {isAllowanceSufficient ? (
                        <>
                            <TransactButton
                                type="button"
                                className="px-3 py-2 h-10 w-full bg-green-600 text-white rounded-xl"
                                onClick={submitForm}
                                disabled={!!Object.keys(errors).length}
                                isSubmitting={isDepositing}
                                isAwaitingConfirmation={isAwaitingConfirmation}>
                                Submit
                            </TransactButton>
                            <p className="mt-1 ml-3 text-sm text-red-500 italic">{depositError}</p>
                        </>
                    ) : (
                        <>
                            <TransactButton
                                type="button"
                                className="px-3 py-2 h-10 w-full bg-green-600 text-white rounded-xl
                                disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={submitApproval}
                                disabled={!!Object.keys(errors).length}
                                isSubmitting={isApproving}
                                isAwaitingConfirmation={isAwaitingApprovalConfirmation}>
                                Approve
                            </TransactButton>
                            <p className="mt-1 ml-3 text-sm text-red-500 italic">{approvalError}</p>
                            <p className="py-2 text-center text-xs md:text-sm italic">
                                Approval required before request submission
                            </p>
                        </>
                    )}
                </Form>
            )}
        </Formik>
    );
};

export default DepositForm;
