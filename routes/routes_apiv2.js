/**
 * Created by dkroeske on 28/04/2017.
 */

// API - versie 2

const express = require('express');
const router = express.Router();
const auth =  require('../auth/authentication');
const users = require('../datasource/user_ds');
const db = require('../datasource/intel');

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
            res.status((err.status || 401 )).json({error: new Error("Not authorised").message});
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


//
// Sample ENDPOINT
//
router.get('/intel/:year?', function(req, res, next) {

    const year = req.params.year || '';
    let result = [];

    if( year ) {
        console.log('year')

        result = db.filter( function(item) {
            return ( item.info.year == year );
        })
    } else {
        result = intel_microarchitecture;
    }

    res.json(result);
});


module.exports = router;