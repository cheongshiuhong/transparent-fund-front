// Types
import type { FC, ReactElement } from 'react';

// Contexts
import { useFundContext } from '@contexts/fund';

// Code
import Spinner from '@components/ui/Spinner';
import useRouter from '@hooks/useRouter';
import useIncentives from './hooks/useIncentives';

/**
 * The list incentives component.
 *
 * @returns {ReactElement} - The list incentives component.
 */
const ListIncentives: FC = (): ReactElement => {
    const { redirect } = useRouter();
    const {
        fundDetails: { incentives }
    } = useFundContext();
    const { incentivesDetails } = useIncentives();

    return (
        <div className="w-full">
            <div className="h-8"></div>
            <p className="text-center text-lg font-bold">Incentives</p>
            <div className="h-8"></div>
            <div className="w-full max-w-[560px] mx-auto space-y-4">
                {!Object.entries(incentives).length && <Spinner />}
                {Object.entries(incentives).map(([address, incentive]) =>
                    incentivesDetails[address] ? (
                        <div
                            key={address}
                            className="px-4 py-4 text-left bg-white rounded-md shadow-lg">
                            <p>
                                <span className="font-semibold">Name</span>:&nbsp;
                                <span>{incentive.name}</span>
                            </p>
                            <p>
                                <span className="font-semibold">Address</span>:&nbsp;
                                <span>{address}</span>
                            </p>
                            <p>
                                <span className="font-semibold">Is Qualified</span>:&nbsp;
                                <span>
                                    {incentivesDetails[address].isUserQualified ? (
                                        <>Yes</>
                                    ) : (
                                        <>No (Click here for more details)</>
                                    )}
                                </span>
                            </p>
                            <div className="w-full flex items-center justify-end">
                                <button
                                    onClick={() => redirect(`/incentives/${address}`)}
                                    className="px-2 py-1 bg-green-600 text-white rounded-md shadow-md">
                                    View
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div key={address} className="w-full mx-auto">
                            <Spinner />
                        </div>
                    )
                )}
                <br />
            </div>
        </div>
    );
};

export default ListIncentives;
