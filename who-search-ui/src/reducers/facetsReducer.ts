import { Facets } from "../actions/dataModels";
import { FacetsFetchedAction } from "../actions/actionTypes";
import { FACETS_FETCHED } from "../actions/constants";

const initialState: Facets = {}

export function facetsReducer(state = initialState, action: FacetsFetchedAction): Facets {
    switch (action.type) {
        case FACETS_FETCHED:
            return action.facets
        default: return state
    }
}