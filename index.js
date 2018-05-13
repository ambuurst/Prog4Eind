var config      = require('./config.json');
var http        = require('http');
var express     = require('express');

// Create the application
var app = express();

app.all('*', function(req, res, next){
    console.log( req.method + " " + req.url);
    next();
});

app.get('/api/v1/hello', function(req, res, next) {
    res.contentType('application/json');
    res.json( {"msg":"Hello to you all !! Have a nice NodeJS day."} );
});

// Middleware statische bestanden (HTML, CSS, images)
app.use(express.static(__dirname + '/public'));

// Routing with versions
app.use('/apiv1', require('./routes/routes_apiv1'));
app.use('/apiv2', require('./routes/routes_apiv2'));

// Start the server
var port = 8080;

app.listen(port, function() {
    console.log('The magic happens at http://localhost:' + port);
});

module.exports = app;