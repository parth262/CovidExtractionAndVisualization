import React, { useState, useEffect } from 'react'
import moment, { Moment } from 'moment-timezone'
import { Card, Accordion, Form } from 'react-bootstrap'
import { AnyParams } from '../../actions/dataModels'
import { fieldsToFilterMapping, Filter, normalizeFieldName } from '../constants'
import { FaRegCheckCircle } from 'react-icons/fa'

export interface DateMinMaxValue {
    min: string
    max: string
}

export interface DateFieldValueMap {
    [field: string]: DateMinMaxValue
}

export type AddDateFilter = (field: string, minMaxValue: DateMinMaxValue) => void

function dateSortingFn(a: Moment, b: Moment): number {
    return a.diff(b)
}

export function prepareDateFilterFieldValueMap(fields: string[], data: AnyParams[]): DateFieldValueMap {
    const dateFormat = "YYYY-MM-DDTHH:mm"
    const dateFilterFields = fields.filter(field =>
        fieldsToFilterMapping.hasOwnProperty(field) &&
        fieldsToFilterMapping[field] === Filter.DATE_FILTER)
    const dateFieldValueMap = dateFilterFields.reduce((fieldValueMap, field) => {
        const allValues = data.map(d => d[field] as string)
            .filter(v => v)
            .map(d => moment.utc(d))
            .sort(dateSortingFn)

        if (allValues.length > 0) {
            return {
                ...fieldValueMap,
                [field]: {
                    min: allValues[0].format(dateFormat),
                    max: allValues[allValues.length - 1].format(dateFormat)
                }
            }
        }
        return {
            ...fieldValueMap,
            [field]: {
                min: moment().format(dateFormat),
                max: moment().format(dateFormat)
            }
        }
    }, {})
    return dateFieldValueMap
}

interface DateFilterProps {
    selectedCountry: string
    fieldValueMap: DateFieldValueMap
    dateFilters: DateFieldValueMap
    addDateFilter: AddDateFilter
}

export default function DateFilter(props: DateFilterProps) {
    const eventKey = "2"
    const seconds = ":00Z"

    const replaceSeconds = (value: string) => {
        return value.replace(seconds, "")
    }

    const updateMinMaxValue = (minMaxValue: DateMinMaxValue) => {
        if (minMaxValue) {
            return {
                min: replaceSeconds(minMaxValue.min),
                max: replaceSeconds(minMaxValue.max)
            }
        }
        return minMaxValue
    }

    const addDateFilter = (field: string, minMaxValue: DateMinMaxValue) => {
        props.addDateFilter(
            field,
            {
                min: minMaxValue.min + seconds,
                max: minMaxValue.max + seconds
            }
        )
    }

    return <React.Fragment>
        {Object.keys(props.fieldValueMap)
            .map((field, i) => {
                const minMaxValue = updateMinMaxValue(props.fieldValueMap[field])
                return <DateFilterBody
                    key={i}
                    applied={props.dateFilters.hasOwnProperty(field)}
                    field={field}
                    eventKey={eventKey + i}
                    minMaxValue={minMaxValue}
                    selectedMinMaxValue={updateMinMaxValue(props.dateFilters[field]) || minMaxValue}
                    addDateFilter={addDateFilter}
                />
            })}
    </React.Fragment>
}

interface DateFilterBodyProps {
    field: string
    applied: boolean
    eventKey: string
    minMaxValue: DateMinMaxValue
    selectedMinMaxValue: DateMinMaxValue
    addDateFilter: AddDateFilter
}

function DateFilterBody(props: DateFilterBodyProps) {
    const [min, setMin] = useState(props.selectedMinMaxValue.min)
    const [max, setMax] = useState(props.selectedMinMaxValue.max)

    useEffect(() => {
        setMin(props.selectedMinMaxValue.min)
        setMax(props.selectedMinMaxValue.max)
    }, [props.selectedMinMaxValue])

    const addFilter = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.stopPropagation()
        props.addDateFilter(
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
                        type="datetime-local"
                        max={max}
                        value={min}
                        onChange={e => setMin(e.target.value)} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Max</Form.Label>
                    <Form.Control
                        size="sm"
                        as={"input"}
                        type="datetime-local"
                        min={min}
                        value={max}
                        onChange={e => setMax(e.target.value)} />
                </Form.Group>
            </Form>
        </Accordion.Collapse>
    </Card>
}