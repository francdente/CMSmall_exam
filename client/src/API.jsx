import dayjs from "dayjs";

const URL = 'http://localhost:3001/api';

/**
 * 
 * @returns {Promise} a promise that will resolve to an array of pages with the following fields:
 * - page_id (Number) the unique id of the page
 * - author_id (Number) the unique id of the author
 * - author_name (String) the name of the author
 * - title (String) the title of the page
 * - creation_date (dayjs) the date of creation of the page
 * - publication_date (dayjs) the date of publication of the page
 * @throws {Error} an error if the request fails
 */
async function getAllPages() {
  /* Authenticated route */
  // call  /api/pages
  return new Promise((resolve, reject) => {
    fetch(URL + `/pages`, {
      method: 'GET',
      credentials: 'include',
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((pages) => resolve(pages.map((p) => ({ page_id: p.page_id, author_id: p.author_id, author_name: p.author_name, title: p.title, creation_date: dayjs(p.creation_date), publication_date: dayjs(p.publication_date) })))
          .sort((a, b) => -a.creation_date.diff(b.creation_date)))
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

/**
 * 
 * @returns {Promise} a promise that will resolve to an array of published pages with the following fields:
 * - page_id (Number) the unique id of the page
 * - author_id (Number) the unique id of the author
 * - author_name (String) the name of the author
 * - title (String) the title of the page
 * - creation_date (dayjs) the date of creation of the page
 * - publication_date (dayjs) the date of publication of the page
 * @throws {Error} an error if the server replies with an error code
 */
async function getPublishedPages() {
  /* Non authenticated route */
  // call  /api/pages/published
  return new Promise((resolve, reject) => {
    fetch(URL + `/pages/published`, {
      method: 'GET',
      credentials: 'include',
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((pages) => resolve(pages.map((p) => ({ page_id: p.page_id, author_id: p.author_id, author_name: p.author_name, title: p.title, creation_date: dayjs(p.creation_date), publication_date: dayjs(p.publication_date) }))
            .sort((a, b) => -a.publication_date.diff(b.publication_date))))
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

async function getPageWithContent(page_id) {
  /* Different behaviours based on authentication */
  return new Promise((resolve, reject) => {
    fetch(URL + `/pages/` + page_id, {
      method: 'GET',
      credentials: 'include',
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((p) => resolve({ page_id: p.page_id, author_id: p.author_id, author_name: p.author_name, title: p.title, creation_date: dayjs(p.creation_date), publication_date: dayjs(p.publication_date), blocks: p.blocks }))
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function getUsers() {
  // call  GET /api/users
  /* Authenticated route, only-admin */
  return new Promise((resolve, reject) => {
    fetch(URL + `/users`, {
      method: 'GET',
      credentials: 'include',
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((users) => resolve(users))
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function getImages() {
  // call  GET /api/images
  /* Authenticated route */
  return new Promise((resolve, reject) => {
    fetch(URL + `/images`, {
      method: 'GET',
      credentials: 'include',
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((images) => resolve(images))
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });

}

function getSiteName() {
  // call  GET /api/sitename
  /* non authenticated route */
  return new Promise((resolve, reject) => {
    fetch(URL + `/sitename`, {
      method: 'GET',
      credentials: 'include',
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((sitename) => resolve(sitename.site_name))
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function updateSiteName(site_name) {
  /* Authenticated route, only admin */
  // call  PUT /api/sitename
  return new Promise((resolve, reject) => {
    fetch(URL + `/sitename`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      //It receives an undefined publication_date if the user didn't set it
      body: JSON.stringify({ site_name: site_name }),
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function updatePage(page) {
  /* Authenticated route, different behaviours based on admin or normal authenticated user */
  // call  PUT /api/pages/:page_id
  return new Promise((resolve, reject) => {
    fetch(URL + `/pages/${page.page_id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      //It receives an undefined publication_date if the user didn't set it
      body: JSON.stringify(Object.assign({}, page, { publication_date: page.publication_date && page.publication_date.format("YYYY-MM-DD") })),
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function addPage(page) {
  // call  POST /api/pages
  /* Authenticated route */
  return new Promise((resolve, reject) => {
    fetch(URL + `/pages`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      //It receives an undefined publication_date if the user didn't set it
      body: JSON.stringify(Object.assign({}, page, { publication_date: page.publication_date && page.publication_date.format("YYYY-MM-DD") })),
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function deletePage(page_id) {
  /* Authenticated route, different behaviours based on admin or normal authenticated user */
  // call  DELETE /api/pages/:page_id
  return new Promise((resolve, reject) => {
    fetch(URL + `/pages/${page_id}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}





/* Authentication */

async function logIn(credentials) {
  let response = await fetch(URL + '/sessions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logOut() {
  await fetch(URL + '/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
}

/**
 *  Retrieve user info for the logged in user, otherwise it throws an error
 * @returns {Promise} a promise that will resolve to the user info object
 */
async function getUserInfo() {
  const response = await fetch(URL + '/sessions/current', {
    credentials: 'include'
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}



const API = {
  logIn, logOut, getUserInfo, getAllPages, getPublishedPages, getPageWithContent, updatePage, addPage, deletePage, getUsers, getImages, getSiteName, updateSiteName
};
export default API;