import React, { Dispatch } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { ReduxState } from '../reducers/mainReducer'
import { prepareRequestBody, search } from '../services/azureSearchService'
import { Parser } from 'json2csv'
import { COUNTRY_FIELD } from '../reducers/constants'
import { countryToFieldsMapping } from './constants'
import { AnyParams } from '../actions/dataModels'
import { displayError } from '../actions/error'

async function downloadAllData(total: number, requestBody: any): Promise<AnyParams[]> {
    let allData: AnyParams[] = []
    let nextPageParams: any = null
    while (allData.length !== total) {
        let newRequestBody = nextPageParams
        if (!newRequestBody) {
            newRequestBody = { ...requestBody }
            newRequestBody["top"] = total
        }
        const data = await search(JSON.stringify(newRequestBody))
        if (data.error) {
            throw new Error("Error occurred while downloading data")
        } else {
            nextPageParams = data["@search.nextPageParameters"]
            allData = allData.concat(data["value"])
        }
    }
    return allData
}

interface DownloadDataProps {
    state: ReduxState
    dispatch: Dispatch<any>
}

class DownloadData extends React.Component<DownloadDataProps> {

    downloadFileName = "WhoCovidData.csv"
    jsonToCSVParser = new Parser()

    constructor(props: DownloadDataProps) {
        super(props)

        this.handleDownloadClick = this.handleDownloadClick.bind(this)
    }

    async handleDownloadClick() {
        try {
            const requestBody = prepareRequestBody(this.props.state)
            const data = await downloadAllData(this.props.state.searchResult.total, requestBody)
            const selectedCountry = this.props.state.filters[COUNTRY_FIELD]
            let jsonData: AnyParams[] = []
            if (selectedCountry !== "All") {
                const countryRelatedFields = countryToFieldsMapping[selectedCountry]
                jsonData = data.map((d: AnyParams) => {
                    const new_d: AnyParams = {}
                    countryRelatedFields.forEach(field => {
                        new_d[field] = d[field]
                    })
                    return new_d
                })
            } else {
                jsonData = data
            }
            const csvData = this.jsonToCSVParser.parse(jsonData)
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
            if (navigator.msSaveBlob) {
                navigator.msSaveBlob(blob, this.downloadFileName)
            } else {
                var link = document.createElement("a");
                if (link.download !== undefined) {
                    var url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", this.downloadFileName);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
        } catch (e) {
            this.props.dispatch(displayError(e.message))
        }
    }

    render() {
        return <span>
            <Button onClick={this.handleDownloadClick}>Download as CSV</Button>
        </span>
    }
}

function mapStateToProps(state: ReduxState) {
    return {
        state
    }
}

export default connect(mapStateToProps)(DownloadData)