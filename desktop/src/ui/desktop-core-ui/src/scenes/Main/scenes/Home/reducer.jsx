import types from './types';

const initialState = {
    menuLoading: false,
    traces: [],
    loading: false,

    psList: [],
    psLoading: false,

    amcList: [],
    amcLoading: false,

    fileList: [],
    fileLoading: false,
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

        case types.FETCH_PS_PENDING.type:
            return { ...state,
                psLoading: true,
            };

        case types.FETCH_PS_FULFILLED.type:
            return { ...state,
                psLoading: false,
                psList: action.payload.psList, };

        case types.FETCH_PS_REJECTED.type:
            return { ...state,
                psLoading: false,
                psList: [],
                 };

        case types.FETCH_AMC_PENDING.type:
            return { ...state,
                amcLoading: true,
                  };

        case types.FETCH_AMC_FULFILLED.type:
            return { ...state,
                amcLoading: false,
                amcList: action.payload.amcList, };

        case types.FETCH_AMC_REJECTED.type:
            return { ...state,
                amcLoading: false,
                amcList: [],
                 };

        default:
            return state;
    }
}

export default reducer;
