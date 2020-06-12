import { CATEGORY_FILTER_ADDED, FILTER_RESET, NUMERIC_FILTER_ADDED, DATE_FILTER_ADDED, CATEGORY_FILTER_REMOVED, NUMERIC_FILTER_REMOVED, DATE_FILTER_REMOVED } from "./constants";
import { CategoryFilterAddAction, ResetFilterAction, NumericFilterAddAction, DateFilterAddAction, CategoryFilterRemoveAction, NumericFilterRemoveAction, DateFilterRemoveAction } from "./actionTypes";
import { ThunkResult } from "../reducers/mainReducer";
import { resetSearchText } from "./searchText";
import { fetchResults } from "./searchResult";
import { MinMaxValue } from "../components/filters/NumericFilter";
import { DateMinMaxValue } from "../components/filters/DateFilter";
import { resetSortBy } from "./sortBy";

export function addCategoryFilter(field: string, values: string[]): CategoryFilterAddAction {
    return {
        type: CATEGORY_FILTER_ADDED,
        field,
        values
    }
}

export function removeCategoryFilter(field: string): CategoryFilterRemoveAction {
    return {
        type: CATEGORY_FILTER_REMOVED,
        field
    }
}

export function addNumericFilter(field: string, minMaxValue: MinMaxValue): NumericFilterAddAction {
    return {
        type: NUMERIC_FILTER_ADDED,
        field,
        minMaxValue
    }
}

export function removeNumericFilter(field: string): NumericFilterRemoveAction {
    return {
        type: NUMERIC_FILTER_REMOVED,
        field
    }
}

export function addDateFilter(field: string, minMaxValue: DateMinMaxValue): DateFilterAddAction {
    return {
        type: DATE_FILTER_ADDED,
        field,
        minMaxValue
    }
}

export function removeDateFilter(field: string): DateFilterRemoveAction {
    return {
        type: DATE_FILTER_REMOVED,
        field
    }
}

export function resetFilter(): ResetFilterAction {
    return {
        type: FILTER_RESET
    }
}

export function resetAll(): ThunkResult {
    return dispatch => {
        dispatch(resetFilter())
        dispatch(resetSearchText())
        dispatch(resetSortBy())
        dispatch(fetchResults())
    }
}

