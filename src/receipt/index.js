'use strict';
let request = require('request'),
    config  = require('config'),
    receipt;

receipt = {
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

                return resolve(receipt.process(JSON.parse(body)));
            });
        });
    },
    process: function(data) {
        let values = {
            upcs: []
        };

        data.regions.forEach(function(region) {
            region.lines.forEach(function(line) {
                processLine(line);
            });
        });

        function processLine(line) {
            line.words.forEach(function(word) {
                let text = word.text;
                if (!isNaN(text) && text.length == 9)
                    values.upcs.push(text);
            });
        }

        values.size = values.upcs.length;

        return values;
    }
};

module.exports = receipt;
