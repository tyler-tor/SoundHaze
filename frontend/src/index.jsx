import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { restoreCSRF, csrfFetch } from './store/csrf';
import * as sessionActions from './store/session';
import configureStore from './store';
import { ModalProvider } from './context/Modal'


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
      <ModalProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ModalProvider>
    </Provider>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById('root')
);
