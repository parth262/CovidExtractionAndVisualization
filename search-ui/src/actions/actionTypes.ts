import { RESULTS_FETCHED, SEARCH_RESULT_LOADING, CATEGORY_FILTER_ADDED, FILTER_RESET, SEARCH_TEXT_CHANGED, COUNTRY_SELECTED, RESET_SEARCH_TEXT, NUMERIC_FILTER_ADDED, DATE_FILTER_ADDED, FACETS_FETCHED, SHOW_ERROR, HIDE_ERROR, CATEGORY_FILTER_REMOVED, NUMERIC_FILTER_REMOVED, DATE_FILTER_REMOVED, SORT_BY_SELECTED, SORT_BY_RESET } from "./constants"
import { SearchResult, Facets } from "./dataModels"
import { MinMaxValue } from "../components/filters/NumericFilter"
import { DateMinMaxValue } from "../components/filters/DateFilter"

//search result action types
export interface ResultFetchAction {
    type: typeof RESULTS_FETCHED
    searchResult: SearchResult
}

export type SearchResultActionType = ResultFetchAction

export interface SearchResultLoadingAction {
    type: typeof SEARCH_RESULT_LOADING
    searchResultsLoading: boolean
}


// search text action types
export interface SearchTextAction {
    type: typeof SEARCH_TEXT_CHANGED
    searchText: string
}

export interface ResetSearchText {
    type: typeof RESET_SEARCH_TEXT
}

export type SearchTextActionType = SearchTextAction | ResetSearchText

// filter action types
export interface CategoryFilterAddAction {
    type: typeof CATEGORY_FILTER_ADDED
    field: string
    values: string[]
}

export interface CategoryFilterRemoveAction {
    type: typeof CATEGORY_FILTER_REMOVED
    field: string
}

export interface NumericFilterAddAction {
    type: typeof NUMERIC_FILTER_ADDED
    field: string
    minMaxValue: MinMaxValue
}

export interface NumericFilterRemoveAction {
    type: typeof NUMERIC_FILTER_REMOVED
    field: string
}

export interface DateFilterAddAction {
    type: typeof DATE_FILTER_ADDED
    field: string
    minMaxValue: DateMinMaxValue
}

export interface DateFilterRemoveAction {
    type: typeof DATE_FILTER_REMOVED
    field: string
}

export interface ResetFilterAction {
    type: typeof FILTER_RESET
}

export interface CountrySelectedAction {
    type: typeof COUNTRY_SELECTED
    country: string
}

export type FilterActionType = CountrySelectedAction | ResetFilterAction |
    CategoryFilterAddAction | CategoryFilterRemoveAction |
    NumericFilterAddAction | NumericFilterRemoveAction |
    DateFilterAddAction | DateFilterRemoveAction

//facets action type
export interface FacetsFetchedAction {
    type: typeof FACETS_FETCHED
    facets: Facets
}

//error action type
export interface ShowErrorAction {
    type: typeof SHOW_ERROR
    errorMessage: string
}

export interface HideErrorAction {
    type: typeof HIDE_ERROR
}

export type ErrorActionType = ShowErrorAction | HideErrorAction

//sort by action type
export interface SortBySelected {
    type: typeof SORT_BY_SELECTED
    field: string
    ascending: boolean
}

export interface SortByReset {
    type: typeof SORT_BY_RESET
}

export type SortByActionType = SortBySelected | SortByReset

export type ActionTypes = SearchResultActionType | SearchResultLoadingAction |
    SearchTextActionType | FilterActionType | FacetsFetchedAction | ErrorActionType | SortByActionType