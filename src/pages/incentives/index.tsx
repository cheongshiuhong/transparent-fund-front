// Types
import type { NextPage } from 'next';
import type { ReactElement } from 'react';

// Libraries
import Head from 'next/head';

// Code
import { ListIncentives } from '@features/incentives';

/**
 * The incentives page.
 *
 * @returns {ReactElement} - The incentives page component.
 */
const IncentivesPage: NextPage = (): ReactElement => {
    return (
        <div>
            <Head>
                <title>Tranparent Fund</title>
                <meta name="description" content="Tranparent Fund" />
                <link rel="icon" href="/translucent_logo.png" />
            </Head>
            <ListIncentives />
        </div>
    );
};

export default IncentivesPage;
