import { ApolloProvider } from '@apollo/client/react';
import { IconContext } from '@phosphor-icons/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './app/App';
import { ThemeProvider } from './app/theme/ThemeProvider';
import { createApolloClient } from './lib/apollo-client';
import { apiUrl } from './lib/config';
import './styles/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

// Phosphor icons are decorative everywhere: a visible label always sits next to them
const ICON_DEFAULTS = { size: 20, weight: 'bold', 'aria-hidden': true } as const;

createRoot(rootElement).render(
  <StrictMode>
    <IconContext value={ICON_DEFAULTS}>
      <ThemeProvider>
        <ApolloProvider client={createApolloClient(apiUrl)}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ApolloProvider>
      </ThemeProvider>
    </IconContext>
  </StrictMode>,
);
