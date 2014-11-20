var github = require('octonode');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Bacon = require('baconjs').Bacon;

var args = process.argv.slice(2);
var accessToken = args[0];
var pollInterval = args[1] || 1000;
var port = args[2] || 3000;

var dns = require('dns');
var os = require('os');

var ratelimit = 0;
var remaining = 0;
var reset = 0;
var requestsSent = 0;
var eventsReceived = 0;
var duplicates = 0;
var client = github.client(accessToken);

var getEvents = function(callback) {
    requestsSent += 1;
    client.get('/events', {}, function(err, status, body, headers) {
        if(!err) {
            ratelimit = headers['x-ratelimit-limit'];
            remaining = headers['x-ratelimit-remaining'];
            reset = headers['x-ratelimit-reset'] * 1000;
            eventsReceived += body.length;
        }
        callback(err, body);
    });
};

var compareEvents = function(event, other) {
    return event.id === other.id;
};

var relayInfo = function() {
    io.emit("info", {
        "ratelimit": ratelimit,
        "remaining": remaining,
        "poll_interval": pollInterval,
        "reset": reset,
        "duplicates": duplicates,
    });

};

var previousIds = {};
var removeDuplicates = function(event) {
    if(event.id in previousIds) {
        duplicates += 1;
        previousIds[event.id] += 1;
        return false;
    } else {
        previousIds[event.id] = 1;
        return true;
    }
};

var relayEvent = function(event) {
    console.log([event.id, event.type,
                 event.created_at, previousIds[event.id]
                ].join("\t"));
    io.emit(event.type.toLowerCase(), event);
};

var getInfo = function(req, res) {
    dns.lookup(os.hostname(), function (err, addr, fam) {
        res.json({
            "address": addr,
            "hostname": os.hostname(),
            "port": port,
            "ratelimit": ratelimit,
            "remaining": remaining,
            "poll_interval": pollInterval,
            "requests_sent": requestsSent,
            "events_received": eventsReceived,
            "reset": reset,
            "duplicates": duplicates,
        });
    });
};
app.use(express.static(__dirname + '/public'));
app.get('/info', getInfo);
http.listen(port);

Bacon.interval(1000).onValue(relayInfo);
Bacon.interval(pollInterval)
     .flatMap(function() { return Bacon.fromNodeCallback(getEvents); })
     .flatMap(Bacon.fromArray)
     .filter(removeDuplicates)
     .onValue(relayEvent);
