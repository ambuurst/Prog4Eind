/**
 * Created by dkroeske on 28/04/2017.
 */

// API - versie 2

const express = require('express');
const router = express.Router();
const auth =  require('../auth/authentication');
const users = require('../datasource/user_ds');
const db = require('../db/mysql-connector');
const assert = require('assert');

//
// Catch all except login
//
router.all( new RegExp("[^(\/login)]"), function (req, res, next) {

    //
    console.log("VALIDATE TOKEN")

    var token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {
        if (err) {
            console.log('Error handler: ' + err.message);
            res.status((err.status || 401 )).json({error: new Error("Niet geautoriseerd (geen valid token)").message});
        } else {
            next();
        }
    });
});


//
// Login with {"username":"<username>", "password":"<password>"}
//
router.route('/login')

    .post( function(req, res) {

        //
        // Get body params or ''
        //
        var username = req.body.username || '';
        var password = req.body.password || '';

        //
        // Check in datasource for user & password combo.
        //
        //
        result = users.filter(function (user) {
            if( user.username === username && user.password === password) {
                return ( user );
            }
        });

        // Debug
        console.log("result: " +  JSON.stringify(result[0]));

        // Generate JWT
        if( result[0] ) {
            res.status(200).json({"token" : auth.encodeToken(username), "username" : username});
        } else {
            res.status(401).json({"error":"Invalid credentials, bye"})
        }

});

router.route('/register')

    .post( function(req, res) {

        //
        // Get body params or ''
        //
        var username = "Jaja"//req.body.username;
        var lastname = "Lala"//req.body.lastname;
        var email = "jaja@nene.nl" //req.body.email;
        var password = "password" //req.body.password;

        const query = {
            sql: 'INSERT INTO `user`(Voornaam, Achternaam, Email, Password) VALUES (?,?,?,?)',
            values: [username, lastname, email, password],
            timeout: 2000
        }

        db.query( query, (error, rows, fields) => {
            if (error) {
                res.status(500).json(error.toString())
            } else {
                res.status(200).json(rows)
            }
        })

    });



//
// Sample ENDPOINT
//

router.post('/studentenhuis', (req, res, next) => {

    let studentenhuis = req.body;

    assert.equal(typeof (req.body.naam), 'string', "Argument 'naam' must be a string.");
    assert.equal(typeof (req.body.adres), 'string', "Argument 'adres' must be a string.");
    assert.equal(typeof (req.body.userId), 'string', "Argument 'userId' must be a string.");

    const query = {
        sql: 'INSERT INTO `studentenhuis`(Naam, Adres, UserID) VALUES (?,?,?)',
        values: [studentenhuis.naam, studentenhuis.adres, studentenhuis.userId],
        timeout: 2000
    }

    db.query(query, (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            res.status(200).json(rows)
        }
    })

});



router.get('/studentenhuis', function(req, res, next) {

    db.query('SELECT * FROM view_studentenhuis', (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            res.status(200).json(rows)
        }
    })
});

router.get('/studentenhuis/:huisId?', function(req, res, next) {

    const huisId = req.params.huisId || '';

    db.query('SELECT * FROM view_studentenhuis WHERE ID = ?', [huisId], (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            if (rows.length > 0) {
                res.status(200).json(rows)
            }

            else{
                res.status(500).json("Niet gevonden (huisId bestaat niet)")
            }
        }
    })
});

router.put('/studentenhuis/:huisId?', function(req, res, next) {

    const huisId = req.params.huisId || '';

    db.query('SELECT * FROM view_studentenhuis WHERE ID = ?', [huisId], (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            if (rows.length > 0) {
                res.status(200).json(rows)
            }

            else{
                res.status(500).json("Niet gevonden (huisId bestaat niet)")
            }
        }
    })
});

router.get('/studentenhuis/:huisId?/maaltijd', function(req, res, next) {

    const huisId = req.params.huisId || '';

    db.query('SELECT ID, Naam, Beschrijving, Ingredienten, Allergie, Prijs FROM maaltijd WHERE ID = ?', [huisId], (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            if (rows.length > 0) {
                res.status(200).json(rows)
            }

            else{
                res.status(500).json("Niet gevonden (huisId bestaat niet)")
            }
        }
    })
});

router.get('/studentenhuis/:huisId?/maaltijd/:maaltijdId?', function(req, res, next) {

    const huisId = req.params.huisId || '';
    const maaltijdId = req.params.maaltijdId || '';

    db.query('SELECT ID, Naam, Beschrijving, Ingredienten, Allergie, Prijs FROM maaltijd WHERE StudentenhuisID = ? AND ID =?', [huisId, maaltijdId], (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            res.status(200).json(rows)
        }
    })
});

router.get('/studentenhuis/:huisId?/maaltijd/:maaltijdId?/deelnemers', function(req, res, next) {

    const huisId = req.params.huisId || '';
    const maaltijdId = req.params.maaltijdId || '';

    db.query('SELECT Voornaam, Achternaam, Email FROM view_deelnemers WHERE StudentenhuisID = ? AND MaaltijdID =?', [huisId, maaltijdId], (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {

            if (rows.length > 0) {
                res.status(200).json(rows)
            }

            else{
                res.status(500).json("Niet gevonden (huisId of maaltijdId bestaat niet)")
            }


        }
    })
});




module.exports = router;