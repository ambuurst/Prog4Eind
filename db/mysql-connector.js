const mysql = require('mysql');
const config = require('../config');

let db = mysql.createConnection( {
    host: 'localhost',
    user: 'studentenhuis_user',
    password: 'secret',
    database: 'studentenhuis',
    insecureAuth : true
});

console.log(db.host);

db.connect( (error) => {
    if(error) {
        console.log(error);
        return;
    } else {
        console.log("Connected to " + config.dbServer + ':' + config.dbSchema);
    }
});

module.exports = db;