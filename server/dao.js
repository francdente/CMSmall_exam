'use strict';
/* Data Access Object (DAO) module for accessing questions and answers */

const sqlite = require('sqlite3');
const dayjs = require('dayjs');

// open the database
const db = new sqlite.Database('cms_db.sqlite', (err) => {
  if(err) throw err;
});

/**
 * Get the list of all the pages in the DB
 * @returns {Promise} Promise that will be resolved with the list of all the pages int the DB containing the following fields: 
 * 
 * `page_id`, `author_id`, `author_name`, `title`, `creation_date`, `publication_date`
 */
exports.getPages = () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM pages, users WHERE pages.author_id = users.id';
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        const pages = rows.map((row) => ({page_id: row.page_id, author_id: row.author_id, author_name: row.name, title: row.title, creation_date: row.creation_date, publication_date: row.publication_date }));
        resolve(pages);
      });
    });
  };

/**
 *  Get the list of all the pages in the DB written by the author with the given id
 * @param {*} author_id 
 * @returns  {Promise} Promise that will be resolved with the list of the pages in the DB written by the author with the given id containing the following fields:
 * 
 * `page_id`, `author_id`, `author_name`, `title`, `creation_date`, `publication_date`
 */
exports.getPagesByAuthor = (author_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM pages, users WHERE pages.author_id = users.id AND author_id = ?';
        db.all(sql, [author_id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const pages = rows.map((row) => ({page_id: row.page_id, author_id: row.author_id, author_name: row.name, title: row.title, creation_date: row.creation_date, publication_date: row.publication_date }));
            resolve(pages);
        });
    });
};

/**
 * 
 * @returns {Promise} Promise that will be resolved with the list of the published pages in the DB containing the following fields: 
 * 
 * `page_id`, `author_id`, `author_name`, `title`, `creation_date`, `publication_date`
 */
exports.getPublishedPages = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM pages, users WHERE publication_date <= date('now') AND pages.author_id = users.id";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const pages = rows.map((row) => ({page_id: row.page_id, author_id: row.author_id, author_name: row.name, title: row.title, creation_date: row.creation_date, publication_date: row.publication_date }));
            resolve(pages);
        });
    });
};

/**
 * 
 * @param {*} author_id 
 * @returns  {Promise} Promise that will be resolved with the list of the published pages in the DB written by the author with the given id containing the following fields:
 * 
 * `page_id`, `author_id`, `author_name`, `title`, `creation_date`, `publication_date`
 */
exports.getPublishedPagesByAuthor = (author_id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM pages, users WHERE publication_date <= date('now') AND pages.author_id = users.id AND author_id = ?";
        db.all(sql, [author_id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const pages = rows.map((row) => ({page_id: row.page_id, author_id: row.author_id, author_name: row.name, title: row.title, creation_date: row.creation_date, publication_date: row.publication_date }));
            resolve(pages);
        });
    });
};

/**
 * 
 * @param {*} page_id 
 * @returns  {Promise} Promise that will be resolved with the page with the given id containing the following fields:
 * 
 * `page_id`, `author_id`, `author_name`, `title`, `creation_date`, `publication_date`
 */
exports.getPage = (page_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM pages, users WHERE page_id = ? AND pages.author_id = users.id';
        db.get(sql, [page_id], (err, row) => {
        if (err) {
            reject(err);
            return;
        }
        if (row === undefined) {
            resolve({error: 'Page not found.'});
        } else {
            const page = {page_id: row.page_id, author_id: row.author_id, author_name: row.author_name, title: row.title, creation_date: row.creation_date, publication_date: row.publication_date };
            resolve(page);
        }
        });
    });
}

exports.getPageWithContent = (page_id) => {
    return new Promise((resolve, reject) => {
        //Join between pages, users and blocks
        const sql = 'SELECT * FROM pages, users, blocks WHERE page_id = ? AND pages.author_id = users.id AND pages.page_id = blocks.page_id';
        db.all(sql, [page_id], (err, row) => {
        if (err) {
            reject(err);
            return;
        }
        if (row === undefined) {
            resolve({error: 'Page not found.'});
        } else {
            const page = {page_id: row.page_id, author_id: row.author_id, author_name: row.author_name, title: row.title, creation_date: row.creation_date, publication_date: row.publication_date };
            resolve(page);
        }
        });
    });
}


