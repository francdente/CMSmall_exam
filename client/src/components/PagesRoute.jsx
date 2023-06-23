import { Button, Container, Row, Col, Spinner, Alert, Navbar, Nav, Form } from 'react-bootstrap';
import { MainPages } from './PageComponents';
import NavHeader from './NavbarComponents';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from './UserContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Loading(props) {
  return (
    <Spinner className='m-2' animation="border" role="status" />
  )
}

function PagesRoute(props) {
  const [siteName, setSiteName] = useState(""); //only local state, it is saved in the db and spread to the client only after clicking Edit site name
  const [errorMessage, setErrorMessage] = useState("");
  const session = useContext(UserContext);
  const navigate = useNavigate();
  const handleSubmit = (event) => {
    event.preventDefault();
    if (siteName.trim() === "") {
      setErrorMessage("Site name cannot be empty");
      return;
    }
    props.changeSiteName(siteName); //It sets changingSiteName to true, so the Loading component is shown (since it's render is based on session.changingSiteName)
  };

  const handleChange = (value) => {
    if (value.length > 20) {
      return;
    }
    setSiteName(value);
  };
  return (
    <>
      <NavHeader />
      {(session.backOffice && session.user && session.user.admin) ?
      <>
        <Form onSubmit={handleSubmit}>
          <Row className="align-items-center">
            <Col xs={2}>
              <Form.Control className="m-2" type="text" value={siteName} onChange={ev => handleChange(ev.target.value)}/>
            </Col>
            <Col xs={4}>
              {props.changingSiteName ? <Loading /> :
              <Button variant="primary" type="submit">
                Set new site name
              </Button>
              }
            </Col>
          </Row>
        </Form>
        {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : '' /*For error in sitename form */}
        </>
        : false
      }
      {props.errorMessage? <Alert variant='danger' dismissible className='my-2' onClose={props.resetErrorMessage}>
            {props.errorMessage}</Alert> : null /*For error coming from APIs */}
      {session.backOffice &&
        <Navbar bg="light" expand="lg">
          <Container fluid>
            <Nav>Draft: <i className="bi bi-square-fill text-secondary" /></Nav>
            <Nav>Programmed: <i className="bi bi-square-fill text-primary" /></Nav>
            <Nav>Published: <i className="bi bi-square-fill text-success" /></Nav>
          </Container>
        </Navbar>
      }
      <Container fluid>
        {props.loading ? <Loading /> :
          <MainPages pages={props.pages} deletePage={props.deletePage} makeDirty={props.makeDirty} />
        }
        {session.backOffice && <Button variant="primary" onClick={() => navigate("/pages/add")}>Create new page</Button>}
      </Container>
    </>
  );
}

export default PagesRoute;