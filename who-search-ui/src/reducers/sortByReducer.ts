import { SortByActionType } from "../actions/actionTypes";
import { SORT_BY_SELECTED, SORT_BY_RESET } from "../actions/constants";


export interface SortByState {
    field: string,
    ascending: boolean
}

const initialState: SortByState = {
    field: null,
    ascending: true
}

export default function sortByReducer(state = initialState, action: SortByActionType): SortByState {
    switch (action.type) {
        case SORT_BY_SELECTED:
            return {
                field: action.field,
                ascending: action.ascending
            }
        case SORT_BY_RESET:
            return initialState
        default: return state
    }
}