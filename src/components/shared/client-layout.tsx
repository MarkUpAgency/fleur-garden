import React, { Fragment } from 'react'
import { Header } from '../navigation/header'
import Footer from '../navigation/footer'

function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <Fragment>
            <Header />
            {children}
            <Footer />
        </Fragment>
    )
}

export default ClientLayout