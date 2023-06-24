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
const dayjs = require('dayjs');

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
  userDao.getUserById(id) /*This function returns also the info about the admin boolean */
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});


// init express
const app = express();
//Deve partire da porta 3001
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions)); // NB: Usare solo per sviluppo e per l'esame! Altrimenti indicare dominio e porta corretti
app.use('/static', express.static('public')); // serve static files

const answerDelay = 0; // 1 second

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
/* Authenticated route */
// Get the list of all the pages in the DB
app.get('/api/pages', isLoggedIn, async (req, res) => {
  try {
    const pages = await dao.getPages();
    setTimeout(() => res.json(pages), answerDelay);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});
// GET /api/pages/published
// Get the list of all the published pages in the DB
/* Non-Authenticated route */
app.get('/api/pages/published', async (req, res) => {
  try {
    const pages = await dao.getPublishedPages();
    setTimeout(() => res.json(pages), answerDelay);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});


// GET /api/pages/:page_id
// Get the page along with its content based on the given id
/* Different behaviours based on auth or no auth*/
app.get('/api/pages/:page_id', async (req, res) => {
  try {
    let page;
    if (req.isAuthenticated()) {
      page = await dao.getBackPageWithContent(req.params.page_id);
    }
    else {
      page = await dao.getFrontPageWithContent(req.params.page_id);
    }
    if (page.error) {
      res.status(404).json(page);
    }
    else {
      setTimeout(() => res.json(page), answerDelay);
    }
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

// GET /api/images
/* Authenticated route */
// Get the list of all the images available
app.get('/api/images', isLoggedIn, async (req, res) => {
  try {
    const images = await dao.getImages();
    setTimeout(() => res.json(images), answerDelay);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

// GET /api/sitename
// Get the name of the site
/* Non-Authenticated route */
app.get('/api/sitename', async (req, res) => {
  try {
    const site_name = await dao.getSiteName();
    setTimeout(() => res.json(site_name), answerDelay);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

// middleware to check if at least one header and one other block are present and if position are consistent numbers in PUT and POST requests
const checkBlocks = (req, res, next) => {
  const blocks = req.body.blocks;
  let header = false;
  let other = false;
  let position = false;
  console.log(blocks);
  blocks.forEach(b => { if (b.block_type === "header") header = true; else other = true; if (b.position >= blocks.length) position = true; });
  const tmpSet = new Set(blocks.map(b => b.position));
  //Check if at least one header and one other block are present
  if (!header) {
    return res.status(422).json({ errors: [{ msg: "You need at least one header in your page" }] });
  }
  else if (!other) {
    return res.status(422).json({ errors: [{ msg: "You need at least one block that is not a header in your page" }] });
  }
  //Check if position is lower than the number of blocks, and if all the positions are different
  if (position || tmpSet.size !== blocks.length) {
    return res.status(422).json({ errors: [{ msg: "The position of at least one block is not valid" }] });
  }
  return next(); 
}

// PUT /api/sitename
// Update the site with the given name
/* Authenticated route, only admin */
app.put('/api/sitename', isLoggedIn, [
  check('site_name').isString().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  if (!req.user.admin) {
    return res.status(401).json({ errors: [{ msg: "Only admins can update the site name" }] });
  }
 
  try {
    await dao.updateSiteName(req.body.site_name, 1);
    setTimeout(() => res.status(200).end(), answerDelay);
  }
  catch (err) {
    console.log(err);
    res.status(503).json({ error: "Database error during the update of page" });
  }
});
 
// PUT /api/pages/:page_id
// Update the page with the given id
/* Authenticated route, different behaviours based on admin or user*/
app.put('/api/pages/:page_id', isLoggedIn, [
  check("page_id").isInt(),
  check("author_id").isInt( {min: 0} ),
  check("title").isString().notEmpty(),
  check("publication_date").optional().isDate({ format: 'YYYY-MM-DD', strictMode: true }),
  check("blocks").isArray(),
  check("blocks.*.block_type").isIn(["paragraph", "header", "image"]),
  check("blocks.*.content").isString().notEmpty(),
  check("blocks.*.position").isInt({ min: 0 }), 
], checkBlocks, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const newPage = req.body;
  try {
    const page = await dao.getPage(req.params.page_id);
    //Page to update not found
    if (page.error) {
      return res.status(404).json(page);
    }
    //check on user can change only his pages, unless he is admin
    if (req.user.id != page.author_id && !req.user.admin) {
      return res.status(401).json({ error: "You can't edit this page" });
    }
    // check on author_id changeable only by admin
    if (newPage.author_id != page.author_id && !req.user.admin) {
      return res.status(401).json({ error: "You can't change the author of this page" });
    }
    //check if author_id is a valid user
    if (req.user.admin) {
      const user = await userDao.getUserById(req.body.author_id);
      if (user.error){
        return res.status(422).json({ errors: [{ msg: "The author_id is not a valid user" }] });
      }
    }
    //check if new publication date is after the creation date
    if (newPage.publication_date && dayjs(page.creation_date).isAfter(newPage.publication_date, 'day')) {
      return res.status(422).json({ errors: [{ msg: "The publication date cannot be before the creation date" }] });
    }

    //delete all the blocks of the page and update the page
    await Promise.all([dao.deleteBlocksByPage(req.params.page_id),
    dao.updatePage(req.params.page_id, newPage.title, newPage.publication_date, newPage.author_id)
    ]);   
    //add the new blocks for the page
    await Promise.all(newPage.blocks.map(block => dao.insertBlock(req.params.page_id, block.block_type, block.content, block.position)));

    setTimeout(() => res.status(200).end(), answerDelay);

  }
  catch (err) {
    console.log(err);
    res.status(503).json({ error: "Database error during the update of page" });
  }
});


// POST /api/pages/
// Create a new page in the db
/* Authenticated route different behaviours based on admin or user*/
app.post('/api/pages', isLoggedIn, [
  check("title").isString().notEmpty(),
  check("publication_date").optional().isDate({ format: 'YYYY-MM-DD', strictMode: true }),
  check("author_id").isInt( { min: 0 } ),
  check("blocks").isArray(),
  check("blocks.*.block_type").isIn(["paragraph", "header", "image"]),
  check("blocks.*.content").isString().notEmpty(),
  check("blocks.*.position").isInt( { min: 0 } ),
], checkBlocks, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    //check on user can create only pages owned by him, unless he is admin
    if (req.user.id != req.body.author_id && !req.user.admin) {
      return res.status(401).json({ error: "You can't create a page for another user" });
    }
    //check if author_id is a valid user
    if (req.user.admin) {
      const user = await userDao.getUserById(req.body.author_id);
      if (user.error){
        return res.status(422).json({ errors: [{ msg: "The author_id is not a valid user" }] });
      }
    }
    //check if publication date is after the creation date(so now)
    if (req.body.publication_date && dayjs().isAfter(req.body.publication_date, 'day')) {
      return res.status(422).json({ errors: [{ msg: "The publication date cannot be before the creation date" }] });
    }

    //I use req.body.author_id (so that this can work both for admin and user), already checked in the if above. If he's a user, I'm sure it's his id.
    const page_id = await dao.insertPage(req.body.author_id, req.body.title, dayjs().format("YYYY-MM-DD"), req.body.publication_date);
    await Promise.all(req.body.blocks.map(block => dao.insertBlock(page_id, block.block_type, block.content, block.position)));
    setTimeout(() => res.status(201).end(), answerDelay);
  }
  catch (err) {
    console.log(err);
    res.status(503).json({ error: "Database error during the update of page" });
  }
});

// DELETE /api/pages/:page_id
// Delete the page with the given id in the db
/* Authenticated route, different behaviours based on admin or user*/
app.delete('/api/pages/:page_id', isLoggedIn, async (req, res) => {
  try {
    const page = await dao.getPage(req.params.page_id);
    //Check if the user is admin or if he is the author of the page
    if (req.user.id != page.author_id && !req.user.admin) {
      return res.status(401).json({ error: "You can't edit this page" });
    }
    const numRowChanges = await dao.deletePage(req.params.page_id);
    if (numRowChanges > 0) {
      await dao.deleteBlocksByPage(req.params.page_id);
    }
    // number of changed rows is sent to client as an indicator of success
    setTimeout(()=>res.status(204).json(numRowChanges), answerDelay);
  } catch(err) {
    console.log(err);
    res.status(503).json({ error: `Database error during the deletion of answer ${req.params.id}.`});
  }
});

/*** Users APIs ***/

// GET /api/users
/* Only admin route */
app.get('/api/users',isLoggedIn, async (req, res) => {
  if (!req.user.admin) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const users = await userDao.getUsers();
    setTimeout(() => res.status(200).json(users), answerDelay);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).end(); //it previously was res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => { setTimeout(() => res.end(), answerDelay); }); //the default returned status is 200
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    setTimeout(() => res.status(200).json(req.user), answerDelay);
  }
  else
    res.status(401).json({ error: 'Unauthenticated user!' });;
});




/*** Other express-related instructions ***/

// Activate the server
app.listen(port, () => {
  console.log(`cms-server listening at http://localhost:${port}`);
});
