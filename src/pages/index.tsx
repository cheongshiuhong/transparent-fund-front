// Types
import type { NextPage } from 'next';
import type { ReactElement } from 'react';

// Libraries
import Head from 'next/head';
import { useEffect } from 'react';

// Code
// import Layout from '@components/layout';
// import Navigation from '@features/navigation';
// import Overview from '@features/overview';

// import Requests from '@features/requests';
import useRouter from '@hooks/useRouter';

/**
 * The home page.
 *
 * @returns {ReactElement} - The home page component.
 */
const HomePage: NextPage = (): ReactElement => {
    const { redirect } = useRouter();

    // Redirect to incentives for now before dashboard is ready
    useEffect(() => {
        redirect('/requests');

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <Head>
                <title>Transparent</title>
                <meta name="description" content="Transparent" />
                <link rel="icon" href="/translucent_logo.png" />
            </Head>
            {/* <p className="w-full text-center">Coming Soon</p> */}
        </div>
    );
};

export default HomePage;
