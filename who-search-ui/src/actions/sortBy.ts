import { SORT_BY_SELECTED, SORT_BY_RESET } from "./constants";
import { SortBySelected, SortByReset } from "./actionTypes";

export function selectSortBy(field: string, ascending: boolean): SortBySelected {
    return {
        type: SORT_BY_SELECTED,
        field,
        ascending
    }
}

export function resetSortBy(): SortByReset {
    return {
        type: SORT_BY_RESET
    }
}