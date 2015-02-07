'use strict';
var request = require('request');

module.exports = function(accessToken) {
    var options = {
        url: 'https://api.github.com/events',
        headers: {
            'User-Agent': 'OGHHR',
            'Authorization': 'token ' + accessToken,
            'If-None-Match': '""'
        }
    };
    var log = {
        ratelimit: {
            limit: 5000,
            remaining: 0,
            reset: 0
        },
        events: 0,
        requests: 0
    };
    var parseInfo = function(headers, events) {
            options.headers['If-None-Match'] = headers.etag;
            log.ratelimit.limit = headers['x-ratelimit-limit'];
            log.ratelimit.remaining = headers['x-ratelimit-remaining'];
            log.ratelimit.reset = headers['x-ratelimit-reset'] * 1000;

            log.events += events.length;
    };
    return {
        getEvents: function(callback) {
            log.requests += 1;
            request(options, function(error, response, body) {
                if(error) {
                    console.error(error);
                }
                if(response.statusCode === 304) {
                    callback([]);
                }
                if(response.statusCode === 200) {
                    var events = JSON.parse(body);
                    parseInfo(response.headers, events);
                    callback(events);
                }
            });
        },
        getInfo: function() {
            return log;
        }
    };
};
