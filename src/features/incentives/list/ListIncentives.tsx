// Types
import type { FC, ReactElement } from 'react';

// Contexts
import { useFundContext } from '@contexts/fund';

// Code
import useIncentives from './hooks/useIncentives';

/**
 * The list incentives component.
 *
 * @returns {ReactElement} - The list incentives component.
 */
const ListIncentives: FC = (): ReactElement => {
    const {
        fundDetails: { incentives }
    } = useFundContext();
    const { incentivesDetails } = useIncentives();

    return (
        <div>
            {JSON.stringify(incentives)}
            <br />
            {JSON.stringify(incentivesDetails)}
        </div>
    );
};

export default ListIncentives;
