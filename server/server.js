'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const { check, validationResult } = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the user info in the DB
const cors = require('cors');

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});


// init express
const app = express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions)); // NB: Usare solo per sviluppo e per l'esame! Altrimenti indicare dominio e porta corretti

const answerDelay = 300;

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'Not authenticated' });
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'wg28d2r9bwd9srksfb',   //personalize this random string, should be a secret value
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());


/*** APIs ***/

// GET /api/pages
// Get the list of all the pages in the DB
app.get('api/pages', async (req, res) => {
  try {
    const pages = await dao.getPages();
    setTimeout(()=>res.json(pages), answerDelay);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

// GET /api/pages/published
// Get the list of all the published pages in the DB
app.get('api/pages/published', async (req, res) => {
  try {
    const pages = await dao.getPublishedPages();
    setTimeout(()=>res.json(pages), answerDelay);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});


// GET /api/pages/:page_id
// Get the page with the given id
app.get('api/pages/:page_id', async (req, res) => {
  try {
    const page = await dao.getPage(req.params.page_id);
    if (page.error) {
      res.status(404).json(page);
    }
    else {
      setTimeout(()=>res.json(page), answerDelay);
    }
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});








/*** Other express-related instructions ***/

// Activate the server
app.listen(port, () => {
  console.log(`cms-server listening at http://localhost:${port}`);
});
