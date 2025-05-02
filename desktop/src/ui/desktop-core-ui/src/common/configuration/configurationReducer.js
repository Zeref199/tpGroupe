import types from './types';

const initialState = {
    values: {},
};

function reducer(state = initialState, action) {
    switch (action.type) {
        case types.INIT_CONFIGURATION_FULFILLED.type:
            return {
                ...state,
                values: action.payload,
            };
        default:
            return state;
    }
}
export default reducer;
