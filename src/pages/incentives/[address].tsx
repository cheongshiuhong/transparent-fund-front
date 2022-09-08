// Types
import type { NextPage } from 'next';
import type { ReactElement } from 'react';

// Libraries
import Head from 'next/head';

// Code
import { RetrieveIncentive } from '@features/incentives';
// import Layout from '@components/layout';
// import Navigation from '@features/navigation';
// import Overview from '@features/overview';

// import Requests from '@features/requests';

/**
 * The incentive page.
 *
 * @returns {ReactElement} - The incentive page component.
 */
const IncentivePage: NextPage = (): ReactElement => {
    return (
        <div>
            <Head>
                <title>Tranparent Fund</title>
                <meta name="description" content="Tranparent Fund" />
                <link rel="icon" href="/translucent_logo.png" />
            </Head>
            <RetrieveIncentive />
        </div>
    );
};

export default IncentivePage;
