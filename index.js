var config      = require('./config.json');
var http        = require('http');
var express     = require('express');
var bodyParser 	= require('body-parser');


// Create the application
var app = express();

app.set('PORT', config.webPort);
app.set('SECRET_KEY', config.secretkey);

//
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

//
app.all('*', function(req, res, next){
    console.log( req.method + " " + req.url);
    next();
});

// Middleware statische bestanden (HTML, CSS, images)
app.use(express.static(__dirname + '/public'));

// Routing with versions
app.use('/apiv1', require('./routes/routes_apiv1'));
app.use('/apiv2', require('./routes/routes_apiv2'));

// Start the server
const port = process.env.PORT || app.get('PORT');

app.listen(port, () => {
    console.log('The magic happens at http://localhost:'+ port);
});

module.exports = app;