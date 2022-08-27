// Types
import type { FC, ReactElement } from 'react';
import type { EnumType } from '@interfaces/general';

// Libraries
import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useRequestsContext } from '@contexts/requests';

// Code
import TokenSelector from '../TokenSelector';
import AmountInInput from './AmountInInput';
import MinAmountOutInput from './MinAmountOutInput';
import BlockDeadlineInput from '../BlockDeadlineInput';
import IncentiveSelector from './IncentiveSelector';
import SubmissionButtons from '../SubmissionButtons';

type DepositRequestInput = {
    tokenAddress: EnumType<string>;
    amountIn: string;
    minAmountOut: string;
    blockDeadline: string;
    incentiveAddress: EnumType<string>;
};

/**
 * The request deposit form component.
 *
 * @returns {ReactElement} - The request deposit form component.
 */
const RequestDepositForm: FC = (): ReactElement => {
    const { requestDeposit } = useRequestsContext();
    const [error, setError] = useState<string>('');

    /**
     * Callback to handle the submission of the deposit request.
     *
     * @param {DepositRequestInput} values - The input values.
     */
    const onSubmit = async (values: DepositRequestInput): Promise<void> => {
        setError('');

        // Make the request
        try {
            await requestDeposit({
                tokenAddress: values.tokenAddress.value,
                amountIn: BigNumber.from(values.amountIn),
                minAmountOut: BigNumber.from(values.minAmountOut),
                blockDeadline: BigNumber.from(values.blockDeadline),
                incentiveAddress: values.incentiveAddress.value || ethers.constants.AddressZero
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
            <p className="text-center text-lg md:text-xl font-bold">Request Deposit</p>
            <div className="h-8"></div>
            <Formik
                initialValues={
                    {
                        tokenAddress: { label: '', value: '' },
                        amountIn: '',
                        minAmountOut: '',
                        blockDeadline: '',
                        incentiveAddress: { label: '', value: '' }
                    } as DepositRequestInput
                }
                validationSchema={Yup.object().shape({
                    amountIn: Yup.string().required('Required'),
                    minAmountOut: Yup.string().required('Required'),
                    blockDeadline: Yup.string().required('Required')
                })}
                onSubmit={onSubmit}>
                {({ values, errors, touched }) => (
                    <Form className="space-y-2">
                        <div>
                            <TokenSelector />
                        </div>
                        <div>
                            <AmountInInput />
                            <p className="mt-1 ml-3 text-xs lg:text-sm text-red-500 italic">
                                {touched.amountIn && errors.amountIn}
                            </p>
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
                        <div>
                            <IncentiveSelector />
                        </div>
                        <div className="pt-4 w-full flex items-center">
                            <SubmissionButtons approvalToken={values.tokenAddress.value} />
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

export default RequestDepositForm;
