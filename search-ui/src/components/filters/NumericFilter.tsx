import React, { useState, useEffect } from 'react'
import { Card, Accordion, Form } from 'react-bootstrap'
import { AnyParams } from '../../actions/dataModels'
import { fieldsToFilterMapping, Filter, normalizeFieldName } from '../constants'
import { FaRegCheckCircle } from 'react-icons/fa'

export interface MinMaxValue {
    min: number
    max: number
}

export type AddNumericFilter = (field: string, minMaxValue: MinMaxValue) => void

export interface NumericFieldValueMap {
    [field: string]: MinMaxValue
}

export function prepareNumericFilterFieldValueMap(fields: string[], data: AnyParams[]): NumericFieldValueMap {
    const numericFilterFields = fields.filter(field =>
        fieldsToFilterMapping.hasOwnProperty(field) &&
        fieldsToFilterMapping[field] === Filter.NUMBER_FILTER)
    const numericFieldValueMap = numericFilterFields.reduce((fieldValueMap, field) => {
        const allValues: number[] = data.map(d => +d[field]).filter(v => !isNaN(v))
        return {
            ...fieldValueMap,
            [field]: {
                min: Math.min(...allValues),
                max: Math.max(...allValues)
            }
        }
    }, {})
    return numericFieldValueMap
}

interface NumericFilterProps {
    selectedCountry: string,
    fieldValueMap: NumericFieldValueMap,
    numericFilters: NumericFieldValueMap,
    addNumericFilter: AddNumericFilter
}

export default function NumericFilter(props: NumericFilterProps) {

    const eventKey = "1"

    return <React.Fragment>
        {Object.keys(props.fieldValueMap)
            .map((field, i) => <NumericFilterBody
                key={i}
                applied={props.numericFilters.hasOwnProperty(field)}
                field={field}
                eventKey={eventKey + i}
                minMaxValue={props.fieldValueMap[field]}
                selectedMinMaxValue={props.numericFilters[field] || props.fieldValueMap[field]}
                addNumericFilter={props.addNumericFilter}
            />)}
    </React.Fragment>
}

interface NumericFilterBodyProps {
    field: string
    applied: boolean
    eventKey: string
    minMaxValue: MinMaxValue
    selectedMinMaxValue: MinMaxValue
    addNumericFilter: AddNumericFilter
}

function NumericFilterBody(props: NumericFilterBodyProps) {
    const [min, setMin] = useState(props.selectedMinMaxValue.min)
    const [max, setMax] = useState(props.selectedMinMaxValue.max)

    useEffect(() => {
        setMin(props.selectedMinMaxValue.min)
        setMax(props.selectedMinMaxValue.max)
    }, [props.selectedMinMaxValue])

    const addFilter = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.stopPropagation()
        props.addNumericFilter(
            props.field,
            {
                min,
                max
            }
        )
    }

    return <Card bg="dark" text="white" className="fieldFilter">
        <Accordion.Toggle eventKey={props.eventKey} as={Card.Header} className="fieldFilterHeader">
            <div>
                <span>
                    {normalizeFieldName(props.field)}{' '}
                    {props.applied && <FaRegCheckCircle color={"#007bff"} fontSize="16px" />}
                </span>
                {(min !== props.selectedMinMaxValue.min || max !== props.selectedMinMaxValue.max) &&
                    <span onClick={addFilter} className="addFilterBtn">+</span>}
            </div>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={props.eventKey} as={Card.Body}>
            <Form className="FilterBody">
                <Form.Group>
                    <Form.Label>Min</Form.Label>
                    <Form.Control
                        size="sm"
                        as={"input"}
                        type="number"
                        max={max}
                        value={min}
                        onChange={e => setMin(+e.target.value)} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Max</Form.Label>
                    <Form.Control
                        size="sm"
                        as={"input"}
                        type="number"
                        min={min}
                        value={max}
                        onChange={e => setMax(+e.target.value)} />
                </Form.Group>
            </Form>
        </Accordion.Collapse>
    </Card>
}