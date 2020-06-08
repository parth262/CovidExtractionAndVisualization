export interface AnyParams {
    [field: string]: string | number
}

export interface SearchResult {
    total: number
    nextPageParameters: AnyParams
    values: AnyParams[]
}

export interface FacetValue {
    count: number,
    value: string
}

export interface Facets {
    [field: string]: FacetValue[]
}