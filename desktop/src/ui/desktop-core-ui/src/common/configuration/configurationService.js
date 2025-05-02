/* ************************************* */
/* ********       IMPORTS       ******** */
/* ************************************* */
import type from './types';

/* ************************************* */
/* ********      PRIVATE        ******** */
/* ************************************* */

const getConfiguration = () => fetch('./configuration').then(response => response.json());

/* ************************************* */
/* ********   PUBLIC FUNCTIONS  ******** */
/* ************************************* */
const init = ({dispatch}) =>
    dispatch({
        type: type.INIT_CONFIGURATION.type,
        payload: getConfiguration().then(res => ({
            ...res,
            shouldDisplayLogo: res.SHOULD_DISPLAY_LOGO !== 'false' && res.SHOULD_DISPLAY_LOGO !== false,
            version: res.BEYOND_VERSION
        })),
    });

/* ************************************* */
/* ********       EXPORTS       ******** */
/* ************************************* */

const configurationService = {
    init,
};

export default configurationService;
