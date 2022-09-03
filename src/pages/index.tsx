// Types
import type { NextPage } from 'next';
import type { ReactElement } from 'react';

// Libraries
import Head from 'next/head';

// Code
// import Layout from '@components/layout';
// import Navigation from '@features/navigation';
// import Overview from '@features/overview';

// import Requests from '@features/requests';

/**
 * The home page.
 *
 * @returns {ReactElement} - The home page component.
 */
const HomePage: NextPage = (): ReactElement => {
    return (
        <div>
            <Head>
                <title>Tranparent Fund</title>
                <meta name="description" content="Tranparent Fund" />
                <link rel="icon" href="/translucent.png" />
            </Head>
            <p className="w-full text-center">Coming Soon</p>
        </div>
    );
};

export default HomePage;
