import { Button, Container, Row, Col, Spinner, Alert, Navbar, Nav, Form, Table } from 'react-bootstrap';
import NavHeader from './NavbarComponents';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from './UserContext';
import 'bootstrap-icons/font/bootstrap-icons.css';
import dayjs from "dayjs";

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

function MainPages(props) {
  const session = useContext(UserContext);
  //Pages are sorted in publication date order on in the API function getPublishedPages()
  return (
    <Container fluid>
      <Row>
        <Col>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Created on</th>
                <th>Published on</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {props.pages.map((e) => <PageRow key={e.page_id} e={e} deletePage={props.deletePage} makeDirty={props.makeDirty} />)}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  )
}

function PageRow(props) {
  const navigate = useNavigate();
  const session = useContext(UserContext);

  const e = props.e;
  let statusClass = null;
  let loading = null;

  if (session.backOffice) {
    if (e.status === 'deleted') {
      statusClass = 'table-danger';
    }
    else if (!e.publication_date.isValid()) {
      e.status = 'draft';
      statusClass = 'table-secondary';
    }
    else if (e.publication_date.isAfter(dayjs(), 'day')) {
      e.status = 'programmed';
      statusClass = 'table-primary';
    }
    else if (e.publication_date.isBefore(dayjs(), 'day') || e.publication_date.isSame(dayjs(), 'day')) {
      e.status = 'published';
      statusClass = 'table-success';
    }
  }
  return (
    <tr className={statusClass}>
      <td>{e.title}</td>
      <td>{e.author_name}</td>
      <td>{e.creation_date.format("YYYY-MM-DD")}</td>
      <td>{e.publication_date.isValid() ? e.publication_date.format("YYYY-MM-DD") : "Not defined"}</td>
      <td>
        <Button variant='outline-primary' onClick={() => { navigate('/pages/view/' + e.page_id); props.makeDirty(); }}><i className='bi bi-eye' /></Button>
        {((session.backOffice && session.user.id === e.author_id) || (session.backOffice && session.user.admin)) ? <Button variant='outline-secondary' className='mx-2' onClick={() => navigate('/pages/edit/' + e.page_id)} ><i className='bi bi-pencil-square' /></Button> : false}
        {((session.backOffice && session.user.id === e.author_id) || (session.backOffice && session.user.admin)) ? <Button variant='outline-danger' onClick={() => props.deletePage(e.page_id)}><i className='bi bi-trash' /></Button> : false}
        {loading ? <Loading /> : false}
      </td>
    </tr>
  );
}

export default PagesRoute;