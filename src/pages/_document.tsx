/* eslint-disable react/react-in-jsx-scope */
import Document, {
    DocumentContext,
    Html,
    Head,
    Main,
    NextScript,
    DocumentInitialProps
} from 'next/document';

/** The main html document page render */
export default class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
        const initialProps = await Document.getInitialProps(ctx);

        return initialProps;
    }

    render(): React.ReactElement {
        return (
            <Html>
                <Head>
                    <link
                        href="https://fonts.googleapis.com/css2?family=Russo+One&display=swap"
                        rel="stylesheet"
                    />
                </Head>
                <body className="bg-white-300">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
