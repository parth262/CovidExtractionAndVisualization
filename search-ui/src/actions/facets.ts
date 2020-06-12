import { Facets } from "./dataModels";
import { FacetsFetchedAction } from "./actionTypes";
import { FACETS_FETCHED } from "./constants";

export function facetsFetched(facets: Facets): FacetsFetchedAction {
    return {
        type: FACETS_FETCHED,
        facets
    }
}