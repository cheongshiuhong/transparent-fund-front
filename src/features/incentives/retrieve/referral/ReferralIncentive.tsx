// Types
import type { FC, ReactElement } from 'react';

// Libraries
import { useState } from 'react';

// Code
import Spinner from '@components/ui/Spinner';
import Modal from '@components/ui/Modal';
import bigNumberToDecimalString from '@utils/numbers/bigNumberToDecimalString';
import useReferralIncentive from './hooks/useReferralIncentive';
import RegisterForm from './forms/RegisterForm';
import DepositForm from './forms/DepositForm';
import WithdrawalForm from './forms/WithdrawalForm';

/**
 * The referral incentive component.
 *
 * @returns {ReactElement} - The referral incentive component.
 */
const ReferralIncentive: FC = (): ReactElement => {
    const {
        isTransacting,
        isAwaitingConfirmation,
        isUserRegistered,
        userDetails,
        userBalance,
        register,
        deposit,
        withdraw
    } = useReferralIncentive();
    const [isDepositFormOpen, setIsDepositFormOpen] = useState<boolean>(false);
    const [isWithdrawalFormOpen, setIsWithdrawalFormOpen] = useState<boolean>(false);

    return (
        <div className="h-full w-full max-w-[560px] mx-auto">
            <div className="w-full">
                <p className="text-lg font-semibold">Referral Incentive</p>
                <p>Deposit your tokens here to be a part of our profit sharing program.</p>
            </div>
            <div className="h-10"></div>
            <div className="w-full">
                {/* Still loading */}
                {isUserRegistered === null && <Spinner />}

                {/* User is not yet registered */}
                {isUserRegistered === false && (
                    <div className="w-full max-w-[440px] mx-auto space-y-8">
                        <p className="text-center">User is not registered</p>
                        <RegisterForm
                            isRegistering={isTransacting}
                            isAwaitingConfirmation={isAwaitingConfirmation}
                            register={register}
                        />
                    </div>
                )}

                {/* User is registered */}
                {isUserRegistered === true && (
                    <div className="px-4 py-4 bg-white rounded-md shadow-lg">
                        <p className="text-center text-md font-semibold">User is registered</p>
                        <div className="h-6"></div>
                        <div className="flex items-center justify-between space-x-4">
                            <div>
                                <span className="font-semibold">Balance</span>:&nbsp;
                                {bigNumberToDecimalString(userBalance, 18, 4)}
                            </div>
                            <div className="flex-items-center justify-end sm:space-x-2 md:space-x-4">
                                <button
                                    onClick={() => setIsDepositFormOpen(true)}
                                    className="px-2 py-1 bg-green-600 text-white rounded-md shadow-md">
                                    Deposit
                                </button>
                                <button
                                    onClick={() => setIsWithdrawalFormOpen(true)}
                                    className="px-2 py-1 border border-red-500 text-red-500 rounded-md shadow-md ">
                                    Withdraw
                                </button>
                            </div>
                        </div>
                        <div className="h-4"></div>
                        <p className="font-semibold">Referrer:</p>
                        <p>{userDetails && userDetails.referrer}</p>
                        <div className="h-2"></div>
                        <p className="font-semibold">Referee(s):</p>
                        <div>
                            {userDetails &&
                                (userDetails.referees.length ? (
                                    userDetails.referees.map((referee) => (
                                        <p key={referee}>{referee}</p>
                                    ))
                                ) : (
                                    <>No referees yet. Share with your friends!</>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={isDepositFormOpen} onClose={() => setIsDepositFormOpen(false)}>
                <DepositForm
                    deposit={deposit}
                    isDepositing={isTransacting}
                    isAwaitingConfirmation={isAwaitingConfirmation}
                    onDone={() => setIsDepositFormOpen(false)}
                />
            </Modal>
            <Modal isOpen={isWithdrawalFormOpen} onClose={() => setIsWithdrawalFormOpen(false)}>
                <WithdrawalForm
                    withdraw={withdraw}
                    isWithdrawing={isTransacting}
                    isAwaitingConfirmation={isAwaitingConfirmation}
                    withdrawableAmount={userBalance}
                    onDone={() => setIsWithdrawalFormOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default ReferralIncentive;
