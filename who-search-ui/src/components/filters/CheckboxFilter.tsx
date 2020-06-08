import React, { useState } from 'react'
import { Accordion, Card, Form } from 'react-bootstrap'
import { fieldsToFilterMapping, Filter, normalizeFieldName } from '../constants'
import { Facets } from '../../actions/dataModels'
import { arrayMatches } from './common'
import { FaRegCheckCircle } from 'react-icons/fa'


export interface FieldValueMap {
    [field: string]: string[]
}

export type AddCategoryFilter = (field: string, values: string[]) => void

interface CheckboxFilterProps {
    selectedCountry: string,
    fieldValueMap: FieldValueMap,
    categoryFilters: FieldValueMap,
    addCategoryFilter: AddCategoryFilter
}

export function prepareCategoryFilterFieldValueMap(fields: string[], facets: Facets): FieldValueMap {
    const checkboxFilterFields = fields.filter(field =>
        fieldsToFilterMapping.hasOwnProperty(field) &&
        fieldsToFilterMapping[field] === Filter.CHECKBOX_FILTER)
    const checkboxFilterFieldValuesMapping: FieldValueMap = checkboxFilterFields.reduce((fieldValueMap, field) => {
        const distinctValues = facets[field]
        if (distinctValues && distinctValues.length > 0) {
            return {
                ...fieldValueMap,
                [field]: distinctValues.map(facetValue => facetValue.value)
            }
        }
        return fieldValueMap
    }, {})
    return checkboxFilterFieldValuesMapping
}

export default function CheckboxFilter(props: CheckboxFilterProps) {

    const eventKey = "0"

    return <React.Fragment>
        {Object.keys(props.fieldValueMap)
            .map((field, i) => <CategoryFilterBody
                key={i}
                applied={props.categoryFilters.hasOwnProperty(field)}
                field={field}
                eventKey={eventKey + i}
                values={props.fieldValueMap[field]}
                selectedValues={props.categoryFilters[field] || []}
                addCategoryFilter={props.addCategoryFilter}
            />)}
    </React.Fragment>
}

interface FilterBodyProps {
    field: string
    applied: boolean
    eventKey: string
    values: string[]
    selectedValues: string[]
    addCategoryFilter: AddCategoryFilter
}

function CategoryFilterBody(props: FilterBodyProps) {
    const [selectedValues, handleValueSelect] = useState(props.selectedValues)

    const setValue = (value: string, add: boolean) => {
        if (add) {
            handleValueSelect([...selectedValues, value])
        } else {
            handleValueSelect(selectedValues.filter(v => v !== value))
        }
    }

    const addFilter = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.stopPropagation()
        props.addCategoryFilter(props.field, selectedValues)
    }

    return <Card bg="dark" text="white" className="fieldFilter">
        <Accordion.Toggle eventKey={props.eventKey} as={Card.Header} className="fieldFilterHeader">
            <div>
                <span>
                    {normalizeFieldName(props.field)}{' '}
                    {props.applied && <FaRegCheckCircle color={"#007bff"} fontSize="16px" />}
                </span>
                {selectedValues.length > 0 &&
                    !arrayMatches(selectedValues, props.selectedValues) &&
                    <span onClick={addFilter} className="addFilterBtn">+</span>}
            </div>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={props.eventKey} as={Card.Body}>
            <Form className="FilterBody">
                {props.values
                    .map((v, i) => <Form.Check
                        inline
                        type={"checkbox"}
                        key={i}
                        id={props.field + (v || "Empty")}
                        label={"" + v || "Empty"}
                        checked={selectedValues.some(sV => sV === v)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(v, e.target.checked)}
                    />)}
            </Form>
        </Accordion.Collapse>
    </Card>
}