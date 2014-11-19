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

var client = github.client(accessToken);
var getEvents = function(callback) {
    client.get('/events', {}, function(err, status, body, headers) {
        callback(err, body);
    });
};

var compareEvents = function(event, other) {
    return event.id === other.id;
};

var relayEvent = function(event) {
    console.log([event.id, event.type, event.created_at].join("\t"));
    io.emit(event.type.toLowerCase(), event);
};

var getInfo = function(req, res) {
    dns.lookup(os.hostname(), function (err, addr, fam) {
        res.json({
            "address": addr,
            "hostname": os.hostname(),
            "port": port,
        });
    })
};

app.use(express.static(__dirname + '/public'));
app.get('/info', getInfo);
http.listen(port);

Bacon.interval(pollInterval)
     .flatMap(function() { return Bacon.fromNodeCallback(getEvents); })
     .flatMap(Bacon.fromArray)
     .onValue(relayEvent);
