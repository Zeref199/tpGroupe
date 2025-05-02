/* ************************************* */
/* ********       IMPORTS       ******** */
/* ************************************* */
import { AlertEvents } from '@beyond-framework/common-uitoolkit-beyond';
import EventTypes from './EventTypes';

/* ************************************* */
/* ********  PRIVATE FUNCTIONS  ******** */
/* ************************************* */

/**
 * Remove alert.
 * @param alert
 * @returns {{alert: *}}
 */
function removeAlert(alert) {
    return { ...AlertEvents.ALERT_SYSTEM_HIDE_NOTIFICATION, alert };
}

function updateBreadcrumbRoutes(routes) {
    return dispatch =>
        dispatch({
            ...EventTypes.UPDATE_BREADCRUMB_ROUTES,
            meta: { routes },
        });
}


/* ************************************* */
/* ********       EXPORTS       ******** */
/* ************************************* */
const actions = {
    removeAlert,
    updateBreadcrumbRoutes,
};
export default actions;
