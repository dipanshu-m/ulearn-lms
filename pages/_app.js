import Root from '../components/Layout';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <Root>
      <Component {...pageProps} />
    </Root>
  );
}

export default MyApp;
