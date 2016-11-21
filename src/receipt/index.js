'use strict';
let request = require('request'),
    config  = require('config'),
    fs      = require('fs'),
    pantry = {},
    receipt,
    store;

store = {
    data: JSON.parse(fs.readFileSync('./store.json', 'utf8')),
    get: function(upc) {
        return store.data[upc];
    }
};

receipt = {
    /**
     * getPantry
     * @param  {String} token
     * @return {Promise(pantry)}
     */
    getPantry: function(token) {
        if (!pantry[token])
            return Promise.reject({
                code: 400,
                message: 'No pantry for that token.'
            });

        return Promise.resolve(pantry[token]);
    },
    /**
     * analyze
     * Sends an image to CloudVision OCR
     * @param  {String} id file name/id
     * @param  {String} token
     * @return {Promise(upcData)}
     */
    analyze: function(id, token) {
        let params = {
                'subscription-key': config.get('vision.key')
            },
            body = {
                url: config.get('url') + id
            },
            call = {
                method: 'POST',
                url: config.get('vision.api'),
                headers: {
                    'Content-Type': 'application/json'
                },
                qs: params,
                body: JSON.stringify(body)
            };

        return new Promise(function(resolve, reject) {
            request(call, function(err, response, body) {
                if (err) return reject();

                let data = receipt.process(JSON.parse(body));
                data.url = config.get('url') + id;

                if (!pantry[token]) pantry[token] = [];
                pantry[token].unshift(data);

                resolve(pantry[token]);

                if (data.items.length == 0) {
                    pantry[token].shift();
                }
            });
        });
    },
    /**
     * process
     * Extracts upc codes from ocr object
     * @param  {Object} data CloudVision data
     * @return {Object}
     */
    process: function(data) {
        let values = { upcs: [], items: [] };

        data.regions.forEach(function(region) {
            region.lines.forEach(function(line) {
                addUpcCodes(line);
            });
        });

        function addUpcCodes(line) {
            line.words.forEach(function(word) {
                let text = word.text;
                // check if word is valid upc format
                if (!isNaN(text) && (text.length == 7 || text.length == 12)) {
                    let item = store.get(text);
                    values.upcs.push(text);
                    if (item) values.items.push(item);
                }
            });
        }

        if (values.upcs.length != 0) {
            if (values.upcs[0].length == 7) {
                values.store = 'Target';
            } else {
                values.store = 'Walmart';
            }
        }

        values.date = new Date();
        values.size = values.items.length;
        return values;
    }
};

module.exports = receipt;
