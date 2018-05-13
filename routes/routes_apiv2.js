/**
 * Created by dkroeske on 28/04/2017.
 */

// API - versie 2

const express = require('express');
const router = express.Router();
const db = require('../models/microarchitecture');

// //
// // URL query strings
// //
// router.get('/intel/cpu', (req, res) => {
//
//     let year = req.query.year || '';
//
//     let architecture = db.filter( function(item) {
//         return ( item.info.year === year );
//     });
//
//     res.json(architecture);
// });

//
// URL query strings
//
// https://expressjs.com/en/guide/routing.html
router.get('/intel/cpu/:year?', (req, res) => {

    const year = req.params.year || '';

    let result = [];
    if( year === '' ) {
        result = db;
    } else {
        result = db.filter(function (item) {
            return (item.info.year === year);
        });
    }

    res.json(result);
});

//
// Example endpoint
//
router.get('/help', (req, res) => {
    res.status(200);
    res.json({
        "description": "Help function not available yet"
    });
});

// Fall back, display some info
router.get('*', (req, res) => {
    res.status(200);
    res.json({
        "description": "Thank you for using API version 2"
    });
});


module.exports = router;