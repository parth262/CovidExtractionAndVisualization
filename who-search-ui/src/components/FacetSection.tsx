import React from 'react'
import '../styles/FacetSection.css'
import Filters from './Filters'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import { fetchResults } from '../actions/searchResult'
import { Dispatch } from 'redux'
import { resetAll } from '../actions/filter'
import AppliedFilters from './AppliedFilters'
import SortFilter from './filters/SortFilter'

interface FacetSectionProps {
    dispatch: Dispatch<any>
}

function FacetSection(props: FacetSectionProps) {
    return <div className="FacetSection">
        <div className="sortBy">
            <SortFilter />
        </div>
        <div className="filters">
            <Filters />
        </div>
        <div className="appliedFilters">
            <AppliedFilters />
        </div>
        <div className="applyResestDiv">
            <Button size="sm" onClick={() => props.dispatch(fetchResults())}>Apply</Button>
            <Button size="sm" variant="secondary" onClick={() => props.dispatch(resetAll())}>Reset</Button>
        </div>
    </div>
}

export default connect()(FacetSection)