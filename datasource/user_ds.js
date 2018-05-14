const db = require('../db/mysql-connector');



db.query('SELECT Email FROM user', function (error, result, fields) {
    if (error) {
        res.status(500).json(error.toString())
    } else {

        var string = JSON.stringify(result)

        var json = JSON.parse(string)

        var x = json[0]

        var Email = x["Email"]




    }
});

db.query('SELECT Password FROM user', function (error, result, fields) {
    if (error) {
        res.status(500).json(error.toString())
    } else {

        var string = JSON.stringify(result)

        var json = JSON.parse(string)

        var x = json[0]

        var Password = x["Password"]



    }
});


user = [{
    username: "",
    password: ""
}];

// console.log(user)



module.exports = user;