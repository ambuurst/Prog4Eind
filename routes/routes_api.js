
const express = require('express');
const router = express.Router();
const auth =  require('../auth/authentication');
const db = require('../db/mysql-connector');

////// Catch all except login //////

router.all( new RegExp("[^(\/login|\register)]"), function (req, res, next) {

    console.log("VALIDATE TOKEN");

    const token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {
        if (err) {

            console.log('Error handler: ' + err.message);
            res.status((err.status || 401 )).json({error: new Error("Niet geautoriseerd (geen valid token)").message});
        } else {
            next();
        }
    });
});


////// Login with {"email":"<email>", "password":"<password>"} //////

router.route('/login')

    .post( function(req, res) {

        const email = req.body.email || '';
        const password = req.body.password || '';

        db.query('SELECT Password FROM user WHERE Email = ?', [email] , function (error, result, fields) {
            if (error) {
                res.status(500).json(error.toString())
            } else if(email === '' || password === '') {
                res.status(412).json({"message":"Een of meer properties in de request body ontbreken of zijn foutief", "code":"412", "datetime":new Date().toLocaleString()})
                
                
            } else if (result.length > 0) {

                console.log(result)

                const string = JSON.stringify(result);

                const json = JSON.parse(string);

                const x = json[0];

                const Password = x["Password"];

                console.log(Password);

                if(Password === password){
                    res.status(200).json({"token" : auth.encodeToken(email), "email" : email});
                } else{
                    res.status(401).json({"message":"Een of meer properties in de request body ontbreken of zijn foutief", "code":"401", "datetime":new Date().toLocaleString()})
                }

                console.log(Password)
            }
            else {
                res.status(412).json({"message":"Een of meer properties in de request body ontbreken of zijn foutief", "code":"412", "datetime":new Date().toLocaleString()})
            }
        });
});

 ////// Register //////

router.route('/register')

    .post( function(req, res) {

        //
        // Get body params or ''
        //
        const username = req.body.username;
        const lastname = req.body.lastname;
        const email = req.body.email;
        const password = req.body.password;

        if(username === '' || lastname === '' || email === '' || password === ''){
            res.status(412).json({"message":"Een of meer properties in de request body ontbreken of zijn foutief", "code":"412", "datetime":new Date().toLocaleString()})


        }
        else if (username.length < 2 || lastname.length < 2){
            res.status(412).json({"message":"Een of meer properties in de request body ontbreken of zijn foutief", "code":"412", "datetime":new Date().toLocaleString()})
        } else{
        const query = {
            sql: 'INSERT INTO `user`(Voornaam, Achternaam, Email, Password) VALUES (?,?,?,?)',
            values: [username, lastname, email, password],
            timeout: 2000
        };

        db.query( query, (error, rows, fields) => {
            if (error) {
                res.status(500).json(error.toString())
            } else {
                res.status(200).json({"token" : auth.encodeToken(username), "username" : username})
            }
        })
    }});


////// Post api/studentenhuis //////

router.post('/studentenhuis', (req, res, next) => {

    const naam = req.body.naam;
    const adres = req.body.adres;
    let email;
    let UserId;

    console.log(adres)
    if(naam === '' || adres === ''){
        res.status(412).json({"message":"Een van de velden kan niet leeg zijn", "code":"412", "datetime":new Date().toLocaleString()})

    } else{

    const token = (req.header('X-Access-Token')) || '';



    auth.decodeToken(token, (err, payload) => {

            const string = JSON.stringify(payload);

            const json = JSON.parse(string);

             email = json.sub;

             console.log(email)
    });

    db.query('SELECT ID FROM user WHERE Email = "' + email + '"', (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            res.status(200);
            const string = JSON.stringify(rows);

            const json = JSON.parse(string);

            const x = json[0];

            UserId = x["ID"];

            db.query('INSERT INTO `studentenhuis`(Naam, Adres, UserID) VALUES (?, ?, ?)', [naam, adres, UserId], (error, rows, fields) => {

                if (error) {
                    res.status(500).json(error.toString())
                } else {

                    res.status(200).json("toevoegen voltooid")
                }

                    })
                }
            })
        }
    })



////// Get api/studentenhuis //////

router.get('/studentenhuis', function(req, res, next) {

    db.query('SELECT * FROM view_studentenhuis', (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            res.status(200).json(rows)
        }

    })
});

////// Get api/studentenhuis/{huisId} //////

router.get('/studentenhuis/:huisId?', function(req, res, next) {

    const huisId = req.params.huisId || '';
    console.log(huisId)

    db.query('SELECT * FROM view_studentenhuis WHERE ID = ?', [huisId], (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            if (rows.length > 0) {
                res.status(200).json(rows)
            }

            else{
                res.status(404).json({"message":"Niet gevonden (huisId bestaat niet)", "code":"404", "datetime":new Date().toLocaleString()})
            }
        }
    })
});

////// Put api/studentenhuis/{huisId} //////

router.put('/studentenhuis/:huisId?', function(req, res, next) {

    const huisId = req.params.huisId;

    if(huisId === ''){
        res.status(412).json({"message":"Een van de velden kan niet leeg zijn", "code":"412", "datetime":new Date().toLocaleString()})
    } else{

    db.query('SELECT * FROM view_studentenhuis WHERE ID = ?', [huisId], (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            if (rows.length > 0) {
                res.status(200).json(rows)
            }

            else{
                res.status(404).json({"message":"Niet gevonden (huisId bestaat niet)", "code":"404", "datetime":new Date().toLocaleString()})
            }
        }
    })
}});

////// Delete api/studentenhuis/{huisId} //////

router.delete('/studentenhuis/:huisId?', function(req, res, next) {

    const huisId = req.params.huisId || '';

    db.query("SET FOREIGN_KEY_CHECKS = 0");
    db.query('DELETE FROM studentenhuis WHERE ID = ?', [huisId], (error, rows, fields) => {

        if (huisId === ''){
            res.status(412).json({"message":"Vul een huisId in", "code":"412", "datetime":new Date().toLocaleString()})
        }

        else if (rows.affectedRows === 0){
            res.status(404).json({"message":"Niet gevonden (huisId bestaat niet)", "code":"404", "datetime":new Date().toLocaleString()})
        }

        else if (error) {
            res.status(500).json(error.toString())

        } else {
                res.status(200).json("Verwijdering gelukt")
            }
    })
});

////// Post api/studentenhuis/{huisId}/maaltijd //////

router.post('/studentenhuis/:huisId?/maaltijd', function (req, res, next) {
    const naam = req.body.naam;
    const beschrijving = req.body.beschrijving;
    const ingredienten = req.body.ingredienten;
    const allergie = req.body.allergie;
    const prijs = req.body.prijs;
    const huisId = req.params.huisId || '';

    if(naam === '' || beschrijving === '' || ingredienten === '' || allergie === '' || prijs === ''){
        res.status(412).json({"message":"Een van de velden kan niet leeg zijn", "code":"412", "datetime":new Date().toLocaleString()})
    } else {

    const token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {

        const string = JSON.stringify(payload);

        const json = JSON.parse(string);

        email = json.sub;
    });
    console.log(email);

    db.query('SELECT ID FROM user WHERE Email = "' + email + '"', (error, rows, fields) => {


        if (error) {
            res.status(500).json(error.toString())
        } else {
            res.status(200);
            const string = JSON.stringify(rows);

            const json = JSON.parse(string);

            const x = json[0];

            const UserId = x["ID"];

            db.query("SET FOREIGN_KEY_CHECKS = 0");

            db.query('INSERT INTO `maaltijd` (Naam, Beschrijving, Ingredienten, Allergie, Prijs, UserID, StudentenhuisID) VALUES (?,?,?,?,?,?,?)', [naam, beschrijving, ingredienten, allergie, prijs, UserId, huisId ], (error, rows, fields) => {

                if (error) {
                    res.status(500).json(error.toString())
                }

                else {
                    db.query('SELECT ID, Naam, Beschrijving, Ingredienten, Allergie, Prijs FROM maaltijd WHERE Naam = "' + naam + '" AND Beschrijving = "' + beschrijving + '"', (error, rows, fields) =>
                    {
                        res.status(200).json(rows);
                        console.log(rows)
                    })
                }
            });
        }
    })



}});

////// Get api/studentenhuis/{huisId}/maaltijd //////

router.get('/studentenhuis/:huisId?/maaltijd', function(req, res, next) {
    const huisId = req.params.huisId || '';

    db.query('SELECT ID, Naam, Beschrijving, Ingredienten, Allergie, Prijs FROM maaltijd WHERE ID = ?', [huisId], (error, rows, fields) => {

        if (error) {
            res.status(500).json(error.toString())
        }

        else {
            if (rows.length > 0) {
                res.status(200).json(rows)
            }

            else{
                res.status(404).json({"message":"Niet gevonden (huisId bestaat niet)", "code":"404", "datetime":new Date().toLocaleString()})
            }
        }
    })
});

////// Get api/studentenhuis/{huisId}/maaltijd/{maaltijdId} //////

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

////// Put api/studentenhuis/{huisId}/maaltijd/{maaltijdId} //////

router.put('/studentenhuis/:huisId?/maaltijd/:maaltijdId?', function(req, res, next) {

    const huisId = req.params.huisId;
    const maaltijdId = req.params.maaltijdId;
    const naam = req.body.naam;
    const beschrijving = req.body.beschrijving;
    const ingredienten = req.body.ingredienten;
    const allergie = req.body.allergie;
    const prijs = req.body.prijs;
    let email;
    let UserId;

    if(huisId === '' || maaltijdId === '' || naam === '' || beschrijving === '' || ingredienten === '' || allergie === '' || prijs === ''){
        res.status(412).json({"message":"Een van de velden kan niet leeg zijn", "code":"412", "datetime":new Date().toLocaleString()})
    }

    else{
    console.log(naam);

    const token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {

        const string = JSON.stringify(payload);

        const json = JSON.parse(string);

        email = json.sub;
    });

    db.query('SELECT ID FROM user WHERE Email = "' + email + '"', (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            res.status(200);
            const string = JSON.stringify(rows);

            const json = JSON.parse(string);

            const x = json[0];

            UserId = x["ID"];

            const query = {
                sql: 'UPDATE `maaltijd` SET Naam = ?, Beschrijving = ?, Ingredienten = ?, Allergie = ?, Prijs = ?  WHERE ID = ? AND UserID = ? AND StudentenhuisID = ?',
                values: [naam, beschrijving, ingredienten, allergie, prijs, maaltijdId, UserId, huisId],
                timeout: 2000
            };
            db.query(query, (error, rows, fields) => {
              if (rows.affectedRows === 0) {
                  res.status(404).json({"message":"Niet gevonden (huisId bestaat niet)", "code":"404", "datetime":new Date().toLocaleString()})
                }

                else if (error) {
                    res.status(500).json(error.toString())

                }

                else if (db.query('SELECT UserID FROM maaltijd WHERE ID = "' + huisId + '"') === UserId) {

                    res.status(200).json("Toevoeging gelukt")
                }

                else {
                  res.status(409).json({"message":"U mag deze data niet veranderen", "code":"409", "datetime":new Date().toLocaleString()})
              }
            })
        }
    })
}});

////// Delete api/studentenhuis/{huisId}/maaltijd/{maaltijdId} //////

router.delete('/studentenhuis/:huisId?/maaltijd/:maaltijdId?', function(req, res, next) {

    const huisId = req.params.huisId || '';
    const maaltijdId = req.params.maaltijdId || '';
    let email;
    let UserId;


    const token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {

        const string = JSON.stringify(payload);

        const json = JSON.parse(string);

        email = json.sub;


    });

    db.query('SELECT ID FROM user WHERE Email = "' + email + '"', (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            res.status(200);
            const string = JSON.stringify(rows);

            const json = JSON.parse(string);

            const x = json[0];

            UserId = x["ID"];


            db.query("SET FOREIGN_KEY_CHECKS = 0");
            db.query('DELETE FROM maaltijd WHERE StudentenhuisID = ? AND ID =? AND UserID = ?', [huisId, maaltijdId, UserId], (error, rows, fields) => {

                if (huisId === '' || maaltijdId === '') {
                    res.status(412).json({"message":"Een van de velden kan niet leeg zijn", "code":"412", "datetime":new Date().toLocaleString()})
                }

                else if (rows.affectedRows === 0) {
                    res.status(404).json({"message":"Niet gevonden (huisId of maaltijdId bestaat niet)", "code":"404", "datetime":new Date().toLocaleString()})
                }

                else if (error) {
                    res.status(500).json(error.toString())

                }

                else {

                    res.status(200).json("Verwijdering gelukt")
                }
            })
        }
    })
});

////// Post api/studentenhuis/{huisId}/maaltijd/{maaltijdId}/deelnemers //////

router.post('/studentenhuis/:huisId?/maaltijd/:maaltijdId?/deelnemers', function(req, res, next) {
    const huisId = req.params.huisId;
    const maaltijdId = req.params.maaltijdId;
    let Email;
    let UserId;


    const token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {

        const string = JSON.stringify(payload);

        const json = JSON.parse(string);

        email = json.sub;

        console.log(email)

    });

    db.query('SELECT ID FROM user WHERE Email = "' + Email + '"', (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            res.status(200);
            const string = JSON.stringify(rows);

            const json = JSON.parse(string);

            const x = json[0];

            UserId = x["ID"];

            //console.log(UserId)

            db.query('SELECT UserID FROM deelnemers WHERE UserID = ?', [UserId], (error, rows, fields) => {
                console.log(rows.affectedRows);

                if (rows) {

                    console.log('werkt');

                    db.query("SET FOREIGN_KEY_CHECKS = 0");
                    db.query('INSERT INTO deelnemers (UserID, StudentenhuisID, MaaltijdID) VALUES (?,?,?)', [UserId, huisId, maaltijdId]);
                    {
                        if (huisId === '' || maaltijdId === '') {
                            res.status(500).json("Vul een HuisId en maaltijdId in")
                        }

                        else if (rows.affectedRows === 0) {
                            res.status(404).json({"message":"Niet gevonden (huisId of maaltijdId bestaat niet)", "code":"404", "datetime":new Date().toLocaleString()})
                        }

                        else if (error) {
                            res.status(500).json(error.toString())

                        } else {
                            console.log(rows)
                            db.query('SELECT Voornaam, Achternaam, Email FROM user WHERE ID = "' + UserId + '"', (error, rows, fields ) => {
                                const string = JSON.stringify(rows);

                                const json = JSON.parse(string);

                                console.log(json)

                                res.status(200).json(json)
                            });

                        }
                    }

                } else {
                    res.status(409).json({"message":"Gebruiker is al aangemeld", "code":"409", "datetime":new Date().toLocaleString()})
                }
            })
        }
    })
});

////// Delete api/studentenhuis/{huisId}/maaltijd/{maaltijdId}/deelnemers //////

router.delete('/studentenhuis/:huisId?/maaltijd/:maaltijdId?/deelnemers', function(req, res, next) {

    const huisId = req.params.huisId || '';
    const maaltijdId = req.params.maaltijdId || '';
    let email;
    let UserId;

    const token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {

        const string = JSON.stringify(payload);

        const json = JSON.parse(string);

        email = json.sub;
    });

    db.query('SELECT ID FROM user WHERE Email = "' + email + '"', (error, rows, fields) => {
        if (error) {
            res.status(500).json(error.toString())
        } else {
            res.status(200);
            const string = JSON.stringify(rows);

            const json = JSON.parse(string);

            const x = json[0];

            UserId = x["ID"];

            db.query("SET FOREIGN_KEY_CHECKS = 0");
            db.query('DELETE FROM deelnemers WHERE StudentenhuisID = ? AND MaaltijdID = ? AND UserID = ?', [huisId, maaltijdId, UserId], (error, rows, fields) => {
                if (huisId === '' || maaltijdId === '') {
                    res.status(412).json({"message":"Een van de velden kan niet leeg zijn", "code":"412", "datetime":new Date().toLocaleString()})
                }

                 else if (rows.affectedRows === 0) {
                    res.status(404).json({"message":"Niet gevonden (huisId of maaltijdId bestaat niet)", "code":"404", "datetime":new Date().toLocaleString()})
                 }

                else if (error) {
                    res.status(500).json(error.toString())

                }
                else {
                    res.status(200).json("Verwijdering gelukt")
                }
            })
        }
    })
});

////// Get api/studentenhuis/{huisId}/maaltijd/{maaltijdId}/deelnemers //////

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
                res.status(404).json({"message":"Niet gevonden (huisId of maaltijdId bestaat niet)", "code":"404", "datetime":new Date().toLocaleString()})
            }
        }
    })
});




module.exports = router;