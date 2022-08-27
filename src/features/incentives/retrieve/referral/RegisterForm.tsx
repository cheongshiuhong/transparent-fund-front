// Types
import type { FC, ReactElement } from 'react';

// Libraries
import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

// Code
import TransactButton from '@components/ui/TransactButton';

type RegisterFormInputs = {
    referrerAddress: string;
};
type RegisterFormProps = {
    isRegistering: boolean;
    register: (referrerAddress: string) => Promise<void>;
};

/**
 * The register form component.
 *
 * @param {RegisterFormProps} props - The registering state and function.
 * @returns {ReactElement} - The register form component.
 */
const RegisterForm: FC<RegisterFormProps> = ({
    isRegistering,
    register
}: RegisterFormProps): ReactElement => {
    const [error, setError] = useState<string>('');

    /**
     * Submits the form to register the user.
     *
     * @param {RegisterFormInputs} values - The form values to submit.
     */
    const onSubmit = async (values: RegisterFormInputs): Promise<void> => {
        setError('');
        try {
            await register(values.referrerAddress);
        } catch (err) {
            setError(`Error: ${err.message}`);
        }
    };

    return (
        <Formik
            initialValues={
                {
                    referrerAddress: ''
                } as RegisterFormInputs
            }
            validationSchema={Yup.object().shape({
                referrerAddress: Yup.string().required('Required')
            })}
            onSubmit={onSubmit}>
            {({ values, setValues, errors, submitForm }) => (
                <Form className="space-y-6">
                    <div className="w-full">
                        <label
                            htmlFor="referrerAddress"
                            className="h-8 flex items-center text-sm lg:text-base font-semibold">
                            Referrer Address
                        </label>
                        <input
                            id="referrerAddress"
                            aria-label="referrerAddress"
                            name="referrerAddress"
                            placeholder="0x..."
                            value={values.referrerAddress}
                            onChange={(e) =>
                                setValues({ ...values, referrerAddress: e.target.value })
                            }
                            className="h-10 w-full px-3 border-1 rounded-lg appearance-none border focus:outline-none data-hj-allow"
                        />
                        <p className="mt-1 ml-3 text-sm text-red-500 italic">
                            {errors.referrerAddress}
                        </p>
                    </div>
                    <div className="flex items-center justify-center">
                        <TransactButton
                            className="px-4 py-2 h-10 bg-green-600 text-white rounded-md shadow-md"
                            onClick={submitForm}
                            isSubmitting={isRegistering}
                            disabled={!!Object.keys(errors).length || isRegistering}>
                            Register Now!
                        </TransactButton>
                        <p className="text-sm text-red-500 italic">{error}</p>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default RegisterForm;
