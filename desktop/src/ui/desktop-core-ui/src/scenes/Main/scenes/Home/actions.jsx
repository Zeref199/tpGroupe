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

export function fetchTraces({ page, size = 10, operation = '', from, to,  status   = '', traceId = '', numPS = '', numAMC = '', direction } = {}) {
    return async dispatch => {
        dispatch({ type: types.FETCH_TRACES_PENDING.type });

        try {
            const params = { page, size, operation, from, to, status, direction };
                  if (traceId) params.traceId = traceId;
                  if (numPS)   params.numPS   = numPS;
                  if (numAMC)  params.numAMC  = numAMC;
            const response = await Api.all('traces')
                  .getAll(params);

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

export function fetchPS({ from, to } = {}) {
    return async dispatch => {
        dispatch({ type: types.FETCH_PS_PENDING.type });

        try {
            const response = await Api.all('ps')
                .getAll({ from, to });

            const psList = Array.isArray(response.body())
                ? response.body().map(resource => resource.data())
                : [];

            dispatch({
                type: types.FETCH_PS_FULFILLED.type,
                payload: { psList },
            });
        } catch (error) {
            dispatch({
                type: types.FETCH_PS_REJECTED.type,
                error: error.message || 'Failed to fetch liste PS',
            });
        }
    };
}


const actions = {
    fetchTraces,
    fetchPS
}

export default actions