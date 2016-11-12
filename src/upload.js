var multer  = require('multer'),
    config  = require('config'),
    path    = require('path'),
    storage;

storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, config.get('uploadDir')));
    }
});

module.exports = multer({ storage: storage });
