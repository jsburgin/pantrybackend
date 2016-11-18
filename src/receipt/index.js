'use strict';
let request = require('request'),
    config  = require('config'),
    fs      = require('fs'),
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
     * analyze
     * Sends an image to CloudVision OCR
     * @param  {String} id file name/id
     * @return {Promise(upcData)}
     */
    analyze: function(id) {
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

                return resolve(data);
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
                let text = word.text,
                    upcLengths = config.get('upcLengths');

                // check if word is valid upc format
                if (!isNaN(text) && upcLengths.indexOf(text.length) != -1)
                    values.upcs.push(text);
            });
        }

        values.size = values.upcs.length;

        values.upcs.forEach(upc) {
            let item = store.get(upc);
            if (item) values.items.push(item);
        }

        return values;
    }
};

module.exports = receipt;
