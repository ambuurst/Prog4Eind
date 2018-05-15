
const express = require('express');
const router = express.Router();
const auth =  require('../auth/authentication');
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
// Login with {"email":"<email>", "password":"<password>"}
//
router.route('/login')

    .post( function(req, res) {

        //
        // Get body params or ''
        //
        var email = req.body.email || '';
        var password = req.body.password || '';

        db.query('SELECT Password FROM user WHERE Email = ?', [email] , function (error, result, fields) {
            if (error) {
                res.status(500).json(error.toString())
            } else {


                var string = JSON.stringify(result)

                var json = JSON.parse(string)

                var x = json[0]

                var Password = x["Password"]

                if(Password === password){
                    res.status(200).json({"token" : auth.encodeToken(email), "email" : email});
                } else{
                    res.status(401).json({"error":"Invalid credentials, bye"})
                }

                // console.log(Password)
            }
        });

});

router.route('/register')

    .post( function(req, res) {

        //
        // Get body params or ''
        //
        var username = req.body.username;
        var lastname = req.body.lastname;
        var email = req.body.email;
        var password = req.body.password;


        const query = {
            sql: 'INSERT INTO `user`(Voornaam, Achternaam, Email, Password) VALUES (?,?,?,?)',
            values: [username, lastname, email, password],
            timeout: 2000
        }

        db.query( query, (error, rows, fields) => {
            if (error) {
                res.status(500).json(error.toString())
            } else {
                res.status(200).json({"token" : auth.encodeToken(username), "username" : username})
            }
        })

    });


router.post('/studentenhuis', (req, res, next) => {

    var naam = req.body.naam;
    var adres = req.body.adres;
    var email;
    var UserId;


    var token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {

            var string = JSON.stringify(payload)

            var json = JSON.parse(string)

             email = json.sub;



    });

    db.query('SELECT ID FROM user WHERE Email = "' + email + '"', (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            res.status(200)
            var string = JSON.stringify(rows)

            var json = JSON.parse(string)

            var x = json[0]

            UserId = x["ID"]
            db.query('INSERT INTO `studentenhuis`(Naam, Adres, UserID) VALUES (?, ?, ?)', [naam, adres, UserId], (error, rows, fields) => {
                if (error) {
                    res.status(500).json(error.toString())
                } else {
                    res.status(200).json(rows)
                }
            })
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
    var naam = req.body.naam;
    var adres = req.body.adres;
    var email;
    var UserId;

    var token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {

        var string = JSON.stringify(payload)

        var json = JSON.parse(string)

        email = json.sub;


    });

    db.query('SELECT ID FROM user WHERE Email = "' + email + '"', (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            res.status(200)
            var string = JSON.stringify(rows)

            var json = JSON.parse(string)

            var x = json[0]

            UserId = x["ID"]

            var query = {
                sql: 'UPDATE `studentenhuis` SET Naam = ?, Adres = ? WHERE ID = ? AND UserID = ?',
                values: [naam, adres, huisId, UserId],
                timeout: 2000
            }
            db.query(query, (error, rows, fields) => {
                if (huisId == '') {
                    res.status(500).json("Vul een HuisId in")
                }

                 else if (rows.affectedRows == 0) {
                     res.status(500).json("Niet gevonden (huisId bestaat niet of geen toegang)")
                 }

                else if (error) {
                    res.status(500).json(error.toString())

                } else {

                    res.status(200).json("Toevoeging gelukt")
                }

            })
        }
    })
})

router.delete('/studentenhuis/:huisId?', function(req, res, next) {

    const huisId = req.params.huisId || '';
    var email;
    var UserId;


    var token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {

        var string = JSON.stringify(payload)

        var json = JSON.parse(string)

        email = json.sub;


    });

    db.query('SELECT ID FROM user WHERE Email = "' + email + '"', (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            res.status(200)
            var string = JSON.stringify(rows)

            var json = JSON.parse(string)

            var x = json[0]

            UserId = x["ID"]

            db.query("SET FOREIGN_KEY_CHECKS = 0")
            db.query('DELETE FROM studentenhuis WHERE ID = ? AND UserID = ?', [huisId], [UserId], (error, rows, fields) => {

                if (huisId == '') {
                    res.status(500).json("Vul een HuisId in")
                }

                else if (rows.affectedRows == 0) {
                    res.status(500).json("Niet gevonden (huisId bestaat niet of geen toegang)")
                }

                else if (error) {
                    res.status(500).json(error.toString())

                } else {

                    res.status(200).json("Verwijdering gelukt")
                }
            })
        }
    })
})

router.post('/studentenhuis/:huisId?/maaltijd', function (req, res, next) {
    var naam = req.body.naam;
    var beschrijving = req.body.beschrijving;
    var ingredienten = req.body.ingredienten;
    var allergie = req.body.allergie;
    var prijs = req.body.prijs;
    var huisId = req.params.huisId || '';

    console.log(naam);
    console.log(beschrijving);
    console.log(ingredienten);
    console.log(allergie);
    console.log(prijs);


    var token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {

        var string = JSON.stringify(payload)

        var json = JSON.parse(string)

        email = json.sub;
    });
    console.log(email)

    db.query('SELECT ID FROM user WHERE Email = "' + email + '"', (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            res.status(200)
            var string = JSON.stringify(rows)

            var json = JSON.parse(string)

            var x = json[0]

            var UserId = x["ID"]

            db.query("SET FOREIGN_KEY_CHECKS = 0")

            db.query('INSERT INTO `maaltijd` (Naam, Beschrijving, Ingredienten, Allergie, Prijs, UserID, StudentenhuisID) VALUES (?,?,?,?,?,?,?)', [naam, beschrijving, ingredienten, allergie, prijs, UserId, huisId ], (error, rows, fields) => {
                if (error) {
                    res.status(500).json(error.toString())
                } else {
                    res.status(200).json(rows)
                }

            });


            //
            // db.query('SELECT StudentenhuisID FROM `view_deelnemers` WHERE Email = "' + email + '"', (error, rows, fields) =>{
                //         if(error){
                //             res.status(500).json(error.toString())
                //         } else {
                //             res.status(200)
                //             var string = JSON.stringify(rows)
                //
                //             var json = JSON.parse(string)
                //
                //             var x = json[0]
                //
                //             var StudentenhuisID = x["StudentenhuisID"]
                //
                //             db.query("SET FOREIGN_KEY_CHECKS = 0")
                //
                //             db.query('INSERT INTO `maaltijd` (Naam, Beschrijving, Ingredienten, Allergie, Prijs, UserID, StudentenhuisID) VALUES (?,?,?,?,?,?,?)', [naam, beschrijving, ingredienten, allergie, prijs, UserId, StudentenhuisID ], (error, rows, fields) => {
                //                 if (error) {
                //                     res.status(500).json(error.toString())
                //                 } else {
                //                     res.status(200).json(rows)
                //                 }
                //
                //             });
                //
                //         }
                //     } )
                // }
        }
    })



})

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

router.put('/studentenhuis/:huisId?/maaltijd/:maaltijdId?', function(req, res, next) {

    const huisId = req.params.huisId || '';
    const maaltijdId = req.params.maaltijdId || '';
    const naam = req.body.naam || '';
    const beschrijving = req.body.beschrijving || '';
    const ingredienten = req.body.ingredienten || '';
    const allergie = req.body.allergie || '';
    const prijs = req.body.prijs || '';
    var email;
    var UserId;


    var token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {

        var string = JSON.stringify(payload)

        var json = JSON.parse(string)

        email = json.sub;


    });

    db.query('SELECT ID FROM user WHERE Email = "' + email + '"', (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            res.status(200)
            var string = JSON.stringify(rows)

            var json = JSON.parse(string)

            var x = json[0]

            UserId = x["ID"]

            var query = {
                sql: 'UPDATE `maaltijd` SET Naam = ?, Beschrijving = ?, Ingredienten = ?, Allergie = ?, Prijs = ?  WHERE ID = ? AND UserID = ? AND StudentenhuisID = ?',
                values: [naam, beschrijving, ingredienten, allergie, prijs, maaltijdId, UserId, huisId],
                timeout: 2000
            }
            db.query(query, (error, rows, fields) => {
                 if (huisId == '') {
                     res.status(500).json("Vul een HuisId in")
                 }

                 else if (rows.affectedRows == 0) {
                     res.status(500).json("Niet gevonden (huisId bestaat niet of geen toegang)")

                 }

                else if (error) {
                    res.status(500).json(error.toString())

                } else {

                    res.status(200).json("Toevoeging gelukt")
                }

            })
        }
    })
})

router.delete('/studentenhuis/:huisId?/maaltijd/:maaltijdId?', function(req, res, next) {

    var huisId = req.params.huisId || '';
    var maaltijdId = req.params.maaltijdId || '';
    var email;
    var UserId;


    var token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {

        var string = JSON.stringify(payload)

        var json = JSON.parse(string)

        email = json.sub;


    });

    db.query('SELECT ID FROM user WHERE Email = "' + email + '"', (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            res.status(200)
            var string = JSON.stringify(rows)

            var json = JSON.parse(string)

            var x = json[0]

            UserId = x["ID"]


            db.query("SET FOREIGN_KEY_CHECKS = 0")
            db.query('DELETE FROM maaltijd WHERE StudentenhuisID = ? AND ID =? AND UserID = ?', [huisId, maaltijdId, UserId], (error, rows, fields) => {

                if (huisId == '' || maaltijdId == '') {
                    res.status(500).json("Vul een HuisId en maaltijdId in")
                }

                else if (rows.affectedRows == 0) {
                    res.status(500).json("Niet gevonden (huisId of maaltijdId bestaat niet of geen toegang)")
                }

                else if (error) {
                    res.status(500).json(error.toString())

                } else {

                    res.status(200).json("Verwijdering gelukt")
                }
            })
        }
    })
})

<<<<<<< HEAD
router.post('/studentenhuis/:huisId?/maaltijd/:maaltijdId?/deelnemers', function(req, res, next){
    var voornaam = req.body.voornaam;
    var achternaam = req.body.achternaam;
    var email = req.body.email;
    var huisId = req.params.huisId;
    var maaltijdId = req.params.maaltijdId;

    db.query('SELECT ID FROM user WHERE Email = "' + email + '"', (error, rows, fields) => {
=======
router.get('/studentenhuis/:huisId?/maaltijd/:maaltijdId?/deelnemers', function(req, res, next) {

    const huisId = req.params.huisId || '';
    const maaltijdId = req.params.maaltijdId || '';

    db.query('SELECT Voornaam, Achternaam, Email FROM view_deelnemers WHERE StudentenhuisID = ? AND MaaltijdID =?', [huisId, maaltijdId], (error, rows, fields) => {
>>>>>>> 67f2e2f6165c12b40f6ed9af65d8bf8c561f78bd
        if (error) {
            res.status(500).json(error.toString())
        } else {

<<<<<<< HEAD
            console.log(rows)
            // res.status(200);
            // var string = JSON.stringify(rows);
            // console.log(string)
            // var json = JSON.parse(string);

            // var x = json[0];

            // var UserId = x["ID"];

            // db.query('INSERT INTO `deelnemers` (UserID, StudentenhuisID, MaaltijdID) VALUES (?,?,?)', [UserId, huisId, maaltijdId])



            // db.query('SELECT StudentenhuisID, MaaltijdID FROM `view_deelnemers` WHERE Email = "' + email + '"', (error, rows, fields) =>{
            //     if(error){
            //         res.status(500).json(error.toString())       
            //     }
            // })

            //
            // db.query('SELECT StudentenhuisID FROM `view_deelnemers` WHERE Email = "' + email + '"', (error, rows, fields) =>{
            //     if(error){
            //         res.status(500).json(error.toString())
            //     } else {
            //         res.status(200)
            //         var string = JSON.stringify(rows)
            //
            //         var json = JSON.parse(string)
            //
            //         var x = json[0]
            //
            //         var StudentenhuisID = x["StudentenhuisID"]
        }
    })
})
=======
            if (rows.length > 0) {
                res.status(200).json(rows)
            }

            else{
                res.status(500).json("Niet gevonden (huisId of maaltijdId bestaat niet)")
            }


        }
    })
});
>>>>>>> 67f2e2f6165c12b40f6ed9af65d8bf8c561f78bd

router.delete('/studentenhuis/:huisId?/maaltijd/:maaltijdId?/deelnemers', function(req, res, next) {

    const huisId = req.params.huisId || '';
    const maaltijdId = req.params.maaltijdId || '';
    var email;
    var UserId;


    var token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {

        var string = JSON.stringify(payload)

        var json = JSON.parse(string)

        email = json.sub;


    });

    db.query('SELECT ID FROM user WHERE Email = "' + email + '"', (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            res.status(200)
            var string = JSON.stringify(rows)

            var json = JSON.parse(string)

            var x = json[0]

            UserId = x["ID"]


            db.query("SET FOREIGN_KEY_CHECKS = 0")
            db.query('DELETE FROM deelnemers WHERE StudentenhuisID = ? AND MaaltijdID = ? AND UserID = ?', [huisId, maaltijdId, UserId], (error, rows, fields) => {
                if (huisId == '' || maaltijdId == '') {
                    res.status(500).json("Vul een HuisId en maaltijdId in")

                }

                 else if (rows.affectedRows == 0) {
                     res.status(500).json("Niet gevonden (huisId of maaltijdId bestaat niet of geen toegang)")
                 }

                else if (error) {
                    res.status(500).json(error.toString())

                } else {
                    res.status(200).json("Verwijdering gelukt")
                }
            })
        }
    })
})






module.exports = router;