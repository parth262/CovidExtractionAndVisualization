import { RESULTS_FETCHED, SEARCH_RESULT_LOADING } from "../actions/constants";
import { SearchResult } from "../actions/dataModels";
import { SearchResultLoadingAction, SearchResultActionType } from "../actions/actionTypes";

const initialState: SearchResult = {
    total: 0,
    nextPageParameters: null,
    values: []
}

export default function searchResultReducer(state = initialState, action: SearchResultActionType) {
    switch (action.type) {
        case RESULTS_FETCHED:
            return action.searchResult
        default: return state
    }
}

export function searchResultLoadingReducer(state = false, action: SearchResultLoadingAction) {
    switch (action.type) {
        case SEARCH_RESULT_LOADING:
            return action.searchResultsLoading
        default: return state
    }
}