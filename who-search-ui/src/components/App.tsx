import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/App.css'
import Header from './Header'
import Body from './Body'
import ErrorToast from './ErrorToast'

function App() {
  return <div className="App">
    <ErrorToast />
    <Header />
    <Body />
  </div>
}

export default App;
