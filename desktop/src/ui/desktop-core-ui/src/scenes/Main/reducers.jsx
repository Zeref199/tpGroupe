/* ************************************* */
/* ********       IMPORTS       ******** */
/* ************************************* */
import { combineReducers } from 'redux';
import { BreadcrumbReducer } from '@beyond-framework/common-uitoolkit-beyond';
import computedMenuReducer from './scenes/Home/reducer';
import homeReducer from './scenes/Home/reducers';

/* ************************************* */
/* ********      VARIABLES      ******** */
/* ************************************* */
const reducers = combineReducers({
    breadcrumb: BreadcrumbReducer,
    computedMenu: computedMenuReducer,
    home: homeReducer,
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
