import { COUNTRY_SELECTED } from "./constants";
import { ThunkResult } from "../reducers/mainReducer";
import { fetchResults } from "./searchResult"
import { resetFilter } from "./filter";
import { CountrySelectedAction } from "./actionTypes";
import { resetSearchText } from "./searchText";
import { resetSortBy } from "./sortBy";

export function sourceCountrySelected(country: string): CountrySelectedAction {
    return {
        type: COUNTRY_SELECTED,
        country
    }
}

export function selectCountry(country: string): ThunkResult {
    return dispatch => {
        dispatch(resetFilter())
        dispatch(resetSearchText())
        dispatch(resetSortBy())
        dispatch(sourceCountrySelected(country))
        dispatch(fetchResults())
    }
}