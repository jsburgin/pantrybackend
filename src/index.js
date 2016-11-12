'use strict';
var express    = require('express'),
    bodyParser = require('body-parser'),
    multer     = require('multer'),
    path       = require('path'),
    routes     = require('./routes/index'),
    app        = express();


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'static')));
app.use('/', routes);

app.use(function(req, res, next) {
    return res.status(404).send('404.');
});

app.listen('3000');
