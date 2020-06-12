import { SEARCH_TEXT_CHANGED, RESET_SEARCH_TEXT } from "./constants";
import { SearchTextAction, ResetSearchText } from "./actionTypes";

export function searchTextChanged(searchText: string): SearchTextAction {
    return {
        type: SEARCH_TEXT_CHANGED,
        searchText
    }
}

export function resetSearchText(): ResetSearchText {
    return {
        type: RESET_SEARCH_TEXT
    }
}