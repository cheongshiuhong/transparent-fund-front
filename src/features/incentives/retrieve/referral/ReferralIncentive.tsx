// Types
import type { FC, ReactElement } from 'react';

// Code
import Spinner from '@components/ui/Spinner';
import useReferralIncentive from './hooks/useReferralIncentive';
import RegisterForm from './RegisterForm';

/**
 * The referral incentive component.
 *
 * @returns {ReactElement} - The referral incentive component.
 */
const ReferralIncentive: FC = (): ReactElement => {
    const { isRegistering, isUserRegistered, userDetails, register } = useReferralIncentive();

    return (
        <div className="h-full w-full max-w-[440px] mx-auto">
            <div>Description about referral incentive here.</div>
            <div className="h-10"></div>
            <div className="w-full">
                {/* Still loading */}
                {isUserRegistered === null && <Spinner />}

                {/* User is not yet registered */}
                {isUserRegistered === false && (
                    <div className="w-full space-y-8">
                        <p className="text-center">User is not registered</p>
                        <RegisterForm isRegistering={isRegistering} register={register} />
                    </div>
                )}

                {/* User is registered */}
                {isUserRegistered === true && (
                    <div>
                        <p className="text-center">User is already registered</p>
                        <p>Referrer: {userDetails && userDetails.referrer}</p>
                        <p>
                            Referees:&nbsp;
                            {userDetails &&
                                (userDetails.referees.length ? (
                                    <>{userDetails.referees}</>
                                ) : (
                                    <>No referees yet. Share with your friends!</>
                                ))}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReferralIncentive;
