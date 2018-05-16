const mysql = require('mysql');
const config = require('../config');

let db = mysql.createConnection( {
    host: '188.166.109.108',
    user: 'studentenhuis_user',
    password: 'secret',
    database: 'studentenhuis',
    insecureAuth : true
});



db.connect( (error) => {
    if(error) {
        console.log(error);
        return;
    } else {
        console.log("Connected to " + config.dbServer + ':' + config.dbSchema);
    }
});

module.exports = db;