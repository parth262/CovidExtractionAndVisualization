import React from 'react'
import { InputGroup, FormControl, Button, Table, Form, Col, DropdownButton, Dropdown } from 'react-bootstrap'
import '../styles/ResultSection.css'
import { FaSearch } from 'react-icons/fa'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { ReduxState } from '../reducers/mainReducer'
import { searchTextChanged } from '../actions/searchText'
import { fetchMoreResults, fetchResults } from '../actions/searchResult'
import { COUNTRY_FIELD } from '../reducers/constants'
import { countryToFieldsMapping, countries, normalizeFieldName } from './constants'
import { selectCountry } from '../actions/sourceCountry'
import { AnyParams } from '../actions/dataModels'
import DownloadData from './DownloadData'
import { SortByState } from '../reducers/sortByReducer'

export interface ResultSectionProps {
    searchText: string,
    sortBy: SortByState,
    total: number,
    loading: boolean,
    country: string,
    data: AnyParams[],
    dispatch: Dispatch<any>
}

interface ResultSectionState {
    sortAscending: boolean
}

class ResultSection extends React.Component<ResultSectionProps, ResultSectionState> {

    prevScrollTop: number = 0
    scrollabelElement = React.createRef<HTMLDivElement>()

    constructor(props: ResultSectionProps) {
        super(props)

        this.state = {
            sortAscending: props.sortBy.ascending
        }

        this.handleScroll = this.handleScroll.bind(this)
        this.handleCountrySelection = this.handleCountrySelection.bind(this)
        this.handleKeyDownOnForm = this.handleKeyDownOnForm.bind(this)
        this.handleSortOrderChange = this.handleSortOrderChange.bind(this)
    }

    handleSortOrderChange() {

    }

    handleScroll() {
        const currentTarget = this.scrollabelElement.current
        if (this.prevScrollTop !== currentTarget.scrollTop) {
            const bottom = currentTarget.scrollHeight - currentTarget.scrollTop <= (currentTarget.clientHeight + 5)
            console.log(currentTarget.scrollHeight - currentTarget.scrollTop, currentTarget.clientHeight)
            if (bottom) {
                this.props.dispatch(fetchMoreResults())
            }
            this.prevScrollTop = currentTarget.scrollTop
        }
    }

    componentDidUpdate(nextProps: ResultSectionProps) {
        if (this.props.country !== nextProps.country) {
            this.scrollabelElement.current.scrollTo(0, 0)
        }
    }

    handleCountrySelection(country: string) {
        this.props.dispatch(selectCountry(country))
    }

    handleKeyDownOnForm(e: React.KeyboardEvent<HTMLFormElement>) {
        if (e.keyCode === 13) {
            e.preventDefault()
            this.props.dispatch(fetchResults())
        }
    }

    render() {
        const fields: string[] = countryToFieldsMapping[this.props.country]

        return <div className="ResultSection">
            <div className="searchBar">
                <Form onKeyDown={this.handleKeyDownOnForm}>
                    <Form.Row>
                        <Col md={3}>
                            <span>Country:</span>
                            <DropdownButton className={"countryDropdown"} variant={"link"} id="countrySelector" title={this.props.country}>
                                {countries.map((country, i) => <Dropdown.Item
                                    key={i}
                                    onClick={() => this.handleCountrySelection(country)}>
                                    {country}
                                </Dropdown.Item>)}
                            </DropdownButton>
                        </Col>
                        <Col>
                            <InputGroup className="mb-3">
                                <FormControl
                                    placeholder="Search"
                                    aria-label="Search"
                                    value={this.props.searchText}
                                    onChange={e => this.props.dispatch(searchTextChanged(e.target.value))}
                                />
                                <InputGroup.Append>
                                    <Button onClick={() => this.props.dispatch(fetchResults())}><FaSearch /></Button>
                                </InputGroup.Append>
                            </InputGroup>
                        </Col>
                        <Col md={2}>
                            <DownloadData />
                        </Col>
                    </Form.Row>
                </Form>
            </div>
            <div>Showing: {this.props.data.length}/{this.props.total}</div>
            <div className="resultsTable" onScroll={this.handleScroll} ref={this.scrollabelElement}>
                {this.props.data.length > 0 ?
                    <Table bordered striped>
                        <thead>
                            <tr>
                                {fields.map((field, i) => <th key={i} style={{ whiteSpace: "nowrap" }}>{normalizeFieldName(field)}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.data.map((d, i) => <tr key={i}>
                                {fields.map((field, j) => <td key={j}>{d[field] && d[field].toString()}</td>)}
                            </tr>)}
                        </tbody>
                    </Table> : <h2>No Data</h2>}
            </div>
        </div>
    }
}

function mapStateToProps(state: ReduxState) {
    return {
        total: state.searchResult.total,
        searchText: state.searchText,
        sortBy: state.sortBy,
        data: state.searchResult.values,
        country: state.filters[COUNTRY_FIELD],
        loading: state.searchResultLoading
    }
}

export default connect(mapStateToProps)(ResultSection)