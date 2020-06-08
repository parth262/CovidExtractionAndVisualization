import { COUNTRY_SELECTED, CATEGORY_FILTER_ADDED, FILTER_RESET, NUMERIC_FILTER_ADDED, DATE_FILTER_ADDED, CATEGORY_FILTER_REMOVED, NUMERIC_FILTER_REMOVED, DATE_FILTER_REMOVED } from "../actions/constants"
import { COUNTRY_FIELD } from "./constants"
import { FieldValueMap } from "../components/filters/CheckboxFilter"
import { FilterActionType } from "../actions/actionTypes"
import { NumericFieldValueMap } from "../components/filters/NumericFilter"
import { DateFieldValueMap } from "../components/filters/DateFilter"

export interface FilterState {
    [COUNTRY_FIELD]: string,
    categorFilters: FieldValueMap
    numericFilters: NumericFieldValueMap
    dateFilters: DateFieldValueMap
}

const initialState: FilterState = {
    [COUNTRY_FIELD]: 'All',
    categorFilters: {},
    numericFilters: {},
    dateFilters: {}
}

export default function filtersReducer(state = initialState, action: FilterActionType): FilterState {
    switch (action.type) {
        case COUNTRY_SELECTED:
            return { ...initialState, [COUNTRY_FIELD]: action.country as string }
        case CATEGORY_FILTER_ADDED:
            return {
                ...state,
                categorFilters: {
                    ...state.categorFilters,
                    [action.field]: action.values
                }
            }
        case CATEGORY_FILTER_REMOVED:
            const newCategoryfilters = { ...state.categorFilters }
            delete newCategoryfilters[action.field]
            return {
                ...state,
                categorFilters: newCategoryfilters
            }
        case NUMERIC_FILTER_ADDED:
            return {
                ...state,
                numericFilters: {
                    ...state.numericFilters,
                    [action.field]: action.minMaxValue
                }
            }
        case NUMERIC_FILTER_REMOVED:
            const newNumericfilters = { ...state.numericFilters }
            delete newNumericfilters[action.field]
            return {
                ...state,
                numericFilters: newNumericfilters
            }
        case DATE_FILTER_ADDED:
            return {
                ...state,
                dateFilters: {
                    ...state.dateFilters,
                    [action.field]: action.minMaxValue
                }
            }
        case DATE_FILTER_REMOVED:
            const newDateFilters = { ...state.dateFilters }
            delete newDateFilters[action.field]
            return {
                ...state,
                dateFilters: newDateFilters
            }
        case FILTER_RESET:
            return {
                ...initialState,
                [COUNTRY_FIELD]: state[COUNTRY_FIELD]
            }
        default: return state
    }
}