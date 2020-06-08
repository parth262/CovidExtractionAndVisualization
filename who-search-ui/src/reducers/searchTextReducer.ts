import { SEARCH_TEXT_CHANGED, RESET_SEARCH_TEXT } from "../actions/constants";
import { SearchTextActionType } from "../actions/actionTypes";

const initialState = "*"

export default function searchTextReducer(state = initialState, action: SearchTextActionType) {
    switch (action.type) {
        case SEARCH_TEXT_CHANGED:
            return action.searchText
        case RESET_SEARCH_TEXT:
            return initialState
        default: return state
    }
}