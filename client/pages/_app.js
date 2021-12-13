import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/buildClient';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
    return (
        <div>
            <Header currentUser={currentUser} />
            <div className="container">
                <Component currentUser={currentUser} {...pageProps} />
            </div>
        </div>
    );
};

AppComponent.getInitialProps = async ({ Component, ctx }) => {
    const client = buildClient(ctx);
    const { data } = await client.get('/api/users/currentuser');

    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx, client, data.currentUser) : {};

    return {
        pageProps,
       ...data
    };
};

export default AppComponent;
