'use strict';

let express      = require('express'),
    multer       = require('multer'),
    config       = require('config'),
    async        = require('async'),
    path         = require('path'),
    randomstring = require('randomstring'),
    receipt      = require('../receipt'),
    router       = express.Router(),
    tokens  = [],
    storage,
    upload;

/**
 * Initialize multer and disk storage
 */
storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config.get('uploadDir'));
    }
});

upload = multer({ storage: storage });

/**
 * Route: /
 * Provides a test form to upload receipts
 */
router.get('/', function(req, res, next) {
    return res.sendFile(path.join(__dirname, '../index.html'));
});

/**
 * Route: /api/token
 * Provides a unique token for the client
 */
router.get('/api/token', function(req, res, next) {
    function getToken() {
        let token = randomstring.generate();
        if (tokens.indexOf(token) == -1) {
            tokens.push(token);
            return token;
        }
        return getToken();
    }

    return res.json({
        token: getToken()
    });
});

/**
 * Route: /api/pantry
 */
router.get('/api/pantry', function(req, res, next) {
    if (!req.query.token) {
        return res.status(401).send('Please provide a valid token.');
    }

    receipt.getPantry(req.query.token)
        .then(function(pantry) {
            return res.json(pantry);
        })
        .catch(function(err) {
            return res.status(err.code).send(err.message);
        });
});

/**
 * Route: /api/receipt
 * Receives a receipt image and returns extracted upc codes
 */
router.post('/api/receipt', upload.single('receipt'), function(req, res, next) {

    if (!req.file) {
        return res.status(400).send('Please include a valid receipt image.');
    }

    if (!req.body.token) {
        return res.status(401).send('Please provide valid token.');
    }

    receipt.analyze(req.file.filename, req.body.token)
        .then(function(data) {
            return res.json(data);
        })
        .catch(function(err) {
            return res.status(500).send('Unable to process receipt.');
        });
});

module.exports = router;
