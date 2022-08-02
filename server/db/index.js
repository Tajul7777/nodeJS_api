const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    password: '',
    user: "root",
    database: 'api_data',
    host: "localhost",
    port: "3306"
});

let db = {};


//get all user /api
db.all = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM categories`, (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

//get a single user /api/:id
db.one = (id) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM categories WHERE id = ?`,[id], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results[0]);
        });
    });
};

module.exports = db;