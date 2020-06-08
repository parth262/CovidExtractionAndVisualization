import React from 'react'
import { Form } from 'react-bootstrap'
import { SortByState } from '../../reducers/sortByReducer'
import { FaSortAmountDownAlt, FaSortAmountDown } from 'react-icons/fa'
import { ReduxState } from '../../reducers/mainReducer'
import { connect } from 'react-redux'
import { countryToFieldsMapping, normalizeFieldName } from '../constants'
import { COUNTRY_FIELD } from '../../reducers/constants'
import { Dispatch } from 'redux'
import { ActionTypes } from '../../actions/actionTypes'
import { selectSortBy } from '../../actions/sortBy'

interface SortFilterProps {
    sortBy: SortByState
    fields: string[]
    dispatch: Dispatch<ActionTypes>
}

function SortFilter(props: SortFilterProps) {

    const handleFieldSelect = (field: string) => {
        props.dispatch(selectSortBy(field === "none" ? null : field, props.sortBy.ascending))
    }

    const handleSortingOrderSelect = () => {
        props.dispatch(selectSortBy(props.sortBy.field, !props.sortBy.ascending))
    }

    return <Form>
        <Form.Group controlId="formBasicEmail">
            <Form.Label>Sort By
                <span className="sortOrder" onClick={handleSortingOrderSelect}>
                    {props.sortBy.ascending ? <FaSortAmountDownAlt /> : <FaSortAmountDown />}
                </span>
            </Form.Label>
            <Form.Control
                size="sm"
                as="select"
                value={props.sortBy.field || "none"}
                onChange={e => handleFieldSelect(e.target.value)}>
                {["none"].concat(props.fields).map((field, i) => <option
                    key={i} value={field}>
                    {normalizeFieldName(field || "None")}
                </option>)}
            </Form.Control>
        </Form.Group>
    </Form>
}

function mapStateToProps(state: ReduxState) {
    return {
        sortBy: state.sortBy,
        fields: countryToFieldsMapping[state.filters[COUNTRY_FIELD]]
    }
}

export default connect(mapStateToProps)(SortFilter)
