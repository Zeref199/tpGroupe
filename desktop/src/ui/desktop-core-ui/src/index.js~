/* ************************************* */
/* ********       IMPORTS       ******** */
/* ************************************* */
import AuthProvider from 'common-base-auth-javascript';
import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { ConnectedRouter } from 'react-router-redux';
import createHistory from 'history/createHashHistory';
import { Provider } from 'react-redux';
import { Route } from 'react-router-dom';

import store from './store';
import Routes from './Routes';
import i18n from './common/i18n'; // initialized i18next instance
import configurationService from './common/configuration/configurationService';
import 'bootstrap/dist/js/bootstrap.min.js';
import './index.scss';

/* ************************************* */
/* ********      VARIABLES      ******** */
/* ************************************* */
const render = () => {
    ReactDOM.render(
        <I18nextProvider i18n={i18n}>
            <Provider store={store}>
                {/* ConnectedRouter will use the store from Provider automatically */}
                <ConnectedRouter history={createHistory()}>
                    <Route component={Routes} />
                </ConnectedRouter>
            </Provider>
        </I18nextProvider>,
        document.getElementById('app'),
    );
};

AuthProvider.init(status => {
    if (!status.error || status.error === 'Keycloak is not enabled') {
        render();
    }
});

configurationService.init(store);