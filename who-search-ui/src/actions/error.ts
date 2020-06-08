import { ShowErrorAction, HideErrorAction } from "./actionTypes";
import { SHOW_ERROR, HIDE_ERROR } from "./constants";
import { ThunkResult } from "../reducers/mainReducer";

export function showError(errorMessage: string): ShowErrorAction {
    return {
        type: SHOW_ERROR,
        errorMessage
    }
}

export function hideError(): HideErrorAction {
    return {
        type: HIDE_ERROR
    }
}

export function displayError(errorMessage: string, delay: number = 3000): ThunkResult {
    return dispatch => {
        dispatch(showError(errorMessage))
        setTimeout(() => dispatch(hideError()), delay)
    }
}