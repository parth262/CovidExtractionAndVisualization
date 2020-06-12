import { ReduxState } from "../reducers/mainReducer"
import { COUNTRY_FIELD } from "../reducers/constants"
import { FieldValueMap } from "../components/filters/CheckboxFilter"
import { NumericFieldValueMap } from "../components/filters/NumericFilter"
import { DateFieldValueMap } from "../components/filters/DateFilter"
import { fieldfacetCountMap } from "../components/constants"

const serviceName = "who-search"
const indexName = "who-covid-data-index"
const apiKey = "A41465781BA1BDC6294E4B22D5CD5B91"
const apiVersion = "2019-05-06"
const url = `https://${serviceName}.search.windows.net/indexes/${indexName}/docs/search?api-version=${apiVersion}`


function prepareCategoryFilters(categoryFilters: FieldValueMap): string[] {
    const keys = Object.keys(categoryFilters)
    const separator = "|"
    if (keys.length > 0) {
        return keys.map(key => {
            if (typeof categoryFilters[key][0] === 'boolean') {
                return categoryFilters[key].map(v => `${key} eq ${v}`).join(" or ")
            }
            return `search.in(${key}, '${categoryFilters[key].join(separator)}', '${separator}')`
        })
    } return []
}

function prepareNumericFilters(numericFilters: NumericFieldValueMap): string[] {
    const keys = Object.keys(numericFilters)
    if (keys.length > 0) {
        return keys.map(key => {
            const minMaxValue = numericFilters[key]
            const min = minMaxValue.min
            const max = minMaxValue.max
            return `${key} ge ${min} and ${key} le ${max}`
        })
    }
    return []
}

function prepareDateFilters(dateFilters: DateFieldValueMap): string[] {
    const keys = Object.keys(dateFilters)
    if (keys.length > 0) {
        return keys.map(key => {
            const minMaxValue = dateFilters[key]
            const min = minMaxValue.min
            const max = minMaxValue.max
            return `${key} ge ${min} and ${key} le ${max}`
        })
    }
    return []
}

function prepareFacetQueries(fieldfacetCountMap: { [field: string]: number }) {
    return Object.keys(fieldfacetCountMap).map(key => `${key},count:${fieldfacetCountMap[key]}`)
}

export function prepareRequestBody(state: ReduxState) {
    const data: any = {}
    data["search"] = state.searchText
    data['count'] = true

    if (state.sortBy.field) {
        data["orderby"] = state.sortBy.field + (state.sortBy.ascending ? '' : ' desc')
    }

    const country = state.filters[COUNTRY_FIELD]

    //facets
    data['facets'] = prepareFacetQueries(fieldfacetCountMap)

    //filters
    const filters = []
    if (country !== "All") {
        filters.push(`${[COUNTRY_FIELD]} eq '${country}'`)
    }

    const categoryFilters = prepareCategoryFilters(state.filters.categorFilters)
    filters.push(...categoryFilters)

    const numericFilters = prepareNumericFilters(state.filters.numericFilters)
    filters.push(...numericFilters)

    const dateFilters = prepareDateFilters(state.filters.dateFilters)
    filters.push(...dateFilters)

    data['filter'] = filters.join(' and ')

    return data
}

export async function search(requestBody: string) {
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": apiKey
        },
        body: requestBody
    })
        .then(res => res.json())
        .catch(err => ({
            error: {
                message: err.message
            }
        }))

}
