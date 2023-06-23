//TODO: gestiscilo con context, aggiungi validazione per loginForm !!!
import { Form, Button, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from './UserContext';
import API from '../API';

function Loading(props) {
  return (
      <Spinner className='m-2' animation="border" role="status" />
  )
}

function LoginForm(props) {
  const [username, setUsername] = useState('u1@e.com');
  const [password, setPassword] = useState('pwd');
  const [errorMessage, setErrorMessage] = useState('') ;
  const [loading, setLoading] = useState(false); 
  const session = useContext(UserContext);
  const navigate = useNavigate();

  const doLogIn = (credentials) => {
    setLoading(true);
    API.logIn(credentials)
      .then( user => {
        setErrorMessage('');
        session.loginSuccessful(user);
        setLoading(false);
      })
      .catch(err => {
        // NB: Generic error message, should not give additional info (e.g., if user exists etc.)
        setErrorMessage('Wrong username or password');
        setLoading(false);
      })
  }
  
  const handleSubmit = (event) => {
      event.preventDefault();
      setErrorMessage('');
      const credentials = { username, password };
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // SOME VALIDATION, ADD MORE if needed (e.g., check if it is an email if an email is required, etc.)
      if(username.trim() === '' || password.trim() === ''){
          setErrorMessage('Username and password cannot be empty');
          return;
      }

      doLogIn(credentials);
  };

  return (
      <Container>
          <Row>
              <Col xs={3}></Col>
              <Col xs={6}>
                  <h2>Login</h2>
                  <Form onSubmit={handleSubmit}>
                      {errorMessage ? <Alert variant='danger' dismissible onClick={()=>setErrorMessage('')}>{errorMessage}</Alert> : ''}
                      <Form.Group controlId='username'>
                          <Form.Label>Email</Form.Label>
                          <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
                      </Form.Group>
                      <Form.Group controlId='password'>
                          <Form.Label>Password</Form.Label>
                          <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                      </Form.Group>
                      <Button className='my-2' type='submit'>Login</Button>
                      <Button className='my-2 mx-2' variant='danger' onClick={()=>navigate('/')}>Cancel</Button>
                      {loading && <Loading />}
                  </Form>
              </Col>
              <Col xs={3}></Col>
          </Row>
      </Container>
    )
}

export { LoginForm };