import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { restoreCSRF, csrfFetch } from './store/csrf';
import * as sessionActions from './store/session';
import configureStore from './store';
import { ModalProvider } from './context/Modal'
import { ToastProvider } from './components/common';


const store = configureStore();

// Get a CSRF token as soon as the app starts, in every environment (S20).
restoreCSRF().catch(() => {
  // csrfFetch will try again before the first POST/PUT/DELETE.
});

if (import.meta.env.DEV) {
  window.csrfFetch = csrfFetch;
  window.store = store;
  window.sessionActions = sessionActions;
};

function Root() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <ModalProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ModalProvider>
      </ToastProvider>
    </Provider>
  )
}

// React 18 root API (S22). ReactDOM.render ran the app in legacy React 17 mode.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
