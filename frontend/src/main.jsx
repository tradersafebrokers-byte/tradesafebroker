import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './app/store.js';
import { ToastProvider } from './features/shared/components/toast/ToastContext.jsx';
import { LanguageProvider } from './features/shared/context/LanguageContext.jsx';
import './index.css';
import App from './app/App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <LanguageProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LanguageProvider>
      </ToastProvider>
    </Provider>
  </StrictMode>
);
