import React from 'react'
import { Toast } from 'react-bootstrap'
import { ReduxState } from '../reducers/mainReducer'
import { connect } from 'react-redux'
import { FaExclamationTriangle } from 'react-icons/fa'

interface ErrorToastProps {
    show: boolean
    errorMessage: string
}

function ErrorToast(props: ErrorToastProps) {

    return <Toast
        style={{
            position: "fixed",
            top: "8px",
            right: "8px",
            zIndex: 99,
            minWidth: "300px"
        }}
        show={props.show}
    >
        <Toast.Body>
            <span style={{ display: "flex", alignItems: "center", fontSize: "16px", color: "#ff0000" }}>
                <FaExclamationTriangle />
                <span style={{ marginLeft: "0.5em" }}>{props.errorMessage}</span>
            </span>
        </Toast.Body>
    </Toast>
}

function mapStateToProps(state: ReduxState) {
    return {
        ...state.error
    }
}

export default connect(mapStateToProps)(ErrorToast)