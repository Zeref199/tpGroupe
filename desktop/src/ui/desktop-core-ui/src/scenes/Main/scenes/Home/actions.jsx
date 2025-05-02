/* ************************************* */
/* ********       IMPORTS       ******** */
/* ************************************* */
import types from './types';
import Api from '../../../../common/resources/Api';

/* ************************************* */
/* ********      VARIABLES      ******** */
/* ************************************* */

/* ************************************* */
/* ********       EXPORTS       ******** */
/* ************************************* */


/* ************************************* */
/* ********  PRIVATE FUNCTIONS  ******** */
/* ************************************* */

/* ************************************* */
/* ********   PUBLIC FUNCTIONS  ******** */
/* ************************************* */

export function fetchTraces({ page = 0, size = 10, operation = '', from, to } = {}) {
    return async dispatch => {
        dispatch({ type: types.FETCH_TRACES_PENDING.type });

        try {
            const response = await Api.all('traces')
                .getAll({ page, size, operation, from, to});


            const traces = Array.isArray(response.body())
                ? response.body().map(resource => resource.data())
                : [];


            dispatch({
                type: types.FETCH_TRACES_FULFILLED.type,
                payload: { traces },
            });
        } catch (error) {
            dispatch({
                type: types.FETCH_TRACES_REJECTED.type,
                error: error.message || 'Failed to fetch traces',
            });
        }
    };
}


const actions = {
    fetchTraces
}

export default actions