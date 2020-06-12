import React from 'react'
import FacetSection from './FacetSection'
import "../styles/Body.css"
import ResultSection from './ResultSection'
import LoadingComponent from './LoadingComponent'

export default class Body extends React.Component {

    render() {
        return <div className="Body">
            <LoadingComponent />
            <FacetSection />
            <ResultSection />
        </div>
    }
}