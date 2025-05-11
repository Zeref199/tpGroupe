import types from './types';

const initialState = {
    menuLoading: false,
    traces: [],
    loading: false,
};

function reducer(state = initialState, action) {
    switch (action.type) {
        case types.GET_MENU_ENTRIES_PENDING.type:
        case types.GET_FAVORITES_MENU_ENTRIES_PENDING.type:
            return {
                ...state,
                menuLoading: true,
            };
        case types.GET_MENU_ENTRIES_FULFILLED.type:
        case types.GET_FAVORITES_MENU_ENTRIES_FULFILLED.type:
            return {
                ...state,
                menuLoading: false,
            };
        case types.GET_MENU_ENTRIES_REJECTED.type:
        case types.GET_FAVORITES_MENU_ENTRIES_REJECTED.type:
            return {
                ...state,
                menuLoading: false,
            };

        case types.FETCH_TRACES_PENDING.type:
            return { ...state, loading: true };

        case types.FETCH_TRACES_FULFILLED.type:
            return { ...state, traces: action.payload.traces, loading: false };

        case types.FETCH_TRACES_REJECTED.type:
            return { ...state, traces: [], loading: false };

        default:
            return state;
    }
}

export default reducer;
