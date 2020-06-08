import React, { Dispatch } from 'react'
import { FieldValueMap } from './filters/CheckboxFilter'
import { NumericFieldValueMap } from './filters/NumericFilter'
import { DateFieldValueMap } from './filters/DateFilter'
import { Badge } from 'react-bootstrap'
import { ReduxState } from '../reducers/mainReducer'
import { connect } from 'react-redux'
import { ActionTypes } from '../actions/actionTypes'
import { removeCategoryFilter, removeNumericFilter, removeDateFilter } from '../actions/filter'
import { AiFillCloseCircle } from 'react-icons/ai'
import { normalizeFieldName } from './constants'

export type RemoveFilter = (field: string) => void

interface AppliedFiltersProps {
    categoryFilters: FieldValueMap
    numericFilters: NumericFieldValueMap
    dateFilters: DateFieldValueMap
    removeCategoryFilter: RemoveFilter
    removeNumericFilter: RemoveFilter
    removeDateFilter: RemoveFilter
}

function AppliedFilters(props: AppliedFiltersProps) {
    const categoryFilterKeys = Object.keys(props.categoryFilters)
    const numericFilterKeys = Object.keys(props.numericFilters)
    const dateFilterKeys = Object.keys(props.dateFilters)
    if (categoryFilterKeys.length > 0 || numericFilterKeys.length > 0 || dateFilterKeys.length > 0) {
        return <span>
            <div><label>Applied Filters</label></div>
            <span>
                {categoryFilterKeys.map((categoryField, i) => <span key={i}>
                    <Badge pill variant="primary">
                        {normalizeFieldName(categoryField)}
                        {' '}<AiFillCloseCircle
                            className="appliedFilter"
                            onClick={() => props.removeCategoryFilter(categoryField)}
                        />
                    </Badge>{' '}
                </span>)}
            </span>
            <span>
                {numericFilterKeys.map((numericField, i) => <span key={i}>
                    <Badge pill variant="primary">
                        {normalizeFieldName(numericField)}
                        {' '}<AiFillCloseCircle
                            className="appliedFilter"
                            onClick={() => props.removeNumericFilter(numericField)}
                        />
                    </Badge>{' '}
                </span>)}
            </span>
            <span>
                {dateFilterKeys.map((dateField, i) => <span key={i}>
                    <Badge pill variant="primary">
                        {normalizeFieldName(dateField)}
                        {' '}<AiFillCloseCircle
                            className="appliedFilter"
                            onClick={() => props.removeDateFilter(dateField)}
                        />
                    </Badge>{' '}
                </span>)}
            </span>
        </span>
    }
    return null
}

function mapStateToProps(state: ReduxState) {
    return {
        categoryFilters: state.filters.categorFilters,
        numericFilters: state.filters.numericFilters,
        dateFilters: state.filters.dateFilters
    }
}

function mapDispatchToProps(dispatch: Dispatch<ActionTypes>) {
    return {
        removeCategoryFilter: (field: string) => dispatch(removeCategoryFilter(field)),
        removeNumericFilter: (field: string) => dispatch(removeNumericFilter(field)),
        removeDateFilter: (field: string) => dispatch(removeDateFilter(field))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppliedFilters)