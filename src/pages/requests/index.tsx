// Types
import type { NextPage } from 'next';
import type { ReactElement } from 'react';

// Libraries
import Head from 'next/head';

// Contexts
import { RequestsContextProvider } from '@contexts/requests';

// Code
import Requests from '@features/requests';

/**
 * The requests page.
 *
 * @returns {ReactElement} - The requests page component.
 */
const RequestsPage: NextPage = (): ReactElement => {
    return (
        <div>
            <Head>
                <title>Transparent</title>
                <meta name="description" content="Transparent" />
                <link rel="icon" href="/translucent_logo.png" />
            </Head>
            <RequestsContextProvider>
                <Requests />
            </RequestsContextProvider>
        </div>
    );
};

export default RequestsPage;
