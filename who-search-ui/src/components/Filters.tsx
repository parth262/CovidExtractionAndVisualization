import React from 'react'
import CheckboxFilter, { FieldValueMap, AddCategoryFilter, prepareCategoryFilterFieldValueMap } from './filters/CheckboxFilter'
import { connect } from 'react-redux'
import { ReduxState } from '../reducers/mainReducer'
import { COUNTRY_FIELD } from '../reducers/constants'
import { countryToFieldsMapping, fieldsToFilterMapping } from './constants'
import '../styles/Filter.css'
import { Dispatch } from 'redux'
import { addCategoryFilter, addNumericFilter, addDateFilter } from '../actions/filter'
import { AnyParams, Facets } from '../actions/dataModels'
import { ActionTypes } from '../actions/actionTypes'
import { Accordion } from 'react-bootstrap'
import NumericFilter, { prepareNumericFilterFieldValueMap, NumericFieldValueMap, MinMaxValue, AddNumericFilter } from './filters/NumericFilter'
import DateFilter, { DateMinMaxValue, DateFieldValueMap, AddDateFilter, prepareDateFilterFieldValueMap } from './filters/DateFilter'

interface FilterProps {
    selectedCountry: string,
    data: AnyParams[],
    facets: Facets,
    categoryFilters: FieldValueMap,
    numericFilters: NumericFieldValueMap,
    dateFilters: DateFieldValueMap,
    addCategoryFilter: AddCategoryFilter,
    addNumericFilter: AddNumericFilter,
    addDateFilter: AddDateFilter
}

function Filters(props: FilterProps) {
    const fields = props.selectedCountry !== "All" ? countryToFieldsMapping[props.selectedCountry] : Object.keys(fieldsToFilterMapping)
    const categoryFilterFieldValueMap = props.data.length > 0 ? prepareCategoryFilterFieldValueMap(fields, props.facets) : props.categoryFilters
    const numericFilterFieldValueMap = props.data.length > 0 ? prepareNumericFilterFieldValueMap(fields, props.data) : props.numericFilters
    const dateFilterFieldValueMap = props.data.length > 0 ? prepareDateFilterFieldValueMap(fields, props.data) : props.dateFilters

    const categoryFiltersNotEmpty = Object.keys(categoryFilterFieldValueMap).length > 0
    const numericFiltersNotEmpty = Object.keys(numericFilterFieldValueMap).length > 0
    const dateFiltersNotEmpty = Object.keys(dateFilterFieldValueMap).length > 0

    if (categoryFiltersNotEmpty || numericFiltersNotEmpty || dateFiltersNotEmpty) {

        return <Accordion className={"Filter"}>
            {categoryFiltersNotEmpty && <CheckboxFilter
                selectedCountry={props.selectedCountry}
                fieldValueMap={categoryFilterFieldValueMap}
                categoryFilters={props.categoryFilters}
                addCategoryFilter={props.addCategoryFilter} />}
            {numericFiltersNotEmpty && <NumericFilter
                selectedCountry={props.selectedCountry}
                fieldValueMap={numericFilterFieldValueMap}
                numericFilters={props.numericFilters}
                addNumericFilter={props.addNumericFilter}
            />}
            {dateFiltersNotEmpty && <DateFilter
                selectedCountry={props.selectedCountry}
                fieldValueMap={dateFilterFieldValueMap}
                dateFilters={props.dateFilters}
                addDateFilter={props.addDateFilter}
            />}
        </Accordion>
    }
    return <></>

}

function mapStateToProps(state: ReduxState) {
    return {
        selectedCountry: state.filters[COUNTRY_FIELD],
        data: state.searchResult.values,
        facets: state.facets,
        categoryFilters: state.filters.categorFilters,
        numericFilters: state.filters.numericFilters,
        dateFilters: state.filters.dateFilters
    }
}

function mapDispatchToProps(dispatch: Dispatch<ActionTypes>) {
    return {
        addCategoryFilter: (field: string, values: string[]) => dispatch(addCategoryFilter(field, values)),
        addNumericFilter: (field: string, minMaxValue: MinMaxValue) => dispatch(addNumericFilter(field, minMaxValue)),
        addDateFilter: (field: string, minMaxValue: DateMinMaxValue) => dispatch(addDateFilter(field, minMaxValue))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Filters)