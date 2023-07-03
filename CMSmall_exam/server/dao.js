'use strict';
/* Data Access Object (DAO) module for accessing pages and blocks*/

const sqlite = require('sqlite3');
const dayjs = require('dayjs');

// open the database
const db = new sqlite.Database('cms_db.db', (err) => {
    if (err) throw err;
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
            const pages = rows.map((row) => ({ page_id: row.page_id, author_id: row.author_id, author_name: row.name, title: row.title, creation_date: row.creation_date, publication_date: row.publication_date }));
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
//Not used
exports.getPublishedPages = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM pages, users WHERE publication_date <= date('now') AND pages.author_id = users.id";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const pages = rows.map((row) => ({ page_id: row.page_id, author_id: row.author_id, author_name: row.name, title: row.title, creation_date: row.creation_date, publication_date: row.publication_date }));
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
//Not used
exports.getPublishedPagesByAuthor = (author_id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM pages, users WHERE publication_date <= date('now') AND pages.author_id = users.id AND author_id = ?";
        db.all(sql, [author_id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const pages = rows.map((row) => ({ page_id: row.page_id, author_id: row.author_id, author_name: row.name, title: row.title, creation_date: row.creation_date, publication_date: row.publication_date }));
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
                resolve({ error: 'Page not found.' });
            } else {
                const page = { page_id: row.page_id, author_id: row.author_id, author_name: row.author_name, title: row.title, creation_date: row.creation_date, publication_date: row.publication_date };
                resolve(page);
            }
        });
    });
}

/**
 * Get the page with the given id and all its content
 * @param {*} page_id 
 * @returns  {Promise} Promise that will be resolved with the page with the given id containing the following fields:
 * 
 * `page_id`, `author_id`, `author_name`, `title`, `publication_date`, {Array}`blocks`
 */
exports.getFrontPageWithContent = (page_id) => {
    return new Promise((resolve, reject) => {
        //Join between pages, users and blocks
        const sql = 'SELECT * FROM pages, users, blocks WHERE blocks.page_id = ? AND pages.author_id = users.id AND pages.page_id = blocks.page_id AND publication_date <= date("now")' ;
        db.all(sql, [page_id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            if (rows.length === 0) {
                resolve({ error: 'Page not found.' });
            } else {
                const page = {
                    page_id: rows[0].page_id, author_id: rows[0].author_id, author_name: rows[0].name,
                    title: rows[0].title, creation_date: rows[0].creation_date, publication_date: rows[0].publication_date,
                    blocks: rows.map((row) => ({ block_id: row.block_id, block_type: row.block_type, content: row.content, position: row.position }))
                };
                resolve(page);
            }
        });
    });
}

exports.getBackPageWithContent = (page_id) => {
    return new Promise((resolve, reject) => {
        //Join between pages, users and blocks
        const sql = 'SELECT * FROM pages, users, blocks WHERE blocks.page_id = ? AND pages.author_id = users.id AND pages.page_id = blocks.page_id' ;
        db.all(sql, [page_id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            if (rows.length === 0) {
                resolve({ error: 'Page not found.' });
            } else {
                const page = {
                    page_id: rows[0].page_id, author_id: rows[0].author_id, author_name: rows[0].name,
                    title: rows[0].title, creation_date: rows[0].creation_date, publication_date: rows[0].publication_date,
                    blocks: rows.map((row) => ({ block_id: row.block_id, block_type: row.block_type, content: row.content, position: row.position }))
                };
                resolve(page);
            }
        });
    });
}

exports.getImages = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM images';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const images = rows.map((row) => ({ image_id: row.image_id, image_name: row.image_name, image_path: row.image_path }));
            resolve(images);
        });
    });
}

exports.getSiteName = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM sites WHERE site_id = 1';
        db.get(sql, [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            const site = { site_name: row.site_name };
            resolve(site);
        });
    });
}

/**
 *  Add a page in the pages table
 * @param {*} author_id 
 * @param {*} title 
 * @param {*} creation_date 
 * @param {*} publication_date 
 * @returns  {Promise} Promise that will be resolved with the id of the newly created page
 */
exports.insertPage = (author_id, title, creation_date, publication_date) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO pages(author_id, title, creation_date, publication_date) VALUES(?, ?, DATE(?), DATE(?))';
        db.run(sql, [author_id, title, creation_date, publication_date], function (err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.lastID);
        });
      });
}
/**
 *  Add a block in the blocks table
 * @param {*} page_id 
 * @param {*} block_type 
 * @param {*} content 
 * @param {*} position 
 * @returns  {Promise} Promise that will be resolved with the id of the newly created block
 */
exports.insertBlock = (page_id, block_type, content, position) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO blocks(page_id, block_type, content, position) VALUES(?,?,?,?)';
        db.run(sql, [page_id, block_type, content, position], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
}

/**
 *  Update the page with the given id
 * @param {*} page_id 
 * @param {*} title 
 * @param {*} publication_date 
 * @returns  {Promise} Promise that will be resolved with the id of the newly created page
 */
exports.updatePage = (page_id, title, publication_date, author_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE pages SET title=?, publication_date=DATE(?), author_id=? WHERE page_id = ?';  
        db.run(sql, [title, publication_date, author_id, page_id], function (err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.changes);
        });
      });
    }

exports.updateSiteName = (site_name, site_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE sites SET site_name=? WHERE site_id = ?';  
        db.run(sql, [site_name, site_id], function (err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.changes);
        });
      });
}

/**
 *  Delete the page with the given id
 * @param {*} page_id 
 * @returns  {Promise} Promise that will be resolved with the number of deleted pages
 */
exports.deletePage = (page_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM pages WHERE page_id = ?';
        db.run(sql, [page_id], function (err) {
          if (err) {
            reject(err);
            return;
          } else
            resolve(this.changes);  // return the number of affected rows
        });
      });
}

/**
 *  Delete the blocks of the page with the given id
 * @param {*} page_id 
 * @returns  {Promise} Promise that will be resolved with the number of deleted blocks
 */
exports.deleteBlocksByPage = (page_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM blocks WHERE page_id = ?'; 
        db.run(sql, [page_id], function (err) {
          if (err) {
            reject(err);
            return;
          } else
            resolve(this.changes);  // return the number of affected rows
        });
      });
}

