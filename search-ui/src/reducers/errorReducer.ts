import { ErrorActionType } from "../actions/actionTypes";
import { SHOW_ERROR, HIDE_ERROR } from "../actions/constants";

const initialState = {
    show: false,
    errorMessage: ""
}

type ErrorReducerState = typeof initialState

export function errorReducer(state = initialState, action: ErrorActionType): ErrorReducerState {
    switch (action.type) {
        case SHOW_ERROR:
            return {
                show: true,
                errorMessage: action.errorMessage
            }
        case HIDE_ERROR:
            return {
                show: false,
                errorMessage: ""
            }
        default: return state
    }
}