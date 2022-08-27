// Types
import type { FC, ReactElement } from 'react';
import type { EnumType } from '@interfaces/general';

// Libraries
import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useFundContext } from '@contexts/fund';
import { useRequestsContext } from '@contexts/requests';

// Code
import TokenSelector from '../TokenSelector';
import AmountInInput from './AmountInInput';
import MinAmountOutInput from './MinAmountOutInput';
import BlockDeadlineInput from '../BlockDeadlineInput';
import SubmissionButtons from '../SubmissionButtons';

type WithdrawalRequestInput = {
    tokenAddress: EnumType<string>;
    amountIn: string;
    minAmountOut: string;
    blockDeadline: string;
};

/**
 * The request withdrawal form component.
 *
 * @returns {ReactElement} - The request withdrawal form component.
 */
const RequestWithdrawalForm: FC = (): ReactElement => {
    const {
        fundDetails: { fundToken }
    } = useFundContext();
    const { requestWithdrawal } = useRequestsContext();
    const [error, setError] = useState<string>('');

    /**
     * Callback to handle the submission of the withdrawal request.
     *
     * @param {WithdrawalRequestInput} values - The input values.
     */
    const onSubmit = async (values: WithdrawalRequestInput): Promise<void> => {
        setError('');

        // Make the request
        try {
            await requestWithdrawal({
                tokenAddress: values.tokenAddress.value,
                amountIn: BigNumber.from(values.amountIn),
                minAmountOut: BigNumber.from(values.minAmountOut),
                blockDeadline: BigNumber.from(values.blockDeadline)
            });
        } catch (err) {
            setError(`Error: ${err.message}`);

            // re-throw the error to default on the transaction status updates
            // i.e., revert to a submittable button instead of 'waiting for confirmation'
            throw err;
        }
    };

    return (
        <div>
            <p className="text-center text-lg md:text-xl font-bold">Request Withdrawal</p>
            <div className="h-8"></div>
            <Formik
                initialValues={
                    {
                        tokenAddress: { label: '', value: '' },
                        amountIn: '',
                        minAmountOut: '',
                        blockDeadline: ''
                    } as WithdrawalRequestInput
                }
                validationSchema={Yup.object().shape({
                    amountIn: Yup.string().required('Required'),
                    minAmountOut: Yup.string().required('Required'),
                    blockDeadline: Yup.string().required('Required')
                })}
                onSubmit={onSubmit}>
                {({ errors, touched }) => (
                    <Form className="space-y-2">
                        <div>
                            <AmountInInput />
                            <p className="mt-1 ml-3 text-xs lg:text-sm text-red-500 italic">
                                {touched.amountIn && errors.amountIn}
                            </p>
                        </div>
                        <div>
                            <TokenSelector />
                        </div>
                        <div>
                            <MinAmountOutInput />
                            <p className="mt-1 ml-3 text-xs lg:text-sm text-red-500 italic">
                                {touched.minAmountOut && errors.minAmountOut}
                            </p>
                        </div>
                        <div>
                            <BlockDeadlineInput />
                            <p className="mt-1 ml-3 text-xs lg:text-sm text-red-500 italic">
                                {touched.blockDeadline && errors.blockDeadline}
                            </p>
                        </div>
                        <div className="pt-4 w-full flex items-center">
                            <SubmissionButtons approvalToken={fundToken.address} />
                        </div>
                        <p className="w-full text-center text-sm lg:text-base  text-red-500 italic">
                            {error}
                        </p>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default RequestWithdrawalForm;
