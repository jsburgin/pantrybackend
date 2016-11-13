'use strict';

let express = require('express'),
    multer  = require('multer'),
    config  = require('config'),
    async   = require('async'),
    path    = require('path'),
    receipt = require('../receipt'),
    router  = express.Router(),
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
 * Route: /api/pantry
 * Receives a receipt image and returns extracted upc codes
 */
router.post('/api/pantry', upload.single('receipt'), function(req, res, next) {
    receipt.analyze(req.file.filename)
        .then(function(data) {
            return res.json(data);
        })
        .catch(function(err) {
            return res.status(500).send('Unable to process receipt.');
        });
});

module.exports = router;
