var express = require('express'),
    upload  =  require('../upload'),
    async   = require('async'),
    path    = require('path'),
    receipt = require('../receipt'),
    router  = express.Router();

router.get('/', function(req, res, next) {
    return res.sendFile(path.join(__dirname, '../index.html'));
});

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
