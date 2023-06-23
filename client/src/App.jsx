import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Container, Row, Button, Form, Table } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { LoginForm } from './components/AuthComponents';
import PagesRoute  from './components/PagesRoute';
import { PageView, PageEdit } from './components/PageComponents';
import UserContext from './components/UserContext';
import API from './API';

function DefaultRoute() {
  return (
    <Container className='App'>
      <h1>No data here...</h1>
      <h2>This is not the route you are looking for!</h2>
      <Link to='/'>Please go back to main page</Link>
    </Container>
  );
}

function App() {
  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  const [backOffice, setBackOffice] = useState(false); //All rendering of authenticated/not authenticated is based on this state. The rendering of the button to change it, is controlled by the loggedIn state
  const [siteName, setSiteName] = useState('');
  const [dirty, setDirty] = useState(false); //in order to force useEffect loading pages running also after loading current session
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true); //for initial loading
  const [changingSiteName, setChangingSiteName] = useState(false); //It is set to true in the form for changing site name in PagesRoute, then it's set to false in the useEffect depending on dirty
  const [authLoading, setAuthLoading] = useState(true); //for initial loading
  const [errorMessage, setErrorMessage] = useState(''); //for the handleError function
  
  function handleError(err) {
    console.log('err: '+JSON.stringify(err));  // Only for debug
    let errMsg = 'Unkwnown error';
    if (err.errors) {
      if (err.errors[0])
        if (err.errors[0].msg)
          errMsg = err.errors[0].msg;
    } else if (err.error) {
      errMsg = err.error;
    }

    setErrorMessage(errMsg);
  }

  /* Check if authenticated session is still active in the browser when reloading the app */
  useEffect(()=> {
    API.getUserInfo()
      .then( user => {
        setLoggedIn(true);
        setUser(user);
        setBackOffice(true);
        setDirty(true);
        setAuthLoading(false);
      })
      .catch(err => {
        setDirty(true); //See comment on dirty state
        setAuthLoading(false);
        //Just not authenticated
      })
  }, []);
  /* Load pages and site name from database, whenever dirty is set to true, it makes a distinction on published and all based on current session and officeView */
  useEffect( () => {
    if (dirty) {
      //Fetch all pages, only if logged in and in backOffice
      if(loggedIn && backOffice){
        Promise.all([API.getAllPages(), API.getSiteName()])
          .then( ([pages, siteName]) => {
            setPages(pages);
            setSiteName(siteName);
            setDirty(false);
            setLoading(false); //stop loading
            setChangingSiteName(false);
          })
          .catch(err => {
            handleError(err);
          })
      }
      else {
        //Fetch only published pages if not logged in or logged in and in frontOffice
        Promise.all([API.getPublishedPages(), API.getSiteName()])
          .then( ([pages, siteName]) => {
            setPages(pages);
            setSiteName(siteName);
            setDirty(false);
            setLoading(false); //stop loading
            setChangingSiteName(false);
          })
          .catch(err => {
            handleError(err);
          })
      }

    }
  }, [dirty]);

  const doLogout = async () => {
    //Destroy session on server, so I need to reset all the states based on login
    try{
    setAuthLoading(true);
    setLoading(true);
    await API.logOut();
    setAuthLoading(false);
    setLoggedIn(false);
    setUser(undefined);
    setBackOffice(false);
    setDirty(true);
    } catch(err) {
      handleError(err);
    }
  }

  const loginSuccessful = (user) => {
    setLoading(true);
    setUser(user);
    setLoggedIn(true);
    setDirty(true);  // load latest version of data
  }

  const changeOfficeView = () => {
    setLoading(true);
    setBackOffice((old) => !old);
    setDirty(true);
  }

  const changeSiteName = (siteName) => {
    setChangingSiteName(true); //the useEffect depending on dirty will set it to false. There's no need to put in loading also pages (they will be fetched, but they are not affected by the change of the sitename)
    API.updateSiteName(siteName)
      .then(() => {
        setDirty(true); //To trigger fetch of up-to-date information (pages and siteName)
      })
      .catch((err) => handleError(err)
      );
  }


  const editPage = (page) => {
    setLoading(true);
    API.updatePage(page)
      .then(() => setDirty(true))
      .catch((err) => handleError(err)
      );
  }

  const addPage = (page) => {
    setLoading(true);
    API.addPage(page)
      .then(() => setDirty(true))
      .catch((err) => handleError(err));
  }

  const deletePage = (page_id) => {
    setPages((oldPages) => oldPages.map(
      p => p.page_id !== page_id ? p : Object.assign({}, p, {status: 'deleted'})
    ));
    API.deletePage(page_id)
      .then(() => setDirty(true))
      .catch((err) => handleError(err));
  }

  return (
    <BrowserRouter>
      <UserContext.Provider value={{user: user, loggedIn: loggedIn, loginSuccessful: loginSuccessful, doLogout: doLogout, backOffice: backOffice, changeOfficeView: changeOfficeView, siteName: siteName, authLoading: authLoading}}>
        <Routes>
          {/* The makeDirty props is used to fetch up-to-date pages from the server when user clicks on view action on a page (so that it's transparent to the user) */}
          <Route path="/" element={<PagesRoute pages={pages} deletePage={deletePage} loading={loading} makeDirty={() => setDirty(true)} changeSiteName={changeSiteName} changingSiteName={changingSiteName}
                                   errorMessage={errorMessage} resetErrorMessage={() => setErrorMessage('')}/>} />
          <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm/>} />
          <Route path='/pages/view/:page_id' element={<PageView />} />
          <Route path='/pages/edit/:page_id' element={<PageEdit editPage={editPage}/>} />
          <Route path='/pages/add' element={<PageEdit addPage={addPage}/>} />
          <Route path="/*" element={<DefaultRoute />} />
        </Routes>
      </UserContext.Provider>
    </BrowserRouter>
  )
}

export default App
