import React from 'react'
import "../styles/Header.css"
import { Navbar } from 'react-bootstrap'
import { headerTitle } from './constants'

interface IProps {
    logout?: () => void
}

export default function Header({ logout }: IProps) {

    return <header>
        <Navbar bg="dark" variant="dark" className="header-navbar">
            <Navbar.Brand>{headerTitle}</Navbar.Brand>
        </Navbar>
    </header>
}