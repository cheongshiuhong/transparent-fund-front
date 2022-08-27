// Types
import type { FC, ReactElement } from 'react';

// Libraries
import Error from 'next/error';

// Contexts
import { useFundContext } from '@contexts/fund';

// Code
import useRouter from '@hooks/useRouter';
import Spinner from '@components/ui/Spinner';
import addresses from '@constants/addresses';
import ReferralIncentive from './referral/ReferralIncentive';

/** Mapping of address to the component */
const mapping: Record<string, FC> = {
    [addresses.referralIncentive]: ReferralIncentive
};

/**
 * The retrieve incentive component to route to the custom incentive component.
 *
 * @returns {ReactElement} - The retrieve incentive component.
 */
const RetrieveIncentive: FC = (): ReactElement => {
    const {
        isLoading: isFundLoading,
        fundDetails: { incentives }
    } = useFundContext();
    const { query } = useRouter<{ address?: string }>();

    // Router still loading
    if (!query.address || isFundLoading) {
        return <Spinner />;
    }

    if (!Object.keys(incentives).includes(query.address)) {
        // Not active and not specified in mapping (404)
        if (!mapping[query.address]) {
            return <Error statusCode={404} />;
        }

        // Not active but in mapping (Retired)
        return <>Retired</>;
    }

    // Active but not in mapping (Coming soon)
    if (!mapping[query.address]) {
        return <>Coming soon</>;
    }

    // Active and in mapping
    const Component = mapping[query.address];
    return (
        <>
            <Component />
        </>
    );
};

export default RetrieveIncentive;
