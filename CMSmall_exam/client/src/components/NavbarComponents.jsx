import { Navbar, Container, Row, Col, Button, Spinner, Nav, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import UserContext from "./UserContext";
import 'bootstrap-icons/font/bootstrap-icons.css';

function Loading(props) {
    return (
        <Spinner className='m-2' animation="border" role="status" />
    )
}

function NavHeader(props) {
    const session = useContext(UserContext);
    const navigate = useNavigate();
    /* Retrieve current session */
    /* If no authenticated session, session.user is undefined */
    const name = session.user ? session.user.name : undefined;
    const admin = session.user && session.user.admin;
    return (
        <>
        <Navbar bg='primary' variant='dark'>
            <Container fluid>
                <Navbar.Brand className='fs-2'>{session.siteName}</Navbar.Brand>
                {(!props.hidden && session.loggedIn) && <Nav><Button className='mx-2' variant='warning' onClick={() => {session.changeOfficeView();}}>{session.backOffice ? "Back-Office" : "Front-Office"}<i className="bi bi-arrow-repeat"></i></Button></Nav>}
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    {name ? <>
                        <Navbar.Text className='fs-5'>
                            {"Logged in as: " + name + (admin? "(admin)" : "")}
                        </Navbar.Text>
                        {session.authLoading ? <Loading/> : <Button className='mx-2' variant='danger' onClick={() => { session.doLogout(); navigate('/'); }}>Logout</Button>}
                    </> :
                        <Button className='mx-2' variant='warning' onClick={() => navigate('/login')}>Login</Button>}
                </Navbar.Collapse>
            </Container>
        </Navbar>
        </>
    );
}

export default NavHeader;