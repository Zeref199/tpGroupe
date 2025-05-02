/* ************************************* */
/* ********       IMPORTS       ******** */
/* ************************************* */
import { combineReducers } from 'redux';
import { ControlledPanelReducer as panels, beyondAppLayoutReducer as desktop } from '@beyond-framework/common-uitoolkit-beyond';
import common from './common/reducers';
import main from './scenes/Main/reducers';

/* ************************************* */
/* ********      VARIABLES      ******** */
/* ************************************* */

const reducers = combineReducers({
    common,
    main,
    panels,
    desktop,
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
