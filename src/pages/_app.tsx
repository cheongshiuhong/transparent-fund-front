// Types
import type { AppProps } from 'next/app';
import type { FC, ReactElement } from 'react';

// Contexts
import { FundContextProvider } from '@contexts/fund';
import { Web3ContextProvider } from '@contexts/web3';

// Code
import Layout from '@components/layout';

// Styles
import '@styles/globals.css';

/**
 * The main app component.
 *
 * @param {AppProps} props - The app's props.
 * @returns {ReactElement} - The app component.
 */
const App: FC<AppProps> = ({ Component, pageProps }: AppProps): ReactElement => {
    return (
        <Web3ContextProvider>
            <FundContextProvider>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </FundContextProvider>
        </Web3ContextProvider>
    );
};

export default App;
