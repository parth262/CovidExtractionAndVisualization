import { RESULTS_FETCHED, SEARCH_RESULT_LOADING } from "./constants"
import { search, prepareRequestBody } from "../services/azureSearchService"
import { ThunkResult } from "../reducers/mainReducer"
import { SearchResult } from "./dataModels"
import { SearchResultLoadingAction, SearchResultActionType } from "./actionTypes"
import { facetsFetched } from "./facets"
import { displayError } from "./error"

export function resultsFetched(searchResult: SearchResult): SearchResultActionType {
    return {
        type: RESULTS_FETCHED,
        searchResult
    }
}

export function searchResultsLoading(searchResultsLoading: boolean): SearchResultLoadingAction {
    return {
        type: SEARCH_RESULT_LOADING,
        searchResultsLoading
    }
}

export function fetchResults(): ThunkResult {
    return async (dispatch, getState) => {
        const state = getState()
        const requestBody = prepareRequestBody(state)
        dispatch(searchResultsLoading(true))
        const data = await search(JSON.stringify(requestBody))
        if (data.error) {
            dispatch(displayError(data.error.message))
        } else {
            const actionData = {
                total: data["@odata.count"],
                nextPageParameters: data["@search.nextPageParameters"],
                values: data["value"]
            }
            dispatch(facetsFetched(data["@search.facets"]))
            dispatch(resultsFetched(actionData))
        }
        dispatch(searchResultsLoading(false))
    }
}

export function fetchMoreResults(): ThunkResult {
    return async (dispatch, getState) => {
        const state = getState()
        const requestBody = JSON.stringify(state.searchResult.nextPageParameters)
        const data = await search(requestBody)
        if (data.error) {
            console.log(data.error)
        } else {
            const actionData = {
                total: data["@odata.count"],
                nextPageParameters: data["@search.nextPageParameters"],
                values: state.searchResult.values.concat(data["value"])
            }
            dispatch(resultsFetched(actionData))
        }
    }
}