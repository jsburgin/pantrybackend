'use strict';
let express    = require('express'),
    bodyParser = require('body-parser'),
    path       = require('path'),
    routes     = require('./routes/index'),
    app        = express();


app.use(bodyParser.json());
app.use('/', routes);

app.use(function(req, res, next) {
    return res.status(404).send('404.');
});

app.listen(process.env.PORT || '8080');
