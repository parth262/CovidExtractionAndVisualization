import React from 'react'
import { ReduxState } from '../reducers/mainReducer';
import { connect } from 'react-redux';
import { Modal, Spinner } from 'react-bootstrap';

interface LoadingComponentProps {
    loading: boolean
}

function LoadingComponent(props: LoadingComponentProps) {
    return <Modal show={props.loading}>
        <Modal.Body>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Spinner animation={"border"} variant={'primary'} />
                <span style={{ color: "dodgerblue", marginLeft: "8px", fontSize: "20px", fontWeight: "bold" }}>Loading...</span>
            </div>
        </Modal.Body>
    </Modal>
}

function mapStateToProps(state: ReduxState) {
    return {
        loading: state.searchResultLoading
    }
}

export default connect(mapStateToProps)(LoadingComponent)