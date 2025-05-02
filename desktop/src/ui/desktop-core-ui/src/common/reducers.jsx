/* ************************************* */
/* ********       IMPORTS       ******** */
/* ************************************* */
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { AlertReducer } from '@beyond-framework/common-uitoolkit-beyond';
import configurationReducer from './configuration/configurationReducer';

/* ************************************* */
/* ********      VARIABLES      ******** */
/* ************************************* */
const reducers = combineReducers({
    notifications: AlertReducer,
    router: routerReducer,
    configuration: configurationReducer,
});

/* ************************************* */
/* ********  PRIVATE FUNCTIONS  ******** */
/* ************************************* */

/* ************************************* */
/* ********   PUBLIC FUNCTIONS  ******** */
/* ************************************* */

/* ************************************* */
/* ********       EXPORTS       ******** */
/* ************************************* */
export default reducers;
