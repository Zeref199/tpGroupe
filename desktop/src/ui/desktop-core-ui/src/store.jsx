/* ************************************* */
/* ********       IMPORTS       ******** */
/* ************************************* */
import promiseMiddleware from 'redux-promise-middleware';
import { createStore, applyMiddleware } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import thunk from 'redux-thunk';
import reducers from './reducers';
import history from './history';

/* ************************************* */
/* ********      VARIABLES      ******** */
/* ************************************* */
const composeEnhancers = composeWithDevTools({});

const middlewares = [];
middlewares.push(promiseMiddleware());
middlewares.push(thunk);
middlewares.push(routerMiddleware(history));

if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line global-require
    const { logger } = require('redux-logger');

    middlewares.push(logger);
}

/* ************************************* */
/* ********  PRIVATE FUNCTIONS  ******** */
/* ************************************* */

/* ************************************* */
/* ********       EXPORTS       ******** */
/* ************************************* */
export default createStore(reducers, /* preloadedState, */ composeEnhancers(applyMiddleware(...middlewares)));
